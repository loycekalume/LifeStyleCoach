import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { RecommendedMeal, ApiResponse } from '../types/mealTypes';

// ✅ Create an axios instance with credentials
const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // This sends cookies with every request
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await api.post('/auth/refresh-token');
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const useMeals = () => {
  const [meals, setMeals] = useState<RecommendedMeal[]>([]);
  const [location, setLocation] = useState<string>(''); 
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyMeals = useCallback(async () => {
    setLoading(true);
    try {
      // ✅ No need for getAuthHeaders() - cookies are sent automatically
      const response = await api.get<ApiResponse<RecommendedMeal[]> & { location?: string }>(
        '/recommendedmeals/daily'
      );
      
      setMeals(response.data.data);
      
      if (response.data.location) {
        setLocation(response.data.location);
      }
      
      setError(null);
    } catch (err: any) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError(err.response?.data?.message || 'Failed to load meals.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ UPDATED: generatePlan with Geolocation Logic
  const generatePlan = async () => {
    setGenerating(true);
    setError(null);
    
    let detectedCoordinates = "";

    // 1. Try to get Geolocation
    if ("geolocation" in navigator) {
       try {
         // Ask for permission and get position
         const position = await new Promise<GeolocationPosition>((resolve, reject) => {
           navigator.geolocation.getCurrentPosition(resolve, reject);
         });
         
         // Format as a simple string the AI will understand
         detectedCoordinates = `Lat: ${position.coords.latitude}, Long: ${position.coords.longitude}`;
         
       } catch (geoError) {
         console.warn("Location access denied or failed, using profile default.");
         // Note: We don't block execution here; we simply proceed without the override
       }
    }

    try {
      // 2. Send request WITH the locationOverride
      const response = await api.post<ApiResponse<RecommendedMeal[]> & { location?: string }>(
        '/recommendedmeals/generate',
        { locationOverride: detectedCoordinates } // payload
      );
      
      setMeals(response.data.data);

      if (response.data.location) {
        setLocation(response.data.location);
      }

    } catch (err: any) {
      console.error("Generate error:", err);
      setError(err.response?.data?.message || 'Failed to generate plan.');
    } finally {
      setGenerating(false);
    }
  };

  const logMeal = async (recommendation_id: number) => {
    try {
      // Optimistic Update
      setMeals(prev => prev.map(m => 
        m.recommendation_id === recommendation_id 
          ? { ...m, status: 'logged' } 
          : m
      ));

      await api.patch('/recommendedmeals/log', { 
        recommendation_id, 
        status: 'logged' 
      });
    } catch (err) {
      console.error("Log error:", err);
      // Revert if failed
      fetchDailyMeals(); 
    }
  };

  useEffect(() => {
    fetchDailyMeals();
  }, [fetchDailyMeals]);

  return { meals, loading, generating, error, generatePlan, location, logMeal };
};