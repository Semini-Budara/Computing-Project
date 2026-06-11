import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileCheck,
  CreditCard,
  Bell } from
'lucide-react';
const adminNavItems = [
{
  title: 'Dashboard',
  href: '/admin/dashboard',
  icon: LayoutDashboard
},
{
  title: 'Students',
  href: '/admin/students',
  icon: Users
},
{
  title: 'Teachers',
  href: '/admin/teachers',
  icon: GraduationCap
},
{
  title: 'Subjects',
  href: '/admin/subjects',
  icon: BookOpen
},
{
  title: 'Timetable',
  href: '/admin/timetable',
  icon: Calendar
},
{
  title: 'Enrollment Requests',
  href: '/admin/enrollments',
  icon: FileCheck
},
// {
//   title: 'Payments',
//   href: '/admin/payments',
//   icon: CreditCard
// },
{
  title: 'Notifications',
  href: '/admin/notifications',
  icon: Bell
}];

export function AdminLayout() {
  return <DashboardLayout navItems={adminNavItems} />;
}