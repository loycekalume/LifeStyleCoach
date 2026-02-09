import axios from "axios";

// Use environment variable or fallback to localhost
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Critical for sending the Refresh Token cookie
});

//  1. REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//  2. RESPONSE INTERCEPTOR (Fixed Logic)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried to prevent infinite loops

      try {
       
        const refreshResponse = await axiosInstance.post("/auth/refresh-token"); 

        const newAccessToken = refreshResponse.data.accessToken;

        // 2. Update Local Storage
        localStorage.setItem("token", newAccessToken);

        // 3. Update the header for the failed request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 4. Retry the original request with the new token
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // 5. If refresh fails (Refresh token expired too), THEN logout
        console.warn("Session expired. Redirecting to login.");
        
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;