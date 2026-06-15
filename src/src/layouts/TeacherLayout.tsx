import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  LayoutDashboard,
  User,
  Calendar,
  GraduationCap,
  Bell } from
'lucide-react';
const teacherNavItems = [
{
  title: 'Dashboard',
  href: '/teacher/dashboard',
  icon: LayoutDashboard
},
{
  title: 'Profile',
  href: '/teacher/profile',
  icon: User
},
{
  title: 'Timetable',
  href: '/teacher/timetable',
  icon: Calendar
},
{
  title: 'Grades',
  href: '/teacher/grades',
  icon: GraduationCap
},
{
  title: 'Notifications',
  href: '/teacher/notifications',
  icon: Bell
}];

export function TeacherLayout() {
  return <DashboardLayout navItems={teacherNavItems} />;
}