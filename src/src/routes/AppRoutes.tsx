import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleSelection } from '../pages/auth/RoleSelection';
import { Login } from '../pages/auth/Login';
import { ProtectedRoute } from './ProtectedRoute';
import { NotFound } from '../pages/NotFound';
import { Placeholder } from '../pages/Placeholder';
// Layouts
import { StudentLayout } from '../layouts/StudentLayout';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { AdminLayout } from '../layouts/AdminLayout';
// Dashboards
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { StudentsManagement } from '../pages/admin/StudentsManagement';
import { TeachersManagement } from '../pages/admin/TeachersManagement';
import { SubjectsManagement } from '../pages/admin/SubjectsManagement';
import { TimetableManagement } from '../pages/admin/TimetableManagement';
import { NotificationsManagement } from '../pages/admin/NotificationsManagement';
import { EnrollmentRequests } from '../pages/admin/EnrollmentRequests';
import { StudentTimetable } from '../pages/student/StudentTimetable';
import { StudentSubjects } from '../pages/student/StudentSubjects';
import { StudentTeachers } from '../pages/student/StudentTeachers';
import { StudentProfile } from '../pages/student/StudentProfile';
import { StudentNotifications } from '../pages/student/Notifications';
import StudentResults from '../pages/student/StudentResults';
import StudentPayments from '../pages/student/StudentPayments';
import { TeacherProfile } from '../pages/teacher/TeacherProfile';
import { TeacherTimetable } from '../pages/teacher/TeacherTimetable';
import { TeacherNotifications } from '../pages/teacher/Notifications';
import { TeacherGrades } from '../pages/teacher/TeacherGrades';
export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<RoleSelection />} />
      <Route path="/login" element={<Login />} />

      {/* Student Routes */}
      <Route
        path="/student"
        element={
        <ProtectedRoute allowedRole="student">
            <StudentLayout />
          </ProtectedRoute>
        }>
        
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="attendance" element={<Placeholder title="Attendance" />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="subjects" element={<StudentSubjects />} />
        
        <Route
          path="teachers"
          element={<StudentTeachers />} />
        
        <Route path="payments" element={<StudentPayments />} />
        <Route path="notifications" element={<StudentNotifications />} />
      </Route>

      {/* Teacher Routes */}
      <Route
        path="/teacher"
        element={
        <ProtectedRoute allowedRole="teacher">
            <TeacherLayout />
          </ProtectedRoute>
        }>
        
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="profile" element={<TeacherProfile />} />
        <Route path="timetable" element={<TeacherTimetable />} />
        <Route path="grades" element={<TeacherGrades />} />
        
        <Route path="notifications" element={<TeacherNotifications />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
        <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
        
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<StudentsManagement />} />
        
        <Route path="teachers" element={<TeachersManagement />} />
        
        <Route path="subjects" element={<SubjectsManagement />} />
        
        <Route path="timetable" element={<TimetableManagement />} />
        
        <Route path="notifications" element={<NotificationsManagement />} />
        
        <Route path="enrollments" element={<EnrollmentRequests />} />
        
        <Route
          path="payments"
          element={<Placeholder title="Manage Payments" />} />
        
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>);

}