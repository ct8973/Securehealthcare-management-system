// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { http } from "../../api/http";
import { logout } from "../../api/auth";

export default function AdminDashboard() {
  // Existing patient states
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeToday: 0,
    appointments: 0
  });

  // Appointment states
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [filter, setFilter] = useState({
    status: "all",
    dateRange: "today"
  });
  
  // Form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

  // Appointment form fields
  const [apptPatientId, setApptPatientId] = useState("");
  const [apptDoctorId, setApptDoctorId] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [apptTime, setApptTime] = useState("");
  const [apptDuration, setApptDuration] = useState(30);
  const [apptStatus, setApptStatus] = useState("scheduled");
  const [apptReason, setApptReason] = useState("");
  const [apptNotes, setApptNotes] = useState("");

  // Fetch patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data } = await http.get("/patients");
      setPatients(data);
      setStats(prev => ({...prev, totalPatients: data.length}));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors - FIXED ENDPOINT
// src/pages/AdminDashboard.jsx (updated fetchDoctors function)
const fetchDoctors = async () => {
  try {
    setLoadingDoctors(true);
    // Dummy doctors implementation
    const dummyDoctors = [
      { _id: 'doc1', firstName: 'Amanda', lastName: 'Doe' },
      { _id: 'doc2', firstName: 'ChidoChedu', lastName: 'Takawira' },
      { _id: 'doc3', firstName: 'Robert', lastName: 'Johnson' }
    ];
    setDoctors(dummyDoctors);
  } catch (err) {
    console.error("Failed to fetch doctors:", err);
    // Fallback to extracted doctors from appointments if needed
    const uniqueDoctors = appointments.reduce((acc, appt) => {
      if (appt.doctorUserId && appt.doctorName) {
        acc[appt.doctorUserId] = {
          _id: appt.doctorUserId,
          firstName: appt.doctorName.split(' ')[0],
          lastName: appt.doctorName.split(' ')[1] || ''
        };
      }
      return acc;
    }, {});
    setDoctors(Object.values(uniqueDoctors));
  } finally {
    setLoadingDoctors(false);
  }
};
  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      let url = "/appointments";
      let query = [];
      
      if (filter.status !== "all") {
        query.push(`status=${filter.status}`);
      }
      
      if (filter.dateRange === "today") {
        const today = new Date();
        const start = new Date(today.setHours(0,0,0,0)).toISOString();
        const end = new Date(today.setHours(23,59,59,999)).toISOString();
        query.push(`from=${start}`, `to=${end}`);
      } else if (filter.dateRange === "week") {
        const today = new Date();
        const start = new Date(today.setDate(today.getDate() - today.getDay()));
        const end = new Date(today.setDate(today.getDate() + 6));
        query.push(`from=${start.toISOString()}`, `to=${end.toISOString()}`);
      }
      
      if (query.length) {
        url += `?${query.join('&')}`;
      }
      
      const { data } = await http.get(url);
      setAppointments(data);
    } catch (err) {
      setError("Failed to fetch appointments: " + err.message);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchPatients();
    fetchAppointments();
    
    // Set initial stats
    setStats({
      totalPatients: 42,
      activeToday: 12,
      appointments: 7
    });
  }, []);

  // Re-fetch appointments when filter changes
  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  // Fetch doctors after appointments are loaded
  useEffect(() => {
    if (appointments.length > 0) {
      fetchDoctors();
    }
  }, [appointments]);

  // Handle adding/editing appointments
  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    
    try {
      const dateTime = new Date(`${apptDate}T${apptTime}`);
      
      const appointmentData = {
        patientId: apptPatientId,
        doctorUserId: apptDoctorId,
        date: dateTime.toISOString(),
        durationMinutes: apptDuration,
        status: apptStatus,
        reason: apptReason,
        notes: apptNotes
      };
      
      if (currentAppointment) {
        // Update existing appointment
        await http.put(`/appointments/${currentAppointment._id}`, appointmentData);
      } else {
        // Create new appointment
        await http.post("/appointments", appointmentData);
      }
      
      fetchAppointments();
      closeAppointmentModal();
    } catch (err) {
      setError("Appointment error: " + (err.response?.data?.error || err.message));
    }
  };

  // Handle deleting appointment
  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    
    try {
      await http.delete(`/appointments/${id}`);
      fetchAppointments();
    } catch (err) {
      setError("Delete failed: " + err.message);
    }
  };

  // Open appointment modal for editing
  const openEditAppointment = (appointment) => {
    setCurrentAppointment(appointment);
    
    // Set form fields from appointment data
    const date = new Date(appointment.date);
    setApptPatientId(appointment.patientId?._id || "");
    setApptDoctorId(appointment.doctorUserId?._id || "");
    setApptDate(date.toISOString().split('T')[0]);
    setApptTime(date.toTimeString().substring(0, 5));
    setApptDuration(appointment.durationMinutes);
    setApptStatus(appointment.status);
    setApptReason(appointment.reason || "");
    setApptNotes(appointment.notes || "");
    
    setShowAppointmentModal(true);
  };

  // Open appointment modal for creating
  const openNewAppointment = () => {
    setCurrentAppointment(null);
    
    // Reset form fields
    const now = new Date();
    setApptPatientId("");
    setApptDoctorId("");
    setApptDate(now.toISOString().split('T')[0]);
    setApptTime(now.toTimeString().substring(0, 5));
    setApptDuration(30);
    setApptStatus("scheduled");
    setApptReason("");
    setApptNotes("");
    
    setShowAppointmentModal(true);
  };

  // Close appointment modal
  const closeAppointmentModal = () => {
    setShowAppointmentModal(false);
    setCurrentAppointment(null);
  };

  // Existing patient functions
  const handleAddPatient = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await http.post("/patients", {
        username,
        password,
        firstName,
        lastName,
        dateOfBirth,
        phone,
        email,
        gender,
        address: { line1, city, state, postalCode, country },
        mrn,
      });

      setShowAddModal(false);
      resetForm();
      fetchPatients();
    } catch (err) {
      console.error("Error adding patient:", err);
      setError(err.response?.data?.error || err.message || "Failed to add patient");
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
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

const handleLogout = () => {
  // Remove the JWT token from localStorage (or sessionStorage)
  localStorage.removeItem('token');

  // Redirect to login page or reset the app state if needed
  window.location.href = '/login';  // Redirect to login page (using history.push() can also work)
};

  const viewRecords = (patient) => {
    setSelectedPatient(patient);
    fetchPatientRecords(patient._id);
    setShowRecordsModal(true);
  };

  const closeRecordsModal = () => {
    setShowRecordsModal(false);
    setSelectedPatient(null);
    setPatientRecords([]);
  };

  // Fetch patient records
  const fetchPatientRecords = async (patientId) => {
    try {
      setLoadingRecords(true);
      const { data } = await http.get(`/patients/${patientId}/records`);
      setPatientRecords(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch records");
    } finally {
      setLoadingRecords(false);
    }
  };

  // Memoized doctor list for better performance
  const doctorOptions = useMemo(() => {
    if (doctors.length > 0) {
      return doctors.map(doctor => (
        <option key={doctor._id} value={doctor._id}>
          Dr. {doctor.firstName} {doctor.lastName}
        </option>
      ));
    }
    
    return <option disabled>No doctors available</option>;
  }, [doctors]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-indigo-600 p-2 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-700 text-red-100 p-3 rounded-lg flex items-center animate-fadeIn">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 flex items-center hover:bg-gray-800 transition-all duration-300">
            <div className="bg-indigo-600 p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Patients</p>
              <p className="text-2xl font-bold">{stats.totalPatients}</p>
            </div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 flex items-center hover:bg-gray-800 transition-all duration-300">
            <div className="bg-green-600 p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Today</p>
              <p className="text-2xl font-bold">{stats.activeToday}</p>
            </div>
          </div>
          
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 flex items-center hover:bg-gray-800 transition-all duration-300">
            <div className="bg-blue-600 p-3 rounded-lg mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Appointments</p>
              <p className="text-2xl font-bold">{appointments.length}</p>
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold">Appointment Management</h2>
              <p className="text-gray-400 text-sm">Schedule and manage patient appointments</p>
            </div>
            <div className="flex gap-3">
              <div className="flex gap-2 bg-gray-800/50 p-1 rounded-lg">
                <button 
                  onClick={() => setFilter({...filter, dateRange: "today"})}
                  className={`px-3 py-1 rounded-md ${filter.dateRange === "today" ? "bg-indigo-600" : "hover:bg-gray-700"}`}
                >
                  Today
                </button>
                <button 
                  onClick={() => setFilter({...filter, dateRange: "week"})}
                  className={`px-3 py-1 rounded-md ${filter.dateRange === "week" ? "bg-indigo-600" : "hover:bg-gray-700"}`}
                >
                  This Week
                </button>
                <button 
                  onClick={() => setFilter({...filter, dateRange: "all"})}
                  className={`px-3 py-1 rounded-md ${filter.dateRange === "all" ? "bg-indigo-600" : "hover:bg-gray-700"}`}
                >
                  All
                </button>
              </div>
              <button
                onClick={openNewAppointment}
                className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-indigo-500/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Appointment
              </button>
            </div>
          </div>

          {/* Appointments Table */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden mb-8">
            {loadingAppointments ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Doctor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Reason</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {appointments.map((appt) => {
                      const apptDate = new Date(appt.date);
                      
                      return (
                        <tr key={appt._id} className="hover:bg-gray-800 transition-colors duration-150">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium">
                              {apptDate.toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {appt.patientName || "Unknown"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {appt.doctorName || "Unknown"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {appt.durationMinutes} mins
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              appt.status === 'scheduled' 
                                ? 'bg-blue-900/30 text-blue-300' 
                                : appt.status === 'completed' 
                                  ? 'bg-green-900/30 text-green-300'
                                  : 'bg-red-900/30 text-red-300'
                            }`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm max-w-xs truncate">
                            {appt.reason || "N/A"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button
                              onClick={() => openEditAppointment(appt)}
                              className="mr-2 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteAppointment(appt._id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {appointments.length === 0 && !loadingAppointments && (
              <div className="text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2">No appointments found</p>
                <button 
                  onClick={openNewAppointment}
                  className="mt-3 text-indigo-400 hover:text-indigo-300 flex items-center justify-center mx-auto"
                >
                  Schedule first appointment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Patients Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold">Patient Management</h2>
            <p className="text-gray-400 text-sm">Manage all patient records and information</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-indigo-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Patient
          </button>
        </div>

        {/* Patients Table */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">First Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Last Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">DOB</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Gender</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">MRN</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {patients.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-800 transition-colors duration-150">
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{p.firstName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{p.lastName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {p.dateOfBirth
                          ? new Date(p.dateOfBirth).toLocaleDateString()
                          : ""}
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
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-indigo-300">{p.mrn}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button
                          onClick={() => viewRecords(p)}
                          className="flex items-center text-teal-400 hover:text-teal-300 mr-2 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Records
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
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Add New Patient</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddPatient} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Info */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold text-indigo-400 mb-3 pb-1 border-b border-gray-700">ACCOUNT INFORMATION</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Username *</label>
                      <input
                        type="text"
                        placeholder="Username"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Password *</label>
                      <input
                        type="password"
                        placeholder="Password"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold text-indigo-400 mb-3 pb-1 border-b border-gray-700">PERSONAL INFORMATION</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">First Name *</label>
                      <input
                        type="text"
                        placeholder="First Name"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Gender *</label>
                      <select
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="Email"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Medical Record Number (MRN)</label>
                      <input
                        type="text"
                        placeholder="MRN"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={mrn}
                        onChange={(e) => setMrn(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold text-indigo-400 mb-3 pb-1 border-b border-gray-700">ADDRESS</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Address Line 1</label>
                      <input
                        type="text"
                        placeholder="Address Line 1"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={line1}
                        onChange={(e) => setLine1(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                      <input
                        type="text"
                        placeholder="City"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                      <input
                        type="text"
                        placeholder="State"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Postal Code</label>
                      <input
                        type="text"
                        placeholder="Postal Code"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                      <input
                        type="text"
                        placeholder="Country"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200 flex items-center"
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

      {/* Patient Records Modal */}
      {showRecordsModal && selectedPatient && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn"
          onClick={closeRecordsModal}
        >
          <div 
            className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Medical Records: {selectedPatient.firstName} {selectedPatient.lastName}
              </h3>
              <button 
                onClick={closeRecordsModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Patient Summary */}
            <div className="p-6 border-b border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">MRN</p>
                  <p className="font-mono text-indigo-300">{selectedPatient.mrn}</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Date of Birth</p>
                  <p>{selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : "N/A"}</p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Gender</p>
                  <p className="capitalize">{selectedPatient.gender}</p>
                </div>
              </div>
            </div>

            {/* Records Section */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Medical History</h4>
                <button className="flex items-center text-indigo-400 hover:text-indigo-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Record
                </button>
              </div>

              {loadingRecords ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                </div>
              ) : patientRecords.length > 0 ? (
                <div className="space-y-4">
                  {patientRecords.map((record, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-700/30 border border-gray-600 rounded-xl p-4 hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-lg">{record.title}</h5>
                          <p className="text-sm text-gray-400">{new Date(record.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          record.status === 'completed' 
                            ? 'bg-green-900/30 text-green-300' 
                            : record.status === 'pending'
                              ? 'bg-yellow-900/30 text-yellow-300'
                              : 'bg-blue-900/30 text-blue-300'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-300">{record.description}</p>
                      <div className="mt-3 flex space-x-2">
                        <button className="text-sm bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded-lg transition-colors">
                          View Details
                        </button>
                        <button className="text-sm bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded-lg transition-colors">
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2">No medical records found</p>
                  <button className="mt-4 text-indigo-400 hover:text-indigo-300 flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add first record
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-4 flex justify-end">
              <button
                onClick={closeRecordsModal}
                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50 animate-fadeIn"
          onClick={closeAppointmentModal}
        >
          <div 
            className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {currentAppointment ? "Edit Appointment" : "New Appointment"}
              </h3>
              <button 
                onClick={closeAppointmentModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveAppointment} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Patient *</label>
                  <select
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={apptPatientId}
                    onChange={(e) => setApptPatientId(e.target.value)}
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
                
                {/* Doctor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Doctor *</label>
                  <select
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={apptDoctorId}
                    onChange={(e) => setApptDoctorId(e.target.value)}
                    required
                  >
                    <option value="">Select a doctor</option>
                    {doctorOptions}
                    {loadingDoctors && (
                      <option disabled>Loading doctors...</option>
                    )}
                  </select>
                  {doctors.length === 0 && !loadingDoctors && (
                    <p className="text-red-400 text-xs mt-1">
                      Could not load doctors. Please check backend connection.
                    </p>
                  )}
                </div>
                
                {/* Date & Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date *</label>
                  <input
                    type="date"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Time *</label>
                  <input
                    type="time"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={apptTime}
                    onChange={(e) => setApptTime(e.target.value)}
                    required
                  />
                </div>
                
                {/* Duration & Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Duration (minutes) *</label>
                  <select
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={apptDuration}
                    onChange={(e) => setApptDuration(Number(e.target.value))}
                    required
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status *</label>
                  <select
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={apptStatus}
                    onChange={(e) => setApptStatus(e.target.value)}
                    required
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                {/* Reason & Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Reason</label>
                  <input
                    type="text"
                    placeholder="Appointment reason"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={apptReason}
                    onChange={(e) => setApptReason(e.target.value)}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                  <textarea
                    placeholder="Additional notes"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    value={apptNotes}
                    onChange={(e) => setApptNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={closeAppointmentModal}
                  className="px-5 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {currentAppointment ? "Update Appointment" : "Create Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}