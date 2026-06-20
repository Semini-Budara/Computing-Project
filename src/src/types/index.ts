export type Role = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  profile_id?: string;
  created_at?: string;
}

export interface Student {
  id: string;
  full_name: string;
  age: number;
  grade: string;
  school: string;
  guardian_name: string;
  guardian_contact: string;
  profile_image?: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  full_name: string;
  qualifications: string;
  experience: string;
  profile_image?: string;
  created_at: string;
}

export interface Subject {
  id: string;
  subject_name: string;
  fee: number;
  schedule: string;
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  teacher_id: string;
  subject_id: string;
  status: 'pending' | 'approved' | 'rejected';
  payment_status: 'pending' | 'paid';
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: 'event' | 'payment' | 'class' | 'general';
  target_role: Role | 'all';
  created_by: string;
  created_at: string;
}

export interface TimetableEntry {
  id: string;
  grade: string;
  subject_id: string;
  teacher_id: string;
  day: string;
  start_time: string;
  end_time: string;
}

export interface Payment {
  id: string;
  student_id: string;
  subject_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_date: string;
}