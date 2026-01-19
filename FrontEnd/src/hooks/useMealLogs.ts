import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';

export interface MealLog {
  log_id: number;
  meal_type: string;
  meal_name: string;
  portion_size: string;
  calories: number;
  created_at: string;
}

export const useMealLogs = () => {
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [loading, setLoading] = useState(true);

  // Define the fetch function
  const fetchLogs = useCallback(async () => {
    try {
      // Adjust this URL if your route prefix is different 
      const response = await axiosInstance.get('/mealLogs/track/daily');
      
      setLogs(response.data.data);
      setTotalCalories(response.data.total_calories || 0);
    } catch (err) {
      console.error("Failed to fetch meal history", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, totalCalories, loading, refetch: fetchLogs };
};