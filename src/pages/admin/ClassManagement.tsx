import React, { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Users, GraduationCap, Loader2, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
      toast.error('Failed to load data');
    } finally { setLoading(false); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('classes').insert([form]);
      if (error) throw error;
      toast.success('Class created successfully');
      setCreateOpen(false);
      setForm({ name: '', teacher_id: '' });
      fetchAll();
    } catch (e: any) {
      toast.error('Failed to create class');
    }
    finally { setSaving(false); }
  }

  async function handleAssignStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClass || !selectedStudentId) return;
    try {
      const { error } = await supabase.from('users')
        .update({ class_id: selectedClass.id })
        .eq('id', selectedStudentId);
      if (error) throw error;
      toast.success('Student assigned successfully');
      setAssignOpen(false);
      setSelectedStudentId('');
      fetchAll();
    } catch (e: any) {
      toast.error('Failed to assign student');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Class Management</h1>
          <p className="text-muted-foreground">Create classes and assign teachers and students.</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Create Class
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : classes.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <BookOpen className="w-10 h-10 mb-3 opacity-20" />
            <p className="font-medium">No classes yet</p>
            <p className="text-sm">Create your first class to get started.</p>
            <Button className="mt-4 gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4" /> Create Class
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map(cls => {
            const classStudents = students.filter(s => s.class_id === cls.id);
            return (
              <Card key={cls.id} className="hover:border-primary/30 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {cls.teacher?.name || 'No teacher assigned'}
                      </div>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Users className="w-3 h-3" /> {classStudents.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Student list */}
                  <div className="flex flex-wrap gap-1.5">
                    {classStudents.slice(0, 5).map(s => (
                      <div key={s.id} className="flex items-center gap-1 bg-secondary/50 rounded-full px-2 py-0.5 text-xs">
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-[10px]">{s.name?.[0]}</AvatarFallback>
                        </Avatar>
                        {s.name.split(' ')[0]}
                      </div>
                    ))}
                    {classStudents.length > 5 && (
                      <span className="text-xs text-muted-foreground py-0.5">+{classStudents.length - 5} more</span>
                    )}
                    {classStudents.length === 0 && (
                      <span className="text-xs text-muted-foreground">No students assigned yet</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 text-xs"
                    onClick={() => { setSelectedClass(cls); setAssignOpen(true); }}
                  >
                    <Users className="w-3.5 h-3.5" /> Assign Student
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
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>Add a new class and assign a teacher to it.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Class Name</Label>
                <Input placeholder="e.g. Programming A" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Assign Teacher</Label>
                <Select value={form.teacher_id} onValueChange={v => setForm({ ...form, teacher_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select a teacher" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Class
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
              <DialogTitle>Assign Student to {selectedClass?.name}</DialogTitle>
              <DialogDescription>Select a student to assign to this class.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger><SelectValue placeholder="Select a student" /></SelectTrigger>
                <SelectContent>
                  {students.filter(s => !s.class_id || s.class_id === selectedClass?.id).map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!selectedStudentId}>Assign</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
