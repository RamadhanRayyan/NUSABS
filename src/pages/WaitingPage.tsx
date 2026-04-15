import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, LogOut, Loader2, Shield, Mail, CheckCircle2 } from 'lucide-react';

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

  const isRejected = profile?.status === 'rejected';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className={`w-full max-w-md bg-card/50 backdrop-blur-sm shadow-2xl ${isRejected ? 'border-destructive/20' : 'border-amber-500/20'}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isRejected ? 'bg-destructive/10' : 'bg-amber-500/10 animate-pulse'
            }`}>
              {isRejected ? (
                <Shield className="w-8 h-8 text-destructive" />
              ) : (
                <Clock className="w-8 h-8 text-amber-500" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {isRejected ? 'Akun Ditolak' : 'Menunggu Persetujuan'}
          </CardTitle>
          <CardDescription>
            {isRejected 
              ? 'Maaf, akun Anda tidak disetujui oleh administrator.'
              : 'Akun Anda sedang ditinjau oleh administrator.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {!isRejected && (
            <>
              {/* Progress Steps */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-left">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-400">✓ Registrasi Berhasil</p>
                    <p className="text-xs text-muted-foreground">Akun Anda sudah terdaftar di sistem.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-left">
                  <Mail className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-400">✓ Email Terkonfirmasi</p>
                    <p className="text-xs text-muted-foreground">Email Anda sudah terverifikasi.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-left">
                  <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-amber-400">⏳ Menunggu Admin</p>
                    <p className="text-xs text-muted-foreground">Administrator akan meninjau dan menyetujui akun Anda.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-amber-500 font-medium bg-amber-500/5 py-2 px-4 rounded-full border border-amber-500/10">
                <Loader2 className="w-3 h-3 animate-spin" />
                Memeriksa status persetujuan...
              </div>
            </>
          )}

          {isRejected && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                Jika Anda merasa ini adalah kesalahan, silakan hubungi administrator sekolah untuk informasi lebih lanjut.
              </p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {isRejected 
              ? 'Anda dapat mendaftar ulang dengan email yang berbeda.'
              : 'Halaman ini akan otomatis redirect setelah akun Anda disetujui.'}
          </p>

          <Button 
            variant="outline" 
            onClick={handleLogout} 
            className="w-full gap-2 transition-all hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
