import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Role } from '../types';
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: Role;
}
export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { token, role, logout } = useAuthStore();
  const location = useLocation();
  const invalidToken = token === 'null' || token === 'undefined';
  if (!token || invalidToken) {
    if (invalidToken) {
      logout();
    }
    return (
      <Navigate
        to="/"
        state={{
          from: location
        }}
        replace />);


  }
  if (role !== allowedRole) {
    // Redirect to their respective dashboard if they try to access another role's route
    return <Navigate to={`/${role}/dashboard`} replace />;
  }
  return <>{children}</>;
}