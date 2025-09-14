// src/router/AppRouter.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import DoctorDashboard from "../pages/Dashboard/DoctorDashboard";
import PatientDashboard from "../pages/Dashboard/PatientDashboard";
import AppointmentsList from "../pages/Appointments/AppointmentsList";
import AppointmentForm from "../pages/Appointments/AppointmentForm";
import RecordsList from "../pages/MedicalRecords/RecordsList";
import RecordUpload from "../pages/MedicalRecords/RecordUpload";
import NotFound from "../pages/NotFound";


export default function AppRouter() {
  return (
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboards */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/patient" element={<PatientDashboard />} />

        {/* Appointments */}
        <Route path="/appointments" element={<AppointmentsList />} />
        <Route path="/appointments/new" element={<AppointmentForm />} />

        {/* Medical Records */}
        <Route path="/records" element={<RecordsList />} />
        <Route path="/records/upload" element={<RecordUpload />} />

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
}
