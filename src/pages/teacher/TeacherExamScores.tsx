import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Search, Loader2, RefreshCw, Plus, Trash2, Filter } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function TeacherExamScores() {
  const { profile } = useAuth();
  const [scores, setScores] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreOpen, setScoreOpen] = useState(false);
  const [scoreSaving, setScoreSaving] = useState(false);
  const [scoreForm, setScoreForm] = useState({ user_id: '', subject: '', score: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [scoresData, studentsData] = await Promise.all([
        supabaseService.getAllExamScores(),
        supabaseService.getUsers()
      ]);
      
      // Filter scores given by this teacher
      const myScores = (scoresData || []).filter((s: any) => s.teacher_id === profile?.id);
      setScores(myScores);
      
      // Get active students
      setStudents((studentsData || []).filter((u: any) => u.role === 'student' && u.status === 'active'));
    } catch (e) {
      toast.error('Gagal memuat data nilai');
    } finally {
      setLoading(false);
    }
  }

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoreForm.user_id) return;
    setScoreSaving(true);
    try {
      const scoreData = {
        user_id: scoreForm.user_id,
        subject: scoreForm.subject,
        score: parseFloat(scoreForm.score),
        teacher_id: profile?.id,
      };
      
      await supabaseService.addExamScore(scoreData);
      
      // Add notification for the student
      const student = students.find(s => s.id === scoreForm.user_id);
      await supabaseService.createNotification(
        scoreForm.user_id,
        'Nilai Ujian Baru',
        `Nilai untuk subjek "${scoreForm.subject}" telah ditambahkan. Skor: ${scoreForm.score}`
      );

      toast.success(`Berhasil menambahkan nilai untuk ${student?.name}`);
      setScoreOpen(false);
      setScoreForm({ user_id: '', subject: '', score: '' });
      fetchData();
    } catch (e: any) {
      toast.error('Gagal menyimpan nilai');
    } finally {
      setScoreSaving(false);
    }
  };

  const filteredScores = scores.filter(s => 
    s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Nilai Ujian</h1>
          <p className="text-muted-foreground">Input dan kelola nilai ujian siswa (UAS, UTS, Harian).</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button className="gap-2" onClick={() => setScoreOpen(true)}>
            <Plus className="w-4 h-4" /> Tambah Nilai
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Nilai Diinput</p>
            <p className="text-3xl font-bold text-primary">{scores.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Rata-rata Skor</p>
            <p className="text-3xl font-bold text-emerald-500">
              {scores.length ? (scores.reduce((a, b) => a + Number(b.score), 0) / scores.length).toFixed(1) : '0'}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Siswa Dinilai</p>
            <p className="text-3xl font-bold text-amber-500">
              {new Set(scores.map(s => s.user_id)).size}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Riwayat Penilaian</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Cari siswa atau subjek..." 
              className="pl-9 h-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Subjek / Materi</TableHead>
                  <TableHead>Skor</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      Belum ada nilai yang diinput.
                    </TableCell>
                  </TableRow>
                ) : filteredScores.map(score => (
                  <TableRow key={score.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-secondary text-xs">{score.user?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{score.user?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{score.subject}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${Number(score.score) >= 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {score.score}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(score.created_at).toLocaleDateString('id-ID')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Score Dialog */}
      <Dialog open={scoreOpen} onOpenChange={setScoreOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleScoreSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Tambah Nilai Ujian
              </DialogTitle>
              <DialogDescription>Input nilai ujian atau penilaian manual untuk siswa.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Pilih Siswa</Label>
                <Select value={scoreForm.user_id} onValueChange={v => setScoreForm({ ...scoreForm, user_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Siswa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subjek / Materi Ujian</Label>
                <Input 
                  placeholder="Contoh: UAS Pemrograman Web, Quiz UI/UX" 
                  value={scoreForm.subject}
                  onChange={e => setScoreForm({ ...scoreForm, subject: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Skor (0-100)</Label>
                <Input 
                  type="number" 
                  min="0" 
                  max="100" 
                  placeholder="85"
                  value={scoreForm.score}
                  onChange={e => setScoreForm({ ...scoreForm, score: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setScoreOpen(false)}>Batal</Button>
              <Button type="submit" disabled={scoreSaving || !scoreForm.user_id}>
                {scoreSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan Nilai
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
