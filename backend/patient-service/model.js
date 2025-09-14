const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    dateOfBirth: { type: Date, },
    phone: { type: String, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    mrn: { type: String, trim: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

PatientSchema.index({ lastName: 1, firstName: 1, dateOfBirth: 1 });

module.exports = mongoose.model('Patient', PatientSchema);
