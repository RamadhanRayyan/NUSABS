import React, { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Loader2, RefreshCw, Clock, LogIn, LogOut,
  ArrowLeft, Users, Calendar, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function AttendanceTracking() {
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'today' | 'all'>('today');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [today, all] = await Promise.all([
        supabaseService.getTodayClassAttendance(),
        supabaseService.getAllClassAttendanceLogs(100),
      ]);
      setTodayLogs(today || []);
      setAllLogs(all || []);
    } catch (e) {
      toast.error('Gagal memuat data absensi');
    } finally { setLoading(false); }
  }

  const logs = view === 'today' ? todayLogs : allLogs;
  const presentToday = todayLogs.filter(l => l.status === 'present').length;
  const excusedToday = todayLogs.filter(l => l.status === 'excused').length;
  const absentToday = todayLogs.filter(l => l.status === 'absent').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Clock className="w-7 h-7 text-amber-500" /> Absensi
            </h1>
            <p className="text-muted-foreground">Monitor kehadiran siswa dan guru secara real-time.</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={fetchData}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Hadir Hari Ini</p>
              <p className="text-xl font-bold text-emerald-500">{presentToday}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><Clock className="w-4 h-4 text-amber-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Izin Hari Ini</p>
              <p className="text-xl font-bold text-amber-500">{excusedToday}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10"><Users className="w-4 h-4 text-rose-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Alfa Hari Ini</p>
              <p className="text-xl font-bold text-rose-500">{absentToday}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10"><Calendar className="w-4 h-4 text-purple-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Absensi</p>
              <p className="text-xl font-bold">{allLogs.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <Button variant={view === 'today' ? 'default' : 'outline'} size="sm" className="h-8" onClick={() => setView('today')}>
          📅 Hari Ini
          <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">{todayLogs.length}</Badge>
        </Button>
        <Button variant={view === 'all' ? 'default' : 'outline'} size="sm" className="h-8" onClick={() => setView('all')}>
          📋 Semua
          <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">{allLogs.length}</Badge>
        </Button>
      </div>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Clock className="w-10 h-10 mb-3 opacity-20" />
              <p className="font-medium">Belum ada data absensi {view === 'today' ? 'hari ini' : ''}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Guru PIC</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`text-xs ${log.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : log.status === 'excused' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {log.user?.name?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{log.user?.name || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">{log.user?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] capitalize">{log.class?.name || '—'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs gap-1 ${
                        log.status === 'present' ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' : 
                        log.status === 'excused' ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' : 
                        'text-rose-500 border-rose-500/30 bg-rose-500/10'
                      }`}>
                        {log.status === 'present' ? 'Hadir' : log.status === 'excused' ? 'Izin' : 'Alfa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.date ? new Date(log.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {log.note || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.teacher?.name || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
