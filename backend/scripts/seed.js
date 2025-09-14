require ('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../auth-service/model');
const Patient = require('../patient-service/model');
const Appointment = require('../appointment-service/model');

async function run() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthcare';
  await mongoose.connect(MONGO_URI);

  // wipe soft-deleted noise for clean demo
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Appointment.deleteMany({}),
  ]);

  // Users
  const admin = await User.create({
    username: 'admin',
    password: await bcrypt.hash('Admin#12345', 10),
    role: 'admin',
  });

  const doctor = await User.create({
    username: 'drhouse',
    password: await bcrypt.hash('Doctor#12345', 10),
    role: 'doctor',
  });

  const patientUser = await User.create({
    username: 'janedoe',
    password: await bcrypt.hash('Patient#12345', 10),
    role: 'patient',
  });

  // Patient profile linked to patient user
  const patient = await Patient.create({
    userId: patientUser._id,
    firstName: 'Jane',
    lastName: 'Doe',
    dateOfBirth: new Date('1990-05-10'),
    phone: '+15551239',
    email: 'jane@example.com',
    gender: 'female',
    mrn: 'MRN-1001',
  });

  // Appointments
  const now = new Date();
  const today9  = new Date(now); today9.setHours(9, 0, 0, 0);
  const today11 = new Date(now); today11.setHours(11, 0, 0, 0);

  await Appointment.create({
    patientId: patient._id,
    doctorUserId: doctor._id,
    date: today9,
    durationMinutes: 30,
    status: 'scheduled',
    reason: 'Initial consultation',
    notes: 'Bring previous lab results',
  });

  await Appointment.create({
    patientId: patient._id,
    doctorUserId: doctor._id,
    date: today11,
    durationMinutes: 30,
    status: 'scheduled',
    reason: 'Follow-up',
  });

  console.log('Seed complete:');
  console.log('- admin / Admin#12345');
  console.log('- drhouse (doctor) / Doctor#12345');
  console.log('- janedoe (patient) / Patient#12345');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
