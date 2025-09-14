// src/api/http.js
import axios from "axios";
import { getToken, clearToken } from "./token";

// Create axios instance
export const http = axios.create({
  baseURL: "http://localhost:5000", // API Gateway URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor → attach token automatically
http.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → handle unauthorized globally
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized — logging out.");
      clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
