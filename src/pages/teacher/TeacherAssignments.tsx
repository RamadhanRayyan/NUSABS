import React, { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { ReviewSubmissionModal } from '@/components/tasks/ReviewSubmissionModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, Eye, Filter, Loader2, ClipboardList } from 'lucide-react';

export default function TeacherAssignments() {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [managedTasks, setManagedTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded'>('all');
  const [activeTab, setActiveTab] = useState<'submissions' | 'tasks'>('submissions');
  const [selected, setSelected] = useState<any>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    if (!profile) return;
    setLoading(true);
    try {
      const [subsData, tasksData] = await Promise.all([
        supabaseService.getSubmissions(),
        supabaseService.getTasksByTeacher(profile.id)
      ]);
      setSubmissions(subsData);
      setManagedTasks(tasksData);
    } finally { setLoading(false); }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await supabaseService.deleteTask(taskId);
      fetchData();
    } catch (e: any) {
      alert('Error deleting task: ' + e.message);
    }
  }

  const filtered = filterStatus === 'all' ? submissions :
    filterStatus === 'graded' ? submissions.filter(s => s.grade) :
    submissions.filter(s => !s.grade);

  const typeColors: any = {
    material: 'bg-emerald-500/10 text-emerald-500',
    assignment: 'bg-rose-500/10 text-rose-500',
    design_daily: 'bg-purple-500/10 text-purple-500',
    programming_weekly: 'bg-blue-500/10 text-blue-500',
    business_monthly: 'bg-orange-500/10 text-orange-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Assignments & Submissions</h1>
          <p className="text-muted-foreground">Manage tasks and review student submissions.</p>
        </div>
        <CreateTaskModal onTaskCreated={fetchData} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/40 mb-6">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'submissions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('submissions')}
        >
          Submissions
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'tasks' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('tasks')}
        >
          Daftar Tugas
        </button>
      </div>

      {activeTab === 'submissions' ? (
        <>
          {/* Filter */}
          <div className="flex items-center gap-2 mb-4">
            {(['all', 'pending', 'graded'] as const).map(f => (
              <Button
                key={f}
                variant={filterStatus === f ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs capitalize"
                onClick={() => setFilterStatus(f)}
              >
                {f === 'pending' ? '⏳ Pending Review' : f === 'graded' ? '✅ Graded' : '📋 All'}
                <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">
                  {f === 'all' ? submissions.length : f === 'graded' ? submissions.filter(s => s.grade).length : submissions.filter(s => !s.grade).length}
                </Badge>
              </Button>
            ))}
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <ClipboardList className="w-10 h-10 mb-3 opacity-20" />
                  <p className="font-medium">No submissions found</p>
                  <p className="text-sm">Submissions will appear here when students submit their work.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(sub => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="text-xs">{sub.user?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{sub.user?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium max-w-[200px] truncate">{sub.task?.title}</p>
                          {sub.comment && (
                            <p className="text-xs text-muted-foreground max-w-[200px] truncate italic">"{sub.comment}"</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[sub.task?.type] || ''}`}>
                            {sub.task?.type?.replace(/_/g, ' ') || '—'}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(sub.created_at).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>
                          {sub.grade ? (
                            <div>
                              <span className="font-bold text-emerald-500">{sub.grade}</span>
                              <span className="text-xs text-muted-foreground">/100</span>
                            </div>
                          ) : (
                            <span className="text-xs text-amber-500">Not graded</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {sub.file_url && (
                              <a href={sub.file_url} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="ghost" className="h-7 text-xs">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                              </a>
                            )}
                            {!sub.grade && (
                              <Button
                                size="sm" className="h-7 text-xs gap-1"
                                onClick={() => { setSelected(sub); setReviewOpen(true); }}
                              >
                                <Eye className="w-3.5 h-3.5" /> Grade
                              </Button>
                            )}
                            {sub.grade && (
                              <Button
                                size="sm" variant="outline" className="h-7 text-xs gap-1"
                                onClick={() => { setSelected(sub); setReviewOpen(true); }}
                              >
                                Re-grade
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tugas yang Telah Diberikan</CardTitle>
            <CardDescription>Daftar semua tugas yang Anda tugaskan kepada siswa.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : managedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <ClipboardList className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-medium">Belum ada tugas</p>
                <p className="text-sm">Klik "Assign New Task" untuk mulai memberikan tugas.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tugas</TableHead>
                    <TableHead>Diberikan Ke</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managedTasks.map(task => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{task.name || 'Student'}</span>
                          {task.class?.name && <Badge variant="secondary" className="text-[10px] h-4">{task.class.name}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[task.type] || ''}`}>
                          {task.type?.replace(/_/g, ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID') : '—'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={task.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {selected && (
        <ReviewSubmissionModal
          submission={selected}
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          onReviewed={fetchData}
        />
      )}
    </div>
  );
}
