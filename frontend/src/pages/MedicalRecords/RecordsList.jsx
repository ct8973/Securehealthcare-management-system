// src/pages/MedicalRecords/RecordList.jsx
import React, { useState, useEffect } from "react";
import { http } from "../../api/http";
import { useNavigate, useParams } from "react-router-dom";

export default function RecordList() {
  const { patientId } = useParams();
  const [records, setRecords] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch patient details
        const patientRes = await http.get(`/patients/${patientId}`);
        setPatient(patientRes.data);
        
        // Fetch records
        const recordsRes = await http.get(`/patients/${patientId}/records`);
        setRecords(recordsRes.data);
        
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [patientId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-cyan-500">
            Medical Records
          </h1>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Patient Summary Card */}
        {patient && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-500 p-4">
              <h2 className="text-xl font-bold text-white">Patient Information</h2>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{patient.firstName} {patient.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">
                  {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium capitalize">{patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">MRN</p>
                <p className="font-mono font-medium">{patient.mrn || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200 p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Medical Records</h2>
            <button 
              className="flex items-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
              onClick={() => navigate(`/patients/${patientId}/records/new`)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Record
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : records.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Diagnosis</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Treatment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{record.diagnosis}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-500">{record.treatment}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {record.doctorName || "Dr. Smith"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => navigate(`/patients/${patientId}/records/${record._id}`)}
                          className="text-teal-600 hover:text-teal-900 mr-3"
                        >
                          View Details
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2">No medical records found</p>
              <button 
                onClick={() => navigate(`/patients/${patientId}/records/new`)}
                className="mt-4 text-teal-600 hover:text-teal-800 flex items-center justify-center mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create first record
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}