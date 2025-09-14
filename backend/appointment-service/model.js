// backend/appointment-service/model.js
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', index: true },
    doctorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

    // Legacy fields (kept for backward compatibility)
    patientName: { type: String, trim: true },
    doctorName: { type: String, trim: true },

    date: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, default: 30, min: 5, max: 480 },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
    reason: { type: String, trim: true },
    notes: { type: String, trim: true },

    // Soft delete
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

AppointmentSchema.index({ doctorUserId: 1, date: 1 });
AppointmentSchema.index({ patientId: 1, date: 1 });

module.exports = mongoose.model('Appointment', AppointmentSchema);
