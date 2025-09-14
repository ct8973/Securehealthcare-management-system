// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../services/api"; // axios instance
// import DashboardLayout from "../../layouts/DashboardLayout";

// export default function AddPatient() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     username: "",
//     password: "",
//     firstName: "",
//     lastName: "",
//     dateOfBirth: "",
//     phone: "",
//     email: "",
//     gender: "",
//     disease: "", // ✅ New field
//     address: {
//       line1: "",
//       line2: "",
//       city: "",
//       state: "",
//       postalCode: "",
//       country: "",
//     },
//     mrn: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     // Handle nested address fields
//     if (name.startsWith("address.")) {
//       const field = name.split(".")[1];
//       setForm((prev) => ({
//         ...prev,
//         address: { ...prev.address, [field]: value },
//       }));
//     } else {
//       setForm((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrorMsg("");
//     setLoading(true);

//     try {
//       await api.post("/patients", form);
//       navigate("/patients"); // Redirect to patients list after success
//     } catch (err) {
//       setErrorMsg(err.response?.data?.error || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const menuItems = [
//     { label: "Patients", path: "/patients" },
//     { label: "Add Patient", path: "/patients/add" },
//   ];

//   return (
//     <DashboardLayout title="Add New Patient" menuItems={menuItems}>
//       <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
//         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
//           {/* Username */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Username</label>
//             <input
//               type="text"
//               name="username"
//               value={form.username}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
//               required
//             />
//           </div>

//           {/* Password */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Password</label>
//             <input
//               type="password"
//               name="password"
//               value={form.password}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
//               required
//             />
//           </div>

//           {/* First Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">First Name</label>
//             <input
//               type="text"
//               name="firstName"
//               value={form.firstName}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
//               required
//             />
//           </div>

//           {/* Last Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Last Name</label>
//             <input
//               type="text"
//               name="lastName"
//               value={form.lastName}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
//               required
//             />
//           </div>

//           {/* Date of Birth */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
//             <input
//               type="date"
//               name="dateOfBirth"
//               value={form.dateOfBirth}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
//               required
//             />
//           </div>

//           {/* Phone */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Phone</label>
//             <input
//               type="text"
//               name="phone"
//               value={form.phone}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
//             />
//           </div>

//           {/* Email */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Email</label>
//             <input
//               type="email"
//               name="email"
//               value={form.email}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
//             />
//           </div>

//           {/* Gender */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Gender</label>
//             <select
//               name="gender"
//               value={form.gender}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
//             >
//               <option value="">Select</option>
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//               <option value="other">Other</option>
//             </select>
//           </div>

//           {/* ✅ Disease */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Disease</label>
//             <input
//               type="text"
//               name="disease"
//               value={form.disease}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
//               placeholder="e.g. Diabetes, Asthma, etc."
//             />
//           </div>

//           {/* Address Line 1 */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
//             <input
//               type="text"
//               name="address.line1"
//               value={form.address.line1}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
//             />
//           </div>

//           {/* Address Line 2 */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
//             <input
//               type="text"
//               name="address.line2"
//               value={form.address.line2}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
//             />
//           </div>

//           {/* City */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">City</label>
//             <input
//               type="text"
//               name="address.city"
//               value={form.address.city}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
//             />
//           </div>

//           {/* State */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">State</label>
//             <input
//               type="text"
//               name="address.state"
//               value={form.address.state}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
//             />
//           </div>

//           {/* Postal Code */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Postal Code</label>
//             <input
//               type="text"
//               name="address.postalCode"
//               value={form.address.postalCode}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
//             />
//           </div>

//           {/* Country */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Country</label>
//             <input
//               type="text"
//               name="address.country"
//               value={form.address.country}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
//             />
//           </div>

//           {/* MRN */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700">MRN</label>
//             <input
//               type="text"
//               name="mrn"
//               value={form.mrn}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2"
//             />
//           </div>
//         </form>

//         {/* Error message */}
//         {errorMsg && <p className="text-red-500 text-sm mt-3">{errorMsg}</p>}

//         {/* Submit Button */}
//         <div className="mt-6 flex justify-end">
//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow font-medium"
//           >
//             {loading ? "Saving..." : "Save Patient"}
//           </button>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }
