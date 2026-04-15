import React, { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Search, Loader2, RefreshCw, Eye, GraduationCap,
  BookOpen, ClipboardCheck, Trophy, ArrowLeft, Users
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function TeacherTracking() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await supabaseService.getUsersByRole('teacher');
      setTeachers(data || []);
    } catch (e) {
      toast.error('Gagal memuat data guru');
    } finally { setLoading(false); }
  }

  async function openDetail(teacher: any) {
    setSelectedTeacher(teacher);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const data = await supabaseService.getTeacherDetail(teacher.id);
      setDetailData(data);
    } catch (e) {
      toast.error('Gagal memuat detail guru');
    } finally { setDetailLoading(false); }
  }

  const filtered = teachers.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-blue-500" /> Tracking Guru
            </h1>
            <p className="text-muted-foreground">Pantau kelas, review, dan kontribusi semua guru.</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={fetchData}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><GraduationCap className="w-4 h-4 text-blue-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Guru</p>
              <p className="text-xl font-bold">{teachers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><BookOpen className="w-4 h-4 text-emerald-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Mengajar Kelas</p>
              <p className="text-xl font-bold">{teachers.filter(t => t.class_id).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10"><Users className="w-4 h-4 text-purple-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Aktif</p>
              <p className="text-xl font-bold text-emerald-500">{teachers.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari guru..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Badge variant="secondary">{filtered.length} guru</Badge>
        </CardContent>
      </Card>

      {/* Teacher List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guru</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Bergabung</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      Tidak ada guru ditemukan.
                    </TableCell>
                  </TableRow>
                ) : filtered.map(teacher => (
                  <TableRow key={teacher.id} className="cursor-pointer hover:bg-secondary/20" onClick={() => openDetail(teacher)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-blue-500/10 text-blue-500 text-sm">{teacher.name?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{teacher.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{teacher.email}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(teacher.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
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
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-500/10 text-blue-500">{selectedTeacher?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div>{selectedTeacher?.name}</div>
                <div className="text-xs text-muted-foreground font-normal">{selectedTeacher?.email}</div>
              </div>
            </DialogTitle>
            <DialogDescription>Detail kontribusi dan aktivitas mengajar.</DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : detailData ? (
            <div className="space-y-6 mt-2">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Kelas Diajar</p>
                  <p className="text-2xl font-bold text-blue-500">{detailData.classes.length}</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Review Diberikan</p>
                  <p className="text-2xl font-bold text-emerald-500">{detailData.reviews.length}</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Nilai Diinput</p>
                  <p className="text-2xl font-bold text-amber-500">{detailData.scores.length}</p>
                </div>
              </div>

              {/* Classes */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" /> Kelas yang Diajar
                </h4>
                {detailData.classes.length === 0 ? (
                  <p className="text-xs text-muted-foreground bg-secondary/20 rounded-lg p-4 text-center">Belum ada kelas.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {detailData.classes.map((cls: any) => (
                      <Badge key={cls.id} variant="outline" className="text-sm px-3 py-1.5 border-blue-500/30 text-blue-400">
                        <BookOpen className="w-3 h-3 mr-1.5" /> {cls.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Reviews */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-emerald-500" /> Review Terbaru
                </h4>
                {detailData.reviews.length === 0 ? (
                  <p className="text-xs text-muted-foreground bg-secondary/20 rounded-lg p-4 text-center">Belum ada review.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {detailData.reviews.slice(0, 10).map((review: any) => (
                      <div key={review.id} className="flex items-center justify-between bg-secondary/20 rounded-lg px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{review.submission?.task?.title || 'Task'}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Siswa: {review.submission?.user?.name || '—'} • {new Date(review.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <Badge variant="outline" className={`text-xs ml-2 ${
                          Number(review.score) >= 75 ? 'text-emerald-500 border-emerald-500/30' :
                          Number(review.score) >= 50 ? 'text-amber-500 border-amber-500/30' :
                          'text-destructive border-destructive/30'
                        }`}>
                          {review.score}/100
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Scores Given */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" /> Nilai Ujian yang Diinput
                </h4>
                {detailData.scores.length === 0 ? (
                  <p className="text-xs text-muted-foreground bg-secondary/20 rounded-lg p-4 text-center">Belum ada nilai.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {detailData.scores.slice(0, 10).map((score: any) => (
                      <div key={score.id} className="flex items-center justify-between bg-secondary/20 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">{score.subject}</p>
                          <p className="text-[10px] text-muted-foreground">Siswa: {score.user?.name || '—'}</p>
                        </div>
                        <span className={`text-sm font-bold ${
                          Number(score.score) >= 75 ? 'text-emerald-500' :
                          Number(score.score) >= 50 ? 'text-amber-500' :
                          'text-destructive'
                        }`}>
                          {score.score}
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
