import React, { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Loader2, RefreshCw, Eye, Users, Target,
  TrendingUp, CheckSquare, Clock, BookOpen, BarChart2,
  FileText, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function StudentTracking() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [usersData, classData] = await Promise.all([
        supabaseService.getUsersByRole('student'),
        supabaseService.getClasses(),
      ]);
      setStudents(usersData || []);
      setClasses(classData || []);
    } catch (e) {
      toast.error('Gagal memuat data siswa');
    } finally { setLoading(false); }
  }

  async function openDetail(student: any) {
    setSelectedStudent(student);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const data = await supabaseService.getStudentDetail(student.id);
      setDetailData(data);
    } catch (e) {
      toast.error('Gagal memuat detail siswa');
    } finally { setDetailLoading(false); }
  }

  const filtered = students.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = filterClass === 'all' || s.class_id === filterClass;
    return matchSearch && matchClass;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-7 h-7 text-emerald-500" /> Tracking Siswa
            </h1>
            <p className="text-muted-foreground">Pantau progress dan aktivitas semua siswa.</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={fetchData}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Users className="w-4 h-4 text-emerald-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Siswa</p>
              <p className="text-xl font-bold">{students.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><BookOpen className="w-4 h-4 text-blue-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Dalam Kelas</p>
              <p className="text-xl font-bold">{students.filter(s => s.class_id).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><Target className="w-4 h-4 text-amber-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Tanpa Kelas</p>
              <p className="text-xl font-bold">{students.filter(s => !s.class_id).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10"><BookOpen className="w-4 h-4 text-purple-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Kelas</p>
              <p className="text-xl font-bold">{classes.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari siswa..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={filterClass} onValueChange={setFilterClass}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary">{filtered.length} siswa</Badge>
        </CardContent>
      </Card>

      {/* Student Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      Tidak ada siswa ditemukan.
                    </TableCell>
                  </TableRow>
                ) : filtered.map(student => (
                  <TableRow key={student.id} className="group cursor-pointer hover:bg-secondary/20" onClick={() => openDetail(student)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-emerald-500/10 text-emerald-500 text-sm">{student.name?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{student.name}</div>
                          <div className="text-xs text-muted-foreground">{student.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {student.class?.name || 'Belum ada'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(student.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="h-8 text-xs gap-1.5 text-primary">
                        <Eye className="w-3.5 h-3.5" /> Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-emerald-500/10 text-emerald-500">{selectedStudent?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div>{selectedStudent?.name}</div>
                <div className="text-xs text-muted-foreground font-normal">{selectedStudent?.email}</div>
              </div>
            </DialogTitle>
            <DialogDescription>
              Detail lengkap progress dan aktivitas siswa.
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : detailData ? (
            <div className="space-y-6 mt-2">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-secondary/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Tugas</p>
                  <p className="text-2xl font-bold text-primary">{detailData.tasks.length}</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Submisi</p>
                  <p className="text-2xl font-bold text-blue-500">{detailData.submissions.length}</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Nilai Rata²</p>
                  <p className="text-2xl font-bold text-emerald-500">
                    {detailData.scores.length > 0
                      ? (detailData.scores.reduce((a: number, s: any) => a + Number(s.score), 0) / detailData.scores.length).toFixed(1)
                      : '—'}
                  </p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Kehadiran</p>
                  <p className="text-2xl font-bold text-amber-500">
                    {detailData.attendance.filter((a: any) => a.type === 'checkin').length}x
                  </p>
                </div>
              </div>

              {/* Task Progress */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-primary" /> Progress Tugas
                </h4>
                {detailData.tasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground bg-secondary/20 rounded-lg p-4 text-center">Belum ada tugas.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {detailData.tasks.slice(0, 10).map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between bg-secondary/20 rounded-lg px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-[10px] text-muted-foreground">{task.type?.replace(/_/g, ' ')}</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ml-2 ${
                          task.status === 'reviewed' ? 'text-emerald-500 border-emerald-500/30' :
                          task.status === 'submitted' ? 'text-blue-500 border-blue-500/30' :
                          'text-amber-500 border-amber-500/30'
                        }`}>
                          {task.status === 'reviewed' ? '✓ Reviewed' : task.status === 'submitted' ? '📤 Submitted' : '⏳ Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Exam Scores */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-500" /> Nilai Ujian
                </h4>
                {detailData.scores.length === 0 ? (
                  <p className="text-xs text-muted-foreground bg-secondary/20 rounded-lg p-4 text-center">Belum ada nilai ujian.</p>
                ) : (
                  <div className="space-y-2">
                    {detailData.scores.slice(0, 8).map((score: any) => (
                      <div key={score.id} className="flex items-center justify-between">
                        <span className="text-xs font-medium truncate max-w-[180px]">{score.subject}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${Number(score.score) >= 75 ? 'bg-emerald-500' : Number(score.score) >= 50 ? 'bg-amber-500' : 'bg-destructive'}`}
                              style={{ width: `${score.score}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold min-w-[32px] text-right ${Number(score.score) >= 75 ? 'text-emerald-500' : Number(score.score) >= 50 ? 'text-amber-500' : 'text-destructive'}`}>
                            {score.score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Attendance */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" /> Riwayat Kehadiran
                </h4>
                {detailData.attendance.length === 0 ? (
                  <p className="text-xs text-muted-foreground bg-secondary/20 rounded-lg p-4 text-center">Belum ada data kehadiran.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {detailData.attendance.slice(0, 10).map((log: any) => (
                      <div key={log.id} className="flex items-center gap-2 bg-secondary/20 rounded-lg px-3 py-1.5">
                        <div className={`w-2 h-2 rounded-full ${log.type === 'checkin' ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                        <span className="text-[11px] text-muted-foreground">
                          {log.type === 'checkin' ? 'Masuk' : 'Keluar'} — {new Date(log.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
