import React, { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Card, CardContent, CardHeader, CardTitle	 } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Users, GraduationCap, Loader2, BookOpen, Trash2, RefreshCw, ArrowLeft, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function ClassManagement() {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', teacher_id: '' });
  const [saving, setSaving] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [cls, users] = await Promise.all([
        supabaseService.getClasses(),
        supabaseService.getUsers()
      ]);
      setClasses(cls || []);
      setTeachers((users || []).filter((u: any) => u.role === 'teacher' && u.status === 'active'));
      setStudents((users || []).filter((u: any) => u.role === 'student' && u.status === 'active'));
    } catch (e: any) {
      toast.error('Gagal memuat data');
    } finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const insertData: any = { name: form.name };
      if (form.teacher_id) insertData.teacher_id = form.teacher_id;
      const { error } = await supabase.from('classes').insert([insertData]);
      if (error) throw error;
      toast.success('Kelas berhasil dibuat!');
      setCreateOpen(false);
      setForm({ name: '', teacher_id: '' });
      fetchAll();
    } catch (e: any) {
      toast.error('Gagal membuat kelas: ' + (e.message || ''));
    } finally { setSaving(false); }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClass) return;
    setSaving(true);
    try {
      const updateData = { 
        name: form.name, 
        teacher_id: (form.teacher_id && form.teacher_id !== 'none') ? form.teacher_id : null 
      };
      const { error } = await supabase.from('classes').update(updateData).eq('id', selectedClass.id);
      if (error) throw error;
      toast.success('Kelas berhasil diubah!');
      setEditOpen(false);
      fetchAll();
    } catch (e: any) {
      toast.error('Gagal mengubah kelas');
    } finally { setSaving(false); }
  }

  async function handleAssignStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClass || !selectedStudentId) return;
    try {
      await supabaseService.updateUserClass(selectedStudentId, selectedClass.id);
      toast.success('Siswa berhasil ditambahkan ke kelas!');
      setAssignOpen(false);
      setSelectedStudentId('');
      fetchAll();
    } catch (e: any) {
      toast.error('Gagal menambahkan siswa');
    }
  }

  async function handleRemoveStudent(studentId: string) {
    try {
      await supabaseService.updateUserClass(studentId, null as any);
      toast.success('Siswa dikeluarkan dari kelas');
      fetchAll();
    } catch (e: any) {
      toast.error('Gagal mengeluarkan siswa');
    }
  }

  async function handleDeleteClass(classId: string) {
    try {
      await supabaseService.deleteClass(classId);
      toast.success('Kelas berhasil dihapus');
      setDeleteConfirm(null);
      fetchAll();
    } catch (e: any) {
      toast.error('Gagal menghapus kelas');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-amber-500" /> Manajemen Kelas
            </h1>
            <p className="text-muted-foreground">Buat kelas dan tetapkan guru serta siswa.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={fetchAll}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Button className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" /> Buat Kelas
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><BookOpen className="w-4 h-4 text-amber-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Kelas</p>
              <p className="text-xl font-bold">{classes.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><GraduationCap className="w-4 h-4 text-blue-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Guru Tersedia</p>
              <p className="text-xl font-bold">{teachers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Users className="w-4 h-4 text-emerald-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Siswa Aktif</p>
              <p className="text-xl font-bold">{students.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : classes.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <BookOpen className="w-10 h-10 mb-3 opacity-20" />
            <p className="font-medium">Belum ada kelas</p>
            <p className="text-sm">Buat kelas pertama untuk memulai.</p>
            <Button className="mt-4 gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" /> Buat Kelas
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map(cls => {
            const classStudents = students.filter(s => s.class_id === cls.id);
            return (
              <Card key={cls.id} className="hover:border-primary/30 transition-all group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {cls.teacher?.name || 'Belum ada guru'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Users className="w-3 h-3" /> {classStudents.length}
                      </Badge>
                      <Button
                        size="sm" variant="ghost"
                        className="h-7 w-7 p-0 text-primary/50 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => { setSelectedClass(cls); setForm({ name: cls.name, teacher_id: cls.teacher_id || '' }); setEditOpen(true); }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm" variant="ghost"
                        className="h-7 w-7 p-0 text-destructive/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setDeleteConfirm(cls)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Student list */}
                  <div className="space-y-1.5">
                    {classStudents.length === 0 ? (
                      <span className="text-xs text-muted-foreground">Belum ada siswa</span>
                    ) : classStudents.slice(0, 5).map(s => (
                      <div key={s.id} className="flex items-center justify-between bg-secondary/30 rounded-lg px-2.5 py-1.5 group/item">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="text-[10px] bg-emerald-500/10 text-emerald-500">{s.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">{s.name}</span>
                        </div>
                        <Button
                          size="sm" variant="ghost"
                          className="h-5 w-5 p-0 text-destructive/40 hover:text-destructive opacity-0 group-hover/item:opacity-100 transition-opacity"
                          onClick={() => handleRemoveStudent(s.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    {classStudents.length > 5 && (
                      <span className="text-xs text-muted-foreground">+{classStudents.length - 5} siswa lainnya</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 text-xs"
                    onClick={() => { setSelectedClass(cls); setAssignOpen(true); }}
                  >
                    <Users className="w-3.5 h-3.5" /> Tambah Siswa
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Class Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Buat Kelas Baru</DialogTitle>
              <DialogDescription>Tambah kelas baru dan tetapkan guru pengajar.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nama Kelas</Label>
                <Input placeholder="contoh: Programming A" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Guru Pengajar</Label>
                <Select value={form.teacher_id} onValueChange={v => setForm({ ...form, teacher_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih guru" /></SelectTrigger>
                  <SelectContent>
                    {teachers.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">Belum ada guru aktif</div>
                    ) : teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Buat Kelas
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Class Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Kelas</DialogTitle>
              <DialogDescription>Ubah nama kelas atau ganti guru pengajar.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nama Kelas</Label>
                <Input placeholder="contoh: Programming A" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Guru Pengajar</Label>
                <Select value={form.teacher_id} onValueChange={v => setForm({ ...form, teacher_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih guru..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-muted-foreground">-- Hapus Guru Pengajar --</SelectItem>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Student Modal */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleAssignStudent}>
            <DialogHeader>
              <DialogTitle>Tambah Siswa ke {selectedClass?.name}</DialogTitle>
              <DialogDescription>Pilih siswa untuk dimasukkan ke kelas ini.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
                <SelectContent>
                  {students.filter(s => !s.class_id || s.class_id !== selectedClass?.id).length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">Semua siswa sudah masuk kelas</div>
                  ) : students.filter(s => !s.class_id || s.class_id !== selectedClass?.id).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>Batal</Button>
              <Button type="submit" disabled={!selectedStudentId}>Tambahkan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Hapus Kelas
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kelas <strong>{deleteConfirm?.name}</strong>? 
              Semua siswa akan dikeluarkan dari kelas ini.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => handleDeleteClass(deleteConfirm?.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
