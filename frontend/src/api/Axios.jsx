import axios from "axios";
import { useNavigate } from "react-router-dom";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:5000", // Change to your API Gateway URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized. Redirecting to login...");
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      // Redirect without hook
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
