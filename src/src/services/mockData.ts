import {
  User,
  Student,
  Teacher,
  Subject,
  Enrollment,
  Notification } from
'../types';

export const mockUsers: Record<string, User> = {
  student: {
    id: 'u1',
    username: 'student1',
    email: 'student@acme.edu',
    role: 'student',
    profile_id: 's1',
    created_at: new Date().toISOString()
  },
  teacher: {
    id: 'u2',
    username: 'teacher1',
    email: 'teacher@acme.edu',
    role: 'teacher',
    profile_id: 't1',
    created_at: new Date().toISOString()
  },
  admin: {
    id: 'u3',
    username: 'admin1',
    email: 'admin@acme.edu',
    role: 'admin',
    profile_id: 'a1',
    created_at: new Date().toISOString()
  }
};

export const mockStudentProfile: Student = {
  id: 's1',
  full_name: 'Alex Johnson',
  age: 16,
  grade: 'Grade 11',
  school: 'Springfield High',
  guardian_name: 'Martha Johnson',
  guardian_contact: '555-0192',
  created_at: new Date().toISOString()
};

export const mockTeacherProfile: Teacher = {
  id: 't1',
  full_name: 'Dr. Sarah Connor',
  qualifications: 'Ph.D. in Mathematics',
  experience: '10 Years',
  created_at: new Date().toISOString()
};

export const mockNotifications: Notification[] = [
{
  id: 'n1',
  title: 'Term Fees Due',
  message: 'Please ensure all term fees are paid by end of week.',
  category: 'payment',
  target_role: 'all',
  created_by: 'a1',
  created_at: new Date().toISOString()
},
{
  id: 'n2',
  title: 'Science Fair Registration',
  message: 'Registration for the annual science fair is now open.',
  category: 'event',
  target_role: 'student',
  created_by: 'a1',
  created_at: new Date().toISOString()
},
{
  id: 'n3',
  title: 'Staff Meeting',
  message: 'Mandatory staff meeting this Friday at 3 PM.',
  category: 'general',
  target_role: 'teacher',
  created_by: 'a1',
  created_at: new Date().toISOString()
}];