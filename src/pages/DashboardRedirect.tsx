import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirect() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center space-y-4">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <span className="text-destructive text-2xl font-bold">!</span>
        </div>
        <div>
          <h2 className="text-xl font-bold">Profile Not Found</h2>
          <p className="text-muted-foreground">We couldn't find your account data. Please try logging out and in again.</p>
        </div>
        <button 
          onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')}
          className="text-primary hover:underline font-medium"
        >
          Sign Out & Try Again
        </button>
      </div>
    );
  }

  // If status is explicitly pending/rejected, go to waiting page
  if (!profile.status || profile.status === 'pending' || profile.status === 'rejected') {
    return <Navigate to="/waiting" replace />;
  }

  switch (profile.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'teacher':
      return <Navigate to="/teacher" replace />;
    case 'student':
      return <Navigate to="/student" replace />;
    default:
      return <Navigate to="/waiting" replace />;
  }
}
