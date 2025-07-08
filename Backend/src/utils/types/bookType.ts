import { UserRequest } from "./userTypes";


export interface Book {
  book_id: number;
  user_id: number; 
  title: string;
  author: string;
  genre: string;
  publisher: string;
  description: string;
  published_year: number;
  total_copies: number;
  available_copies: number;
  image_url: string;
  created_at?: Date;
  updated_at?: Date;
  created_by: number;
}


export interface BookRequest extends UserRequest {
  params: {
    id: string; 
  };
  book?: Book;
}
