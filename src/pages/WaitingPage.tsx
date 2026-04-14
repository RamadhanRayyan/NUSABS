import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LogOut, Loader2 } from 'lucide-react';

export default function WaitingPage() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();

  // Auto-redirect if status changes to active
  useEffect(() => {
    if (profile?.status === 'active') {
      navigate('/dashboard');
    }
  }, [profile?.status, navigate]);

  // Polling for status updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshProfile();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshProfile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-amber-500/20 bg-card/50 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center animate-pulse">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Account Pending</CardTitle>
          <CardDescription>
            Your account is waiting for administrator approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-amber-500 font-medium bg-amber-500/5 py-2 px-4 rounded-full border border-amber-500/10">
            <Loader2 className="w-3 h-3 animate-spin" />
            Checking approval status...
          </div>
          <p className="text-sm text-muted-foreground">
            Thank you for joining NUSA Boarding School. Our administrator will review your application shortly. 
            You will be able to access the dashboard once approved.
          </p>
          <Button variant="outline" onClick={handleLogout} className="w-full gap-2 transition-all hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
