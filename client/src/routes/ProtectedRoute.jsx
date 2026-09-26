import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route that requires login (and optionally a specific role).
 * Unauthenticated users are sent to /login with the original destination
 * preserved in location state, so they land back where they wanted after
 * signing in — matching the "preserve selection through auth" requirement.
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="container-page py-24 text-center text-ink/40">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-xl font-semibold text-ink">Access restricted</h1>
        <p className="mt-2 text-sm text-ink/55">You don't have permission to view this page.</p>
      </div>
    );
  }

  return children;
}
