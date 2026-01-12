// The shape of a single meal row from DB
export interface RecommendedMeal {
  recommendation_id: number;
  user_id: number;
  meal_type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  meal_name: string;
  calories: string;
  reason: string;
  location:string;
  status: 'pending' | 'logged' | 'skipped';
  recommended_date: string; // Dates often come as strings from JSON
}

// The standard API response wrapper
export interface ApiResponse<T> {
  message: string;
  data: T;
}