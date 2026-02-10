import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // This sends cookies automatically
});

// ✅ REMOVE REQUEST INTERCEPTOR - cookies are sent automatically
// No need for Authorization headers when using httpOnly cookies

// RESPONSE INTERCEPTOR
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If refresh endpoint itself fails, logout immediately
    if (originalRequest.url?.includes("/auth/refresh-token")) {
      console.warn("Refresh token failed. Redirecting to login.");
      handleLogout();
      return Promise.reject(error);
    }

    // Handle 401 errors (expired access token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh - cookies are sent automatically
        await axiosInstance.post("/auth/refresh-token");
        
        // Process queued requests
        processQueue(null);
        isRefreshing = false;
        
        // Retry original request
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        console.error("Session expired. Logging out.");
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

function handleLogout() {
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  // No need to remove "token" since we're using cookies
  window.location.href = "/login";
}

export default axiosInstance;