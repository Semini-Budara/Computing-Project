import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StudentChatbot } from '../components/StudentChatbot';
import {
  LayoutDashboard,
  User,
  Calendar,
  CheckSquare,
  Award,
  BookOpen,
  Users,
  CreditCard,
  Bell } from
'lucide-react';
const studentNavItems = [
{
  title: 'Dashboard',
  href: '/student/dashboard',
  icon: LayoutDashboard
},
{
  title: 'Profile',
  href: '/student/profile',
  icon: User
},
{
  title: 'Timetable',
  href: '/student/timetable',
  icon: Calendar
},
// {
//   title: 'Attendance',
//   href: '/student/attendance',
//   icon: CheckSquare
// },
{
  title: 'Results',
  href: '/student/results',
  icon: Award
},
{
  title: 'Subjects',
  href: '/student/subjects',
  icon: BookOpen
},
{
  title: 'Teachers',
  href: '/student/teachers',
  icon: Users
},
{
  title: 'Payments',
  href: '/student/payments',
  icon: CreditCard
},
{
  title: 'Notifications',
  href: '/student/notifications',
  icon: Bell
}];

export function StudentLayout() {
  return (
    <>
      <DashboardLayout navItems={studentNavItems} />
      <StudentChatbot />
    </>
  );
}