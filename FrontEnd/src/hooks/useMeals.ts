import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { RecommendedMeal, ApiResponse } from '../types/mealTypes';

export const useMeals = () => {
  const [meals, setMeals] = useState<RecommendedMeal[]>([]);
  const [location, setLocation] = useState<string>(''); 
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 👇 THIS IS THE AUTH HELPER FUNCTION
  const getAuthHeaders = () => {
    let token = null;

    // 1. Try finding 'userInfo' object
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        token = parsed.token || parsed.access_token; 
      } catch (e) {
        console.error("Error parsing userInfo from local storage", e);
      }
    }

    // 2. If not found in object, try raw 'token' key
    if (!token) {
      token = localStorage.getItem('token') || localStorage.getItem('access_token');
    }

    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '', 
        'Content-Type': 'application/json'
      },
      withCredentials: true 
    };
  };

  // 1. Fetch Daily Meals
  const fetchDailyMeals = useCallback(async () => {
    setLoading(true);
    try {
      // We explicitly tell TS that response.data includes 'location'
      // If you haven't updated ApiResponse type yet, we can cast it or access it safely
      const response = await axios.get<ApiResponse<RecommendedMeal[]> & { location?: string }>(
        'http://localhost:3000/recommendedmeals/daily', 
        getAuthHeaders() 
      );
      
      setMeals(response.data.data);
      
      // 👇 2. Update location from response
      if (response.data.location) {
        setLocation(response.data.location);
      }
      
      setError(null);
    } catch (err: any) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        setError("Unauthorized: Please log in again.");
      } else {
        setError(err.response?.data?.message || 'Failed to load meals.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Generate Plan
  const generatePlan = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await axios.post<ApiResponse<RecommendedMeal[]> & { location?: string }>(
        'http://localhost:3000/recommendedmeals/generate', 
        {}, 
        getAuthHeaders()
      );
      
      setMeals(response.data.data);

      // 👇 3. Update location from response (in case it changed or was just generated)
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

  // 3. Log Meal
  const logMeal = async (recommendation_id: number) => {
    try {
      setMeals(prev => prev.map(m => m.recommendation_id === recommendation_id ? { ...m, status: 'logged' } : m));

      await axios.patch(
        'http://localhost:3000/recommendedmeals/log', 
        { recommendation_id, status: 'logged' },
        getAuthHeaders()
      );
    } catch (err) {
      console.error("Log error:", err);
      fetchDailyMeals(); 
    }
  };

  useEffect(() => {
    fetchDailyMeals();
  }, [fetchDailyMeals]);

  // 👇 4. Return location so the component can use it
  return { meals, loading, generating, error, generatePlan, location, logMeal };
};