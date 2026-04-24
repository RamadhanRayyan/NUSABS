import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function CreateTaskModal({ onTaskCreated }: { onTaskCreated: () => void }) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'assignment',
    user_id: 'all',
    deadline: '',
  });

  useEffect(() => {
    if (open) fetchStudents();
  }, [open]);

  async function fetchStudents() {
    try {
      const data = await supabaseService.getUsers();
      setStudents(data.filter((u: any) => u.role === 'student' && u.status === 'active'));
    } catch (e) {
      console.error(e);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const taskData: any = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        created_by: profile?.id,
      };
      if (formData.deadline) {
        taskData.deadline = formData.deadline;
      }

      if (formData.user_id === 'all') {
        if (students.length === 0) {
          throw new Error('No active students found to assign the task to.');
        }
        
        // Assign to all active students
        const promises = students.map(s => {
          supabaseService.createNotification(s.id, 'Tugas Baru', `Guru telah memberikan tugas baru: ${taskData.title}`);
          return supabaseService.createTask({ ...taskData, user_id: s.id });
        });
        await Promise.all(promises);
        toast.success(`Berhasil: Tugas dikirim ke ${students.length} siswa.`);
      } else {
        if (!formData.user_id || formData.user_id === 'all') {
             throw new Error('Pilih siswa terlebih dahulu.');
        }
        const student = students.find(s => s.id === formData.user_id);
        await supabaseService.createTask({ ...taskData, user_id: student?.id });
        await supabaseService.createNotification(student?.id, 'Tugas Baru', `Guru telah memberikan tugas baru: ${taskData.title}`);
        toast.success(`Berhasil: Tugas dikirim ke ${student?.name || 'siswa'}.`);
      }
      setOpen(false);
      onTaskCreated();
      setFormData({ title: '', description: '', type: 'assignment', user_id: 'all', deadline: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Assign New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Task to Students</DialogTitle>
            <DialogDescription>
              Create and assign a task. You can assign to one or all students.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="ct-title">Task Title</Label>
              <Input
                id="ct-title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Build a responsive homepage"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ct-desc">Description</Label>
              <Textarea
                id="ct-desc"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Task details and requirements..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Task Type</Label>
                <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="material">📖 Learning Material (View Only)</SelectItem>
                    <SelectItem value="assignment">📝 Required Assignment (PR)</SelectItem>
                    <SelectItem value="design_daily">Designer Daily</SelectItem>
                    <SelectItem value="programming_weekly">Programmer Weekly</SelectItem>
                    <SelectItem value="business_monthly">Business Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={formData.user_id} onValueChange={v => setFormData({ ...formData, user_id: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📢 All Students</SelectItem>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Assigning...' : 'Assign Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
