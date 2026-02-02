import axios from "axios";

// Use environment variable or fallback to localhost
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  // Keep this true if you ever use cookies, but we will primarily rely on the header now
  withCredentials: true, 
});

// ✅ 1. REQUEST INTERCEPTOR: Attaches the token to every outgoing request
axiosInstance.interceptors.request.use(
  (config) => {
    // Grab the token from storage
    const token = localStorage.getItem("token");
    
    // If token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 2. RESPONSE INTERCEPTOR: Handles 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.warn("Session expired or unauthorized. Redirecting to login.");
      
      // Clear storage so the app knows we are logged out
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      
      // Redirect
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;