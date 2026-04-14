import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LogOut } from 'lucide-react';

export default function WaitingPage() {
  const navigate = useNavigate();

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
          <p className="text-sm text-muted-foreground">
            Thank you for joining NUSA Boarding School. Our administrator will review your application shortly. 
            You will be able to access the dashboard once approved.
          </p>
          <Button variant="outline" onClick={handleLogout} className="w-full gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
