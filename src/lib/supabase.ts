import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Student = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  faculty: string;
  degree: string;
  year: number;
  created_at: string;
};

export type Task = {
  id: string;
  student_id: string;
  title: string;
  description: string;
  type: 'assignment' | 'exam' | 'project' | 'reading';
  subject: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
};

export type Schedule = {
  id: string;
  student_id: string;
  title: string;
  type: 'class' | 'study' | 'exam' | 'meeting';
  location: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  color: string;
  created_at: string;
};

export type Grade = {
  id: string;
  student_id: string;
  subject: string;
  assessment_name: string;
  grade: number;
  weight: number;
  date: string;
  created_at: string;
};

export type Resource = {
  id: string;
  name: string;
  type: 'library' | 'study_room' | 'cafeteria' | 'computer_lab' | 'other';
  location: string;
  description: string;
  opening_hours: string;
  capacity: number;
  amenities: string[];
  faculty: string;
  created_at: string;
};
