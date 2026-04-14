import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, LogOut, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';

export function AttendanceCard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lastLog, setLastLog] = useState<any>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (profile) fetchLastLog();
  }, [profile]);

  async function fetchLastLog() {
    try {
      const logs = await supabaseService.getCheckLogs(profile!.id, 1);
      if (logs && logs.length > 0) setLastLog(logs[0]);
    } catch (error) {
      console.error(error);
    }
  }

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAction = async (type: 'checkin' | 'checkout') => {
    setLoading(true);
    try {
      if (type === 'checkin') {
        // Prevent double check-in
        if (lastLog?.type === 'checkin') {
          showMessage('You are already checked in! Please check out first.', 'error');
          return;
        }
        await supabaseService.checkIn(profile!.id);
        showMessage('Checked in successfully! 🎉', 'success');
      } else {
        // Prevent checkout without checkin
        if (!lastLog || lastLog.type === 'checkout') {
          showMessage('You haven\'t checked in yet!', 'error');
          return;
        }
        await supabaseService.checkOut(profile!.id);
        showMessage('Checked out successfully!', 'success');
      }
      fetchLastLog();
    } catch (error: any) {
      showMessage(error.message || 'Action failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = lastLog?.type === 'checkin';

  return (
    <Card className="border-primary/10 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" /> Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status indicator */}
        <div className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg ${isCheckedIn ? 'bg-emerald-500/10 text-emerald-600' : 'bg-zinc-500/10 text-zinc-500'}`}>
          <div className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
          {isCheckedIn ? 'Currently Checked In' : 'Not Checked In'}
        </div>

        {/* Feedback message */}
        {message && (
          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {message.text}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            className="flex-1 gap-2"
            onClick={() => handleAction('checkin')}
            disabled={loading || isCheckedIn}
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            Check In
          </Button>
          <Button
            className="flex-1 gap-2"
            variant="outline"
            onClick={() => handleAction('checkout')}
            disabled={loading || !isCheckedIn}
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <LogOut className="w-4 h-4" />}
            Check Out
          </Button>
        </div>

        {lastLog && (
          <p className="text-xs text-muted-foreground">
            Last: {new Date(lastLog.created_at).toLocaleTimeString('id-ID')} ({lastLog.type === 'checkin' ? 'Check In' : 'Check Out'})
          </p>
        )}
      </CardContent>
    </Card>
  );
}
