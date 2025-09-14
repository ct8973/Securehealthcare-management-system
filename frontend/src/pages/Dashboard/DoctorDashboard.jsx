// src/pages/Dashboard/DoctorDashboard.jsx
import React, { useState, useEffect } from "react";
import { http } from "../../api/http";
import { logout } from "../../api/auth";

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("patients");

  // Patient form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("male");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [mrn, setMrn] = useState("");

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  // Fetching appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await http.get("/appointments");
      setAppointments(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  // Fetching patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data } = await http.get("/patients");
      setPatients(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  // Add new patient handler
  const handleAddPatient = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Create patient profile
      await http.post("/patients", {
        firstName,
        lastName,
        dateOfBirth,
        phone,
        email,
        gender,
        address: { line1, city, state, postalCode, country },
        mrn,
      });

      // Close modal and refresh patient list
      setShowModal(false);
      fetchPatients();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to add patient");
    }
  };

  // Reset form fields
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setDateOfBirth("");
    setPhone("");
    setEmail("");
    setGender("male");
    setLine1("");
    setCity("");
    setState("");
    setPostalCode("");
    setCountry("");
    setMrn("");
  };

  // Handle logout
const handleLogout = () => {
  // Remove the JWT token from localStorage (or sessionStorage)
  localStorage.removeItem('token');

  // Redirect to login page or reset the app state if needed
  window.location.href = '/login';  // Redirect to login page (using history.push() can also work)
};

  // Filter today's appointments
  const todaysAppointments = appointments.filter(app => {
    const appDate = new Date(app.date);
    const today = new Date();
    return appDate.toDateString() === today.toDateString();
  });

  // Filter upcoming appointments
  const upcomingAppointments = appointments.filter(app => {
    const appDate = new Date(app.date);
    const today = new Date();
    return appDate > today && appDate.toDateString() !== today.toDateString();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-teal-600 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500">Doctor Dashboard</h1>
              <p className="text-xs text-gray-400">Welcome back, Dr.</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 flex items-center">
            <div className="bg-teal-600 p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Patients</p>
              <p className="text-2xl font-bold">{patients.length}</p>
            </div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 flex items-center">
            <div className="bg-blue-600 p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Today's Appointments</p>
              <p className="text-2xl font-bold">{todaysAppointments.length}</p>
            </div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 flex items-center">
            <div className="bg-indigo-600 p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Upcoming Appointments</p>
              <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 text-red-100 p-3 rounded-lg flex items-center animate-fadeIn">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'patients' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('patients')}
          >
            Patients
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'appointments' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'schedule' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule
          </button>
        </div>

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-700 p-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Patient Management</h2>
                <p className="text-sm text-gray-400">Manage your patient records</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Patient
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">DOB</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Gender</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">MRN</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {patients.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-800 transition-colors duration-150">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="bg-gray-700 border border-gray-600 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium">{p.firstName} {p.lastName}</p>
                              <p className="text-xs text-gray-400">{p.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : ''}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{p.phone}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            p.gender === 'male' 
                              ? 'bg-blue-900/30 text-blue-300' 
                              : p.gender === 'female' 
                                ? 'bg-purple-900/30 text-purple-300' 
                                : 'bg-gray-700 text-gray-300'
                          }`}>
                            {p.gender}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-teal-300">{p.mrn}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button className="text-blue-400 hover:text-blue-300 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="text-teal-400 hover:text-teal-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {patients.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2">No patient records found</p>
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Appointments */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-700 p-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Today's Appointments
                </h2>
              </div>
              <div className="p-4">
                {todaysAppointments.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No appointments scheduled for today
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todaysAppointments.map(app => {
                      const appDate = new Date(app.date);
                      const timeString = appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      
                      // Find patient
                      const patient = patients.find(p => p._id === app.patient);
                      const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown';
                      
                      return (
                        <div key={app._id} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 hover:border-teal-500 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{patientName}</p>
                              <p className="text-sm text-gray-400">{app.reason || 'Regular Checkup'}</p>
                            </div>
                            <span className="bg-teal-900/30 text-teal-300 px-2 py-1 rounded-full text-xs">
                              {timeString}
                            </span>
                          </div>
                          <div className="flex items-center mt-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm text-gray-400">Exam Room 3</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-700 p-4">
                <h2 className="text-lg font-semibold flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Upcoming Appointments
                </h2>
              </div>
              <div className="p-4">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No upcoming appointments
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map(app => {
                      const appDate = new Date(app.date);
                      const dateString = appDate.toLocaleDateString();
                      const timeString = appDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      
                      // Find patient
                      const patient = patients.find(p => p._id === app.patient);
                      const patientName = patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown';
                      
                      return (
                        <div key={app._id} className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{patientName}</p>
                              <p className="text-sm text-gray-400">{app.reason || 'Follow-up Visit'}</p>
                            </div>
                            <span className="bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded-full text-xs">
                              {dateString}
                            </span>
                          </div>
                          <div className="flex justify-between mt-3">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm text-gray-400">{timeString}</span>
                            </div>
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-sm text-gray-400">Room 2</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden p-6">
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-xl font-semibold mt-4">Weekly Schedule</h3>
              <p className="text-gray-400 mt-2">View and manage your weekly schedule</p>
              <button className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors">
                View Full Schedule
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Add New Patient</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddPatient} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold text-teal-400 mb-3 pb-1 border-b border-gray-700">PERSONAL INFORMATION</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">First Name *</label>
                      <input
                        type="text"
                        placeholder="First Name"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Last Name *</label>
                      <input
                        type="text"
                        placeholder="Last Name"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Gender *</label>
                      <select
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                      <input
                        type="text"
                        placeholder="Phone"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Medical Record Number (MRN)</label>
                      <input
                        type="text"
                        placeholder="MRN"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={mrn}
                        onChange={(e) => setMrn(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold text-teal-400 mb-3 pb-1 border-b border-gray-700">ADDRESS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Address Line 1</label>
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={line1}
                        onChange={(e) => setLine1(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                      <input
                        type="text"
                        placeholder="City"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                      <input
                        type="text"
                        placeholder="State"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Postal Code</label>
                      <input
                        type="text"
                        placeholder="Postal Code"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                      <input
                        type="text"
                        placeholder="Country"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}