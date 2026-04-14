import React, { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, CheckCircle2, XCircle, UserPlus, 
  Users, GraduationCap, BookOpen, Activity,
  TrendingUp, ArrowUpRight, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StatCard({ icon, label, value, trend }: any) {
  return (
    <Card className="bg-card/50 border-border/40">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-secondary/50">{icon}</div>
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        <p className="text-xs text-primary mt-2 flex items-center gap-1">
          <ArrowUpRight className="w-3 h-3" /> {trend}
        </p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0, totalClasses: 0, systemHealth: '99.9%' });
  const [logs, setLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [statsData, logsData, chartData, usersData] = await Promise.all([
        supabaseService.getAdminStats(),
        supabaseService.getActivityLogs(),
        supabaseService.getWeeklyActivity(),
        supabaseService.getUsers()
      ]);
      setStats(statsData);
      setLogs(logsData || []);
      setChartData(chartData);
      setPendingUsers((usersData || []).filter((u: any) => u.status === 'pending'));
    } catch (e) { console.error(e); }
  }

  async function handleApprove(userId: string) {
    await supabaseService.activateUser(userId);
    fetchAll();
  }

  async function handleReject(userId: string) {
    await supabaseService.updateUserStatus(userId, 'rejected');
    fetchAll();
  }

  const logColors: any = { admin: 'bg-blue-500', teacher: 'bg-amber-500', student: 'bg-emerald-500' };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
          <p className="text-muted-foreground">Monitor and manage NUSA Boarding School.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/users">
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" /> Manage Users
            </Button>
          </Link>
          <Link to="/admin/classes">
            <Button className="gap-2">
              <BookOpen className="w-4 h-4" /> Manage Classes
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending Approvals Alert */}
      {pendingUsers.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-amber-500 flex items-center gap-2">
              ⚠️ {pendingUsers.length} Pending Account{pendingUsers.length > 1 ? 's' : ''} Awaiting Approval
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between bg-background rounded-lg px-4 py-2">
                <div>
                  <span className="text-sm font-medium">{u.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">({u.email})</span>
                  <Badge variant="outline" className="ml-2 text-xs capitalize">{u.role}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(u.id)}>
                    <CheckCircle2 className="w-3 h-3" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleReject(u.id)}>
                    <XCircle className="w-3 h-3" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5 text-blue-500" />} label="Total Students" value={stats.totalStudents} trend="Active in system" />
        <StatCard icon={<GraduationCap className="w-5 h-5 text-emerald-500" />} label="Total Teachers" value={stats.totalTeachers} trend="Active in system" />
        <StatCard icon={<BookOpen className="w-5 h-5 text-amber-500" />} label="Active Classes" value={stats.totalClasses} trend="In database" />
        <StatCard icon={<Activity className="w-5 h-5 text-primary" />} label="System Health" value={stats.systemHealth} trend="All systems operational" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-2 bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle>Activity Analytics (Last 7 Days)</CardTitle>
            <CardDescription>Daily logins and activities per role.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="99%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }} />
                <Bar dataKey="students" name="Students" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="teachers" name="Teachers" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Logs</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => supabaseService.getActivityLogs().then(setLogs)}>
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
            ) : logs.map(log => (
              <div key={log.id} className="flex items-start gap-3">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
