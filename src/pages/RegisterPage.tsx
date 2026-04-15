import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Loader2, CheckCircle2, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Register with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role },
        },
      });

      if (authError) {
        toast.error('Registrasi Gagal', {
          description: authError.message
        });
        return;
      }
      
      if (!data.user) throw new Error('Registrasi gagal. Silakan coba lagi.');

      // 2. Fallback insert to public.users if trigger fails
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          name,
          email,
          role,
          status: 'pending',
        }, { onConflict: 'id' });

      if (dbError) {
        console.warn('DB upsert warning (non-fatal):', dbError.message);
      }

      setSuccess(true);
      toast.success('Akun Berhasil Dibuat!', {
        description: 'Silakan tunggu persetujuan dari Administrator sebelum bisa login.'
      });
    } catch (err: any) {
      toast.error('Error', {
        description: err.message || 'Terjadi kesalahan yang tidak terduga.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-background p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-md border-emerald-500/20 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Registrasi Berhasil! 🎉</CardTitle>
            <CardDescription className="text-base">
              Akun Anda telah dibuat di NUSA Boarding School
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-400">
                <Shield className="w-4 h-4" /> Menunggu Persetujuan
              </div>
              <p className="text-xs text-muted-foreground">
                Akun Anda perlu disetujui oleh Administrator sebelum bisa digunakan untuk login.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button className="w-full h-11" onClick={() => navigate('/login')}>
              Kembali ke Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-2xl">N</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Buat Akun</CardTitle>
          <CardDescription>
            Bergabung dengan ekosistem digital NUSA Boarding School
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            {/* Info Box */}
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">📋 Proses Registrasi:</p>
              <p>1. Isi form → 2. Admin approve → ✅ Aktif</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="Masukkan nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Saya adalah...</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors">
                  <SelectValue placeholder="Pilih peran Anda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">🎓 Siswa</SelectItem>
                  <SelectItem value="teacher">👨‍🏫 Guru</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Daftar
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login di sini
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
