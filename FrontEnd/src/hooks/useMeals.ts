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

  const generatePlan = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await api.post<ApiResponse<RecommendedMeal[]> & { location?: string }>(
        '/recommendedmeals/generate'
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
      fetchDailyMeals(); 
    }
  };

  useEffect(() => {
    fetchDailyMeals();
  }, [fetchDailyMeals]);

  return { meals, loading, generating, error, generatePlan, location, logMeal };
};