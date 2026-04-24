import React, { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, GraduationCap, BookOpen, Activity,
  TrendingUp, ArrowUpRight, CheckCircle2, XCircle,
  Clock, ClipboardCheck, FileText, ShieldCheck,
  Loader2, RefreshCw, UserCheck, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

function StatCard({ icon, label, value, trend, color = 'text-primary' }: any) {
  return (
    <Card className="bg-card/50 border-border/40 hover:border-primary/20 transition-all group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-xl bg-secondary/50 group-hover:bg-primary/10 transition-colors">{icon}</div>
          <TrendingUp className="w-4 h-4 text-primary opacity-50" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <h3 className={`text-3xl font-bold mt-1 ${color}`}>{value}</h3>
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3 text-primary" /> {trend}
        </p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({ totalStudents: 0, totalTeachers: 0, totalClasses: 0, pendingApprovals: 0, totalTasks: 0, totalSubmissions: 0, systemHealth: '99.9%' });
  const [logs, setLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [statsData, logsData, chartData, pendingData] = await Promise.all([
        supabaseService.getAdminStats(),
        supabaseService.getActivityLogs(10),
        supabaseService.getWeeklyActivity(),
        supabaseService.getPendingUsers(),
      ]);
      setStats(statsData);
      setLogs(logsData || []);
      setChartData(chartData);
      setPendingUsers(pendingData || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleApprove(userId: string, userName: string) {
    try {
      await supabaseService.activateUser(userId);
      toast.success(`✅ ${userName} telah disetujui!`, { description: 'Akun sekarang aktif dan bisa login.' });
      fetchAll();
    } catch (e: any) {
      toast.error('Gagal menyetujui akun');
    }
  }

  async function handleReject(userId: string, userName: string) {
    try {
      await supabaseService.updateUserStatus(userId, 'rejected');
      toast.success(`❌ ${userName} ditolak.`, { description: 'Akun tidak bisa mengakses dashboard.' });
      fetchAll();
    } catch (e: any) {
      toast.error('Gagal menolak akun');
    }
  }

  const logColors: any = { admin: 'bg-blue-500', teacher: 'bg-amber-500', student: 'bg-emerald-500' };
  
  const pieData = [
    { name: 'Siswa', value: stats.totalStudents, color: '#10b981' },
    { name: 'Guru', value: stats.totalTeachers, color: '#3b82f6' },
  ].filter(d => d.value > 0);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Dashboard <span className="gradient-text">NUSA</span>
          </h1>
          <p className="text-muted-foreground mt-1">Kelola dan pantau seluruh aktivitas sekolah.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={fetchAll}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Link to="/admin/users">
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" /> Kelola User
            </Button>
          </Link>
          <Link to="/admin/classes">
            <Button className="gap-2">
              <BookOpen className="w-4 h-4" /> Kelola Kelas
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Pending Approvals Alert ── */}
      {pendingUsers.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5 glow-primary" style={{ boxShadow: '0 0 20px rgba(245, 158, 11, 0.1)' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {pendingUsers.length} Akun Menunggu Persetujuan
            </CardTitle>
            <CardDescription>
              Akun berikut sudah melakukan registrasi & konfirmasi email. Menunggu approval Admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between bg-background/80 rounded-xl px-4 py-3 border border-border/40">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border border-amber-500/20">
                    <AvatarFallback className="bg-amber-500/10 text-amber-400 text-sm font-bold">
                      {u.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-sm font-medium">{u.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{u.email}</span>
                      <Badge variant="outline" className="text-[10px] capitalize border-amber-500/30 text-amber-400">{u.role}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(u.id, u.name)}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Setujui
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleReject(u.id, u.name)}>
                    <XCircle className="w-3.5 h-3.5" /> Tolak
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5 text-emerald-500" />} label="Total Siswa" value={stats.totalStudents} trend="Siswa aktif" color="text-emerald-500" />
        <StatCard icon={<GraduationCap className="w-5 h-5 text-blue-500" />} label="Total Guru" value={stats.totalTeachers} trend="Guru aktif" color="text-blue-500" />
        <StatCard icon={<BookOpen className="w-5 h-5 text-amber-500" />} label="Kelas Aktif" value={stats.totalClasses} trend="Di database" color="text-amber-500" />
        <StatCard icon={<UserCheck className="w-5 h-5 text-purple-500" />} label="Menunggu Approval" value={stats.pendingApprovals} trend="Perlu tindakan" color="text-purple-500" />
      </div>

      {/* ── Secondary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><FileText className="w-4 h-4 text-emerald-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Tugas</p>
              <p className="text-xl font-bold">{stats.totalTasks}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><ClipboardCheck className="w-4 h-4 text-blue-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Submisi</p>
              <p className="text-xl font-bold">{stats.totalSubmissions}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><ShieldCheck className="w-4 h-4 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">System Health</p>
              <p className="text-xl font-bold text-primary">{stats.systemHealth}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Activity Chart ── */}
        <Card className="lg:col-span-2 bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Analitik Aktivitas (7 Hari Terakhir)</CardTitle>
            <CardDescription>Login & aktivitas harian berdasarkan peran.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="99%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f0f12', border: '1px solid #27272a', borderRadius: '8px' }} />
                <Bar dataKey="students" name="Siswa" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="teachers" name="Guru" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ── Quick Actions + User Composition ── */}
        <div className="space-y-6">
          {/* User Composition Pie */}
          {pieData.length > 0 && (
            <Card className="bg-card/50 border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Komposisi Pengguna</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center gap-4">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" strokeWidth={0}>
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {pieData.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-muted-foreground">{d.name}: <strong className="text-foreground">{d.value}</strong></span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <Card className="bg-card/50 border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Akses Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/admin/users">
                <Button variant="ghost" className="w-full justify-start h-10 text-sm gap-2">
                  <Users className="w-4 h-4 text-blue-500" /> Manajemen User
                </Button>
              </Link>
              <Link to="/admin/classes">
                <Button variant="ghost" className="w-full justify-start h-10 text-sm gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-500" /> Manajemen Kelas
                </Button>
              </Link>
              <Link to="/admin/students">
                <Button variant="ghost" className="w-full justify-start h-10 text-sm gap-2">
                  <Users className="w-4 h-4 text-emerald-500" /> Tracking Siswa
                </Button>
              </Link>
              <Link to="/admin/teachers">
                <Button variant="ghost" className="w-full justify-start h-10 text-sm gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-500" /> Tracking Guru
                </Button>
              </Link>
              <Link to="/admin/attendance">
                <Button variant="ghost" className="w-full justify-start h-10 text-sm gap-2">
                  <Clock className="w-4 h-4 text-orange-500" /> Absensi Hari Ini
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Recent Activity Logs ── */}
      <Card className="bg-card/50 border-border/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Log Aktivitas Terbaru
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs" onClick={fetchAll}>
              <RefreshCw className="w-3 h-3 mr-1" /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Belum ada aktivitas.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {logs.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border/30">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${logColors[log.user?.role] || 'bg-zinc-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{log.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{log.description}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
