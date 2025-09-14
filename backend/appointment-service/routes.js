// backend/appointment-service/routes.js
const express = require('express');
const Joi = require('joi');
const mongoose = require('mongoose');
const Appointment = require('./model');
const { verifyTokenMiddleware } = require('../common/jwt');
const { requireRole } = require('../common/rbac');

// NEW: sanitize helper
const sanitizeHtml = require('sanitize-html');
function cleanObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === 'string') {
      obj[k] = sanitizeHtml(v, { allowedTags: [], allowedAttributes: {} }).trim();
    } else if (v && typeof v === 'object') {
      obj[k] = cleanObject(v);
    }
  }
  return obj;
}

const router = express.Router();

/* ------------ Validation ------------ */
const createSchema = Joi.object({
  // Prefer IDs, but allow legacy names (at least one must be present)
  patientId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  doctorUserId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  patientName: Joi.string().min(2).max(100),
  doctorName: Joi.string().min(2).max(100),

  date: Joi.date().iso().required(),
  durationMinutes: Joi.number().integer().min(5).max(480).default(30),
  status: Joi.string().valid('scheduled', 'completed', 'cancelled').default('scheduled'),
  reason: Joi.string().allow('', null),
  notes: Joi.string().allow('', null),
}).custom((value, helpers) => {
  const hasPatient = !!(value.patientId || value.patientName);
  const hasDoctor = !!(value.doctorUserId || value.doctorName);
  if (!hasPatient || !hasDoctor) {
    return helpers.error('any.custom', 'Provide patientId/patientName and doctorUserId/doctorName');
  }
  return value;
}, 'participant presence');

const updateSchema = createSchema.min(1);

/* ------------ Auth for everything ------------ */
router.use(verifyTokenMiddleware);

/* ------------ Helpers ------------ */
function toObjectId(id) {
  return mongoose.Types.ObjectId.createFromHexString(id);
}

// UPDATED: conflict check also ignores soft-deleted and enforces a small gap
async function doctorHasConflict({ doctorUserId, date, durationMinutes }) {
  if (!doctorUserId) return false;
  const start = new Date(date);
  const end = new Date(start.getTime() + (Number(durationMinutes || 30) * 60000));

  const gapMs = 15 * 60 * 1000; // 15 minute buffer

  const conflict = await Appointment.findOne({
    doctorUserId: toObjectId(doctorUserId),
    isDeleted: false,
    status: 'scheduled',
    $or: [
      // prior appt ends after (start - gap)
      {
        date: { $lte: start },
        $expr: {
          $gt: [{ $add: ['$date', { $multiply: ['$durationMinutes', 60000] }] }, new Date(start.getTime() - gapMs)]
        }
      },
      // next appt starts before (end + gap)
      {
        date: { $lt: new Date(end.getTime() + gapMs) },
        $expr: { $gte: ['$date', start] }
      },
    ],
  }).lean();

  return !!conflict;
}

/* ------------ Routes ------------ */

// Create (staff only)
router.post('/', requireRole('admin', 'doctor', 'nurse', 'receptionist'), async (req, res) => {
  try {
    const { value, error } = createSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: 'Validation failed', details: error.details });

    cleanObject(value); // NEW: sanitize free-text
    if (value.doctorUserId) {
      const conflict = await doctorHasConflict(value);
      if (conflict) return res.status(409).json({ error: 'Doctor has a conflicting appointment' });
    }

    const appt = await Appointment.create({ ...value, isDeleted: false }); // ensure flag
    res.status(201).json(appt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List (staff only; if you want patients to list their own, see note below)
router.get('/', requireRole('admin', 'doctor', 'nurse', 'receptionist'), async (req, res) => {
  try {
    const { doctorUserId, patientId, status, from, to, q } = req.query;
    const filter = { isDeleted: false }; // NEW: exclude soft-deleted
    if (doctorUserId) filter.doctorUserId = doctorUserId;
    if (patientId) filter.patientId = patientId;
    if (status) filter.status = status;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    if (q) {
      filter.$or = [
        { patientName: { $regex: q, $options: 'i' } },
        { doctorName: { $regex: q, $options: 'i' } },
        { reason: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } },
      ];
    }

    const items = await Appointment.find(filter).sort({ date: 1 }).limit(500);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Appointment.findById(req.params.id);
    if (!item || item.isDeleted) return res.status(404).json({ error: 'Not found' }); // NEW: respect soft delete
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', requireRole('admin', 'doctor', 'nurse', 'receptionist'), async (req, res) => {
  try {
    const { value, error } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: 'Validation failed', details: error.details });

    cleanObject(value); // NEW: sanitize
    if (value.doctorUserId && value.date) {
      const conflict = await doctorHasConflict(value);
      if (conflict) return res.status(409).json({ error: 'Doctor has a conflicting appointment' });
    }

    const updated = await Appointment.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false }, // NEW: avoid reviving deleted docs
      value,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE -> soft delete
router.delete('/:id', requireRole('admin', 'doctor', 'nurse', 'receptionist'), async (req, res) => {
  try {
    const removed = await Appointment.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!removed) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Restore (admin only)
router.post('/:id/restore', requireRole('admin'), async (req, res) => {
  try {
    const restored = await Appointment.findOneAndUpdate(
      { _id: req.params.id, isDeleted: true },
      { isDeleted: false },
      { new: true }
    );
    if (!restored) return res.status(404).json({ error: 'Not found or not deleted' });
    res.json(restored);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;
