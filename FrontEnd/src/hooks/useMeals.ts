import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance'; 
import type { RecommendedMeal } from '../types/mealTypes';

// Define a flexible response type locally to handle both 'data' and 'meals' keys
interface MealsResponse {
  data?: RecommendedMeal[];
  meals?: RecommendedMeal[]; // ✅ This fixes the error
  message?: string;
  location?: string;
}

export const useMeals = (targetUserId?: number) => {
  const [meals, setMeals] = useState<RecommendedMeal[]>([]);
  const [location, setLocation] = useState<string>(''); 
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getFetchUrl = () => targetUserId 
    ? `/recommendedmeals/${targetUserId}` 
    : '/recommendedmeals/daily';

  const fetchDailyMeals = useCallback(async () => {
    if (targetUserId === 0) return; 

    setLoading(true);
    try {
      // ✅ Use the flexible MealsResponse type here
      const response = await axiosInstance.get<MealsResponse>(getFetchUrl());
      
      // Now TS knows 'meals' exists as an optional property
      const data = response.data.data || response.data.meals || [];
      setMeals(data);
      
      if (response.data.location) {
        setLocation(response.data.location);
      }
      
      setError(null);
    } catch (err: any) {
      console.error("Fetch error:", err);
      if (err.response?.status === 404) {
          setMeals([]);
      } else {
          setError(err.response?.data?.message || 'Failed to load meals.');
      }
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  const generatePlan = async () => {
    setGenerating(true);
    setError(null);
    
    let detectedCoordinates = "";

    if ("geolocation" in navigator) {
       try {
         const position = await new Promise<GeolocationPosition>((resolve, reject) => {
           navigator.geolocation.getCurrentPosition(resolve, reject);
         });
         detectedCoordinates = `Lat: ${position.coords.latitude}, Long: ${position.coords.longitude}`;
       } catch (geoError) {
         console.warn("Location access denied or failed, using profile default.");
       }
    }

    try {
      const payload: any = { locationOverride: detectedCoordinates };
      
      if (targetUserId) {
          payload.target_user_id = targetUserId;
      }

      // ✅ Use the flexible MealsResponse type here too
      const response = await axiosInstance.post<MealsResponse>(
        '/recommendedmeals/generate',
        payload
      );
      
      const data = response.data.data || response.data.meals || [];
      setMeals(data);

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

      await axiosInstance.patch('/recommendedmeals/log', { 
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