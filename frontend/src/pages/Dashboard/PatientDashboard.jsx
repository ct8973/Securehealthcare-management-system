// src/pages/Dashboard/PatientDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../api/http";
import { logout } from "../../api/auth";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showBookModal, setShowBookModal] = useState(false);
  
  // Form state for booking appointments
  const [specialty, setSpecialty] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  // Fetch user and patient data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user data
        const userResponse = await http.get("/auth/me");
        setUserData(userResponse.data.user);
        
        // Fetch patient data based on user ID
        // const patientResponse = await http.get(`/user/patients/${userResponse.data.user.id}`);
        setPatientData(patientResponse.data);
        
        // Fetch appointments
        const apptResponse = await http.get(`/user/appointments/patient/${patientResponse.data._id}`);
        setAppointments(apptResponse.data);
        
        // Fetch medical records
        const recordsResponse = await http.get(`/patients/${patientResponse.data._id}/records`);
        setMedicalRecords(recordsResponse.data);
        
        // Fetch prescriptions
        const prescriptionsResponse = await http.get(`/prescriptions/patient/${patientResponse.data._id}`);
        setPrescriptions(prescriptionsResponse.data);
        
      } catch (err) {
        setError("Failed to load patient data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const appointmentData = {
        patientId: patientData._id,
        doctorId: doctor,
        date: new Date(`${date}T${time}`).toISOString(),
        reason,
        status: "scheduled"
      };
      
      await http.post("/appointments", appointmentData);
      setShowBookModal(false);
      
      // Refresh appointments
      const apptResponse = await http.get(`/appointments/patient/${patientData._id}`);
      setAppointments(apptResponse.data);
      
    } catch (err) {
      setError("Failed to book appointment: " + err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for display
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Loading your health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-800">HealthPortal</span>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <button 
                  onClick={() => setActiveTab("dashboard")}
                  className={`${activeTab === "dashboard" ? "border-blue-500 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab("appointments")}
                  className={`${activeTab === "appointments" ? "border-blue-500 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Appointments
                </button>
                <button 
                  onClick={() => setActiveTab("records")}
                  className={`${activeTab === "records" ? "border-blue-500 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Medical Records
                </button>
                <button 
                  onClick={() => setActiveTab("prescriptions")}
                  className={`${activeTab === "prescriptions" ? "border-blue-500 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Prescriptions
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <div className="mr-4 text-right">
                <p className="text-sm font-medium text-gray-900">{patientData?.firstName} {patientData?.lastName}</p>
                <p className="text-xs text-gray-500">Patient ID: {patientData?.mrn}</p>
              </div>
              <div className="ml-3 relative">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center">
                  <span className="text-gray-700 font-medium">
                    {patientData?.firstName?.charAt(0)}{patientData?.lastName?.charAt(0)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-4 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>



      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard View */}
        {activeTab === "dashboard" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
                <p className="mt-2 text-gray-600">Here's an overview of your health information.</p>
              </div>
              <button
                onClick={() => setShowBookModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Book Appointment
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Appointments</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {appointments.filter(a => a.status === 'scheduled').length}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Medical Records</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {medicalRecords.length}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Prescriptions</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {prescriptions.length}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Appointments</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Your scheduled medical visits</p>
              </div>
              <div className="divide-y divide-gray-200">
                {appointments.filter(a => a.status === 'scheduled').slice(0, 3).map(appt => (
                  <div key={appt._id} className="px-4 py-5 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-medium text-blue-600">{appt.doctor?.name || 'Dr. Smith'}</p>
                        <p className="text-sm text-gray-500">{appt.doctor?.specialty || 'General Practice'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">{formatDate(appt.date)}</p>
                        <p className="text-sm text-gray-500">{formatTime(appt.date)}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Reason:</span> {appt.reason || 'Routine checkup'}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Location:</span> {appt.location || 'Main Hospital, Room 305'}
                      </p>
                    </div>
                  </div>
                ))}
                {appointments.filter(a => a.status === 'scheduled').length === 0 && (
                  <div className="px-4 py-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-4 text-gray-500">No upcoming appointments scheduled</p>
                  </div>
                )}
              </div>
              {appointments.filter(a => a.status === 'scheduled').length > 3 && (
                <div className="bg-gray-50 px-4 py-4 sm:px-6 text-right">
                  <button 
                    onClick={() => setActiveTab("appointments")}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    View all appointments →
                  </button>
                </div>
              )}
            </div>

            {/* Recent Medical Records */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Medical Records</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Your latest health documents</p>
              </div>
              <div className="divide-y divide-gray-200">
                {medicalRecords.slice(0, 3).map(record => (
                  <div key={record._id} className="px-4 py-5 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-medium text-gray-900">{record.title}</p>
                        <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
                      </div>
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {record.type}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Doctor:</span> {record.doctor?.name || 'Dr. Johnson'}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Summary:</span> {record.summary || 'Routine examination with normal results'}
                      </p>
                    </div>
                  </div>
                ))}
                {medicalRecords.length === 0 && (
                  <div className="px-4 py-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-4 text-gray-500">No medical records found</p>
                  </div>
                )}
              </div>
              {medicalRecords.length > 3 && (
                <div className="bg-gray-50 px-4 py-4 sm:px-6 text-right">
                  <button 
                    onClick={() => setActiveTab("records")}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    View all records →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Your Appointments</h1>
                <p className="mt-2 text-gray-600">All your scheduled medical visits</p>
              </div>
              <button
                onClick={() => setShowBookModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Book New Appointment
              </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Appointment History</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {appointments.length > 0 ? (
                  appointments.map(appt => (
                    <div key={appt._id} className="px-4 py-5 sm:px-6 hover:bg-gray-50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="mb-4 md:mb-0">
                          <p className="text-lg font-medium text-gray-900">{appt.doctor?.name || 'Dr. Smith'}</p>
                          <p className="text-sm text-gray-500">{appt.doctor?.specialty || 'General Practice'}</p>
                        </div>
                        <div className="mb-4 md:mb-0">
                          <p className="text-lg font-medium text-gray-900">{formatDate(appt.date)}</p>
                          <p className="text-sm text-gray-500">{formatTime(appt.date)}</p>
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                            appt.status === 'scheduled' 
                              ? 'bg-blue-100 text-blue-800' 
                              : appt.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appt.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Reason:</span> {appt.reason || 'Routine checkup'}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Location:</span> {appt.location || 'Main Hospital, Room 305'}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Notes:</span> {appt.notes || 'No additional notes'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-4 text-gray-500">No appointments found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Medical Records Tab */}
        {activeTab === "records" && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
              <p className="mt-2 text-gray-600">Your complete health history</p>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Health Documents</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {medicalRecords.length > 0 ? (
                  medicalRecords.map(record => (
                    <div key={record._id} className="px-4 py-5 sm:px-6 hover:bg-gray-50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="mb-4 md:mb-0">
                          <p className="text-lg font-medium text-gray-900">{record.title}</p>
                          <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
                        </div>
                        <div>
                          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {record.type}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Doctor:</span> {record.doctor?.name || 'Dr. Johnson'}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Summary:</span> {record.summary || 'Routine examination with normal results'}
                        </p>
                        <div className="mt-3">
                          <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Details
                          </button>
                          <button className="ml-3 inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-4 text-gray-500">No medical records found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === "prescriptions" && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Your Prescriptions</h1>
              <p className="mt-2 text-gray-600">Current and past medications</p>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Medication List</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {prescriptions.length > 0 ? (
                  prescriptions.map(prescription => (
                    <div key={prescription._id} className="px-4 py-5 sm:px-6 hover:bg-gray-50">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="mb-4 md:mb-0">
                          <p className="text-lg font-medium text-gray-900">{prescription.medication}</p>
                          <p className="text-sm text-gray-500">{prescription.dosage} · {prescription.frequency}</p>
                        </div>
                        <div>
                          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {prescription.status || 'Active'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Prescribed by:</span> {prescription.doctor?.name || 'Dr. Johnson'}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Start Date:</span> {formatDate(prescription.startDate)}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Refills:</span> {prescription.refills || '0'} remaining
                        </p>
                        <div className="mt-3">
                          <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Request Refill
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <p className="mt-4 text-gray-500">No prescriptions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Book New Appointment</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Schedule your next medical visit</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleBookAppointment} className="mt-5 sm:mt-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                      Specialty
                    </label>
                    <select
                      id="specialty"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value="">Select a specialty</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="dermatology">Dermatology</option>
                      <option value="orthopedics">Orthopedics</option>
                      <option value="pediatrics">Pediatrics</option>
                      <option value="neurology">Neurology</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">
                      Doctor
                    </label>
                    <select
                      id="doctor"
                      value={doctor}
                      onChange={(e) => setDoctor(e.target.value)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value="">Select a doctor</option>
                      <option value="doc1">Dr. Sarah Johnson (Cardiology)</option>
                      <option value="doc2">Dr. Michael Chen (Dermatology)</option>
                      <option value="doc3">Dr. Emily Rodriguez (Orthopedics)</option>
                      <option value="doc4">Dr. James Wilson (Pediatrics)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                        Time
                      </label>
                      <input
                        type="time"
                        id="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                      Reason for Visit
                    </label>
                    <textarea
                      id="reason"
                      rows="3"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Please describe the reason for your visit..."
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                  >
                    Book Appointment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}