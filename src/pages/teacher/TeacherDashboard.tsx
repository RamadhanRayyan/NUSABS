import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ReviewSubmissionModal } from '@/components/tasks/ReviewSubmissionModal';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Users, ClipboardCheck, BookOpen, Search,
  MessageSquare, Trophy, Loader2, RefreshCw
} from 'lucide-react';

function StatCard({ icon, label, value, description }: any) {
  return (
    <Card className="bg-card/50 border-border/40">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-2 rounded-lg bg-secondary/50">{icon}</div>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [scoreForm, setScoreForm] = useState({ subject: '', score: '' });
  const [scoreSaving, setScoreSaving] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [usersData, subsData] = await Promise.all([
        supabaseService.getUsers(),
        supabaseService.getSubmissions()
      ]);
      setStudents((usersData || []).filter((u: any) => u.role === 'student' && u.status === 'active'));
      setSubmissions(subsData || []);
    } finally { setLoading(false); }
  }

  const pendingSubmissions = submissions.filter(s => !s.grade);
  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleScoreSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setScoreSaving(true);
    try {
      await supabaseService.addExamScore({
        user_id: selectedStudent.id,
        subject: scoreForm.subject,
        score: parseFloat(scoreForm.score),
        teacher_id: profile?.id,
      });
      setScoreOpen(false);
      setScoreForm({ subject: '', score: '' });
    } finally { setScoreSaving(false); }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Console</h1>
          <p className="text-muted-foreground">Monitor progress, grade submissions, and manage tasks.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={fetchAll}><RefreshCw className="w-4 h-4" /></Button>
          <CreateTaskModal onTaskCreated={fetchAll} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-500" />}
          label="Active Students" value={students.length} description="In your classes"
        />
        <StatCard
          icon={<ClipboardCheck className="w-5 h-5 text-amber-500" />}
          label="Pending Reviews" value={pendingSubmissions.length} description="Waiting for grading"
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-emerald-500" />}
          label="Total Submissions" value={submissions.length} description="All time"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Roster */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Student Roster</CardTitle>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search student..." className="pl-9 w-48 h-9"
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin w-5 h-5 text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No active students found.
                        </TableCell>
                      </TableRow>
                    ) : filteredStudents.map(student => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{student.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {student.class?.name || 'No class'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm" variant="ghost" className="text-xs gap-1 h-8"
                            onClick={() => { setSelectedStudent(student); setScoreOpen(true); }}
                          >
                            <Trophy className="w-3.5 h-3.5" /> Add Score
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Reviews */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Pending Reviews
            {pendingSubmissions.length > 0 && (
              <Badge className="bg-primary text-primary-foreground text-xs">{pendingSubmissions.length}</Badge>
            )}
          </h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {pendingSubmissions.length === 0 ? (
              <div className="border-dashed border-2 rounded-xl p-6 text-center text-muted-foreground text-sm">
                🎉 All caught up! No pending reviews.
              </div>
            ) : pendingSubmissions.map(sub => (
              <Card key={sub.id} className="hover:border-primary/30 transition-all">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="text-[10px]">New Submission</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(sub.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <CardTitle className="text-sm mt-1">{sub.task?.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">From: <strong>{sub.user?.name}</strong></p>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  {sub.comment && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2 italic">"{sub.comment}"</p>
                  )}
                  <Button
                    size="sm" variant="outline" className="w-full text-xs h-8 gap-1"
                    onClick={() => { setSelectedSubmission(sub); setReviewOpen(true); }}
                  >
                    <ClipboardCheck className="w-3.5 h-3.5" /> Review & Grade
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <ReviewSubmissionModal
          submission={selectedSubmission}
          open={reviewOpen}
          onClose={() => setReviewOpen(false)}
          onReviewed={fetchAll}
        />
      )}

      {/* Add Score Modal */}
      <Dialog open={scoreOpen} onOpenChange={setScoreOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <form onSubmit={handleScoreSubmit}>
            <DialogHeader>
              <DialogTitle>Add Exam Score</DialogTitle>
              <DialogDescription>Add score for <strong>{selectedStudent?.name}</strong></DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="e.g. Web Design, Business Plan" value={scoreForm.subject}
                  onChange={e => setScoreForm({ ...scoreForm, subject: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Score (0–100)</Label>
                <Input type="number" min="0" max="100" placeholder="e.g. 85"
                  value={scoreForm.score} onChange={e => setScoreForm({ ...scoreForm, score: e.target.value })} required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setScoreOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={scoreSaving}>
                {scoreSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Score
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
