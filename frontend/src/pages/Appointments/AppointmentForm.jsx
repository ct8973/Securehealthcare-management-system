// src/pages/Appointments/AppointmentForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../api/http";

export default function AppointmentForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    patientOption: "existing", // "existing" or "new"
    patientId: "",
    patientName: "",
    doctorUserId: "",
    date: "",
    durationMinutes: 30,
    status: "scheduled",
    reason: "",
    notes: ""
  });

  // Fetch doctors and patients
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch doctors
        const doctorsRes = await http.get("/users?role=doctor");
        setDoctors(doctorsRes.data);
        
        // Fetch patients
        const patientsRes = await http.get("/patients");
        setPatients(patientsRes.data);
        
      } catch (err) {
        setError("Failed to load data: " + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      setLoading(true);
      
      // Prepare appointment data
      const appointmentData = {
        doctorUserId: formData.doctorUserId,
        date: new Date(formData.date).toISOString(),
        durationMinutes: Number(formData.durationMinutes),
        status: formData.status,
        reason: formData.reason,
        notes: formData.notes
      };
      
      // Handle patient data
      if (formData.patientOption === "existing") {
        if (!formData.patientId) {
          throw new Error("Please select a patient");
        }
        appointmentData.patientId = formData.patientId;
      } else {
        if (!formData.patientName) {
          throw new Error("Please enter patient name");
        }
        appointmentData.patientName = formData.patientName;
      }
      
      // Create appointment
      await http.post("/appointments", appointmentData);
      
      setSuccess("Appointment created successfully!");
      setTimeout(() => {
        navigate("/appointments");
      }, 1500);
      
    } catch (err) {
      console.error("Appointment creation error:", err);
      setError(err.response?.data?.error || err.message || "Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  // Get current datetime for the min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-500 p-6">
          <h1 className="text-2xl font-bold text-white">Book an Appointment</h1>
          <p className="text-teal-100">Schedule patient consultations and procedures</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Status Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </div>
          )}
          
          {/* Patient Section */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Patient Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Option
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="patientOption"
                      value="existing"
                      checked={formData.patientOption === "existing"}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-teal-600"
                    />
                    <span className="ml-2 text-gray-700">Existing Patient</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="patientOption"
                      value="new"
                      checked={formData.patientOption === "new"}
                      onChange={handleChange}
                      className="form-radio h-4 w-4 text-teal-600"
                    />
                    <span className="ml-2 text-gray-700">New Patient</span>
                  </label>
                </div>
              </div>
            </div>
            
            {formData.patientOption === "existing" ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Patient
                </label>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName} ({patient.mrn})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter patient's full name"
                  required
                />
              </div>
            )}
          </div>
          
          {/* Doctor & Time Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Doctor Selection */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Doctor Information
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Doctor
                </label>
                <select
                  name="doctorUserId"
                  value={formData.doctorUserId}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialty || "General"})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Appointment Time */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Appointment Time
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={getCurrentDateTime()}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <select
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Appointment Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit
                </label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Checkup, consultation, etc."
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Additional details about the appointment..."
              ></textarea>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center min-w-[120px]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Book Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}