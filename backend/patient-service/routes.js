const express = require('express');
const Joi = require('joi');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Patient = require('./model');
const User = require('../patient-service/model'); // Adjust if needed
const { verifyTokenMiddleware } = require('../common/jwt');
const { requireRole } = require('../common/rbac');
const sanitizeHtml = require('sanitize-html');

const router = express.Router();

// ---- Validation ----
const id24 = Joi.string().regex(/^[0-9a-fA-F]{24}$/);

// Define schema for creating a patient
const createSchema = Joi.object({
  userId: id24.allow(null),
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(1).max(100).optional(),
  lastName: Joi.string().min(1).max(100).optional(),
  dateOfBirth: Joi.date().iso().optional(),
  phone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  gender: Joi.string().valid('male', 'female', 'other').allow('', null),
  disease: Joi.string().max(200).allow('', null),
  address: Joi.object({
    line1: Joi.string().allow('', null),
    line2: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    state: Joi.string().allow('', null),
    postalCode: Joi.string().allow('', null),
    country: Joi.string().allow('', null),
  }).default({}),
  mrn: Joi.string().allow('', null),
});

// Define schema for updating a patient
const updateSchema = createSchema.min(1);

// Middleware for token verification
router.use(verifyTokenMiddleware);

// --------------------
// Create patient + linked user account
// --------------------
router.post('/', requireRole('admin', 'doctor', 'nurse', 'receptionist'), async (req, res) => {
  try {
    console.log('Incoming Request Body:', req.body);
          
    // Validate incoming request body
    if (!req.body.firstName) req.body.firstName = 'TempFirst';
    if (!req.body.lastName) req.body.lastName = 'TempLast';
    if (!req.body.dateOfBirth) req.body.dateOfBirth = '1990-01-01';
    const { value, error } = createSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(400).json({ error: 'Validation failed', details: error.details });

    // Clean the input data by removing any unwanted HTML
    cleanObject(value);

    // Check if the username already exists
    const existingUser = await User.findOne({ username: value.username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash the password for secure storage
    const hashedPassword = await bcrypt.hash(value.password, 10);

    // Create the user account
    const newUser = await User.create({
      username: value.username,
      password: hashedPassword,
      role: 'patient',
    });

    // Prepare patient data and link to the user account
    const patientData = { ...value };
    delete patientData.username; // Don't save username in patient data
    delete patientData.password; // Don't save password in patient data
    patientData.userId = newUser._id;

    // Create patient profile in the database
    const patient = await Patient.create({ ...patientData, isDeleted: false });

    // Send success response with created patient data
    res.status(201).json({ message: 'Patient and account created successfully', patient });
  } catch (err) {
    // Handle errors such as database issues
    res.status(400).json({ error: err.message });
  }
});

// --------------------
// Get all patients
// --------------------
router.get('/', requireRole('admin', 'doctor', 'nurse'), async (req, res) => {
  try {
    // Fetch all patients that are not marked as deleted
    const patients = await Patient.find({ isDeleted: false });

    // Return the list of patients in the response
    res.status(200).json(patients);
  } catch (err) {
    // Handle any server-side issues (e.g., database errors)
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// Clean input data by sanitizing HTML
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
