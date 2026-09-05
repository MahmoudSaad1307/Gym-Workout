export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          unit_preference: 'lbs' | 'kgs';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          unit_preference?: 'lbs' | 'kgs';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          unit_preference?: 'lbs' | 'kgs';
          created_at?: string;
          updated_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          split: string;
          image_url: string;
          is_custom: boolean;
          all_splits: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id?: string | null;
          name: string;
          split: string;
          image_url?: string;
          is_custom?: boolean;
          all_splits?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          split?: string;
          image_url?: string;
          is_custom?: boolean;
          all_splits?: boolean;
          created_at?: string;
        };
      };
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          split: string;
          cardio_time: number;
          cardio_distance: number;
          cardio_calories: number;
          exercises: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          date: string;
          split: string;
          cardio_time?: number;
          cardio_distance?: number;
          cardio_calories?: number;
          exercises?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          split?: string;
          cardio_time?: number;
          cardio_distance?: number;
          cardio_calories?: number;
          exercises?: Json;
          created_at?: string;
        };
      };
      progress_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          weight: number;
          unit: 'lbs' | 'kgs';
          photo_url: string;
          notes: string;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          date: string;
          weight: number;
          unit: 'lbs' | 'kgs';
          photo_url?: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          weight?: number;
          unit?: 'lbs' | 'kgs';
          photo_url?: string;
          notes?: string;
          created_at?: string;
        };
      };
    };
  };
}
