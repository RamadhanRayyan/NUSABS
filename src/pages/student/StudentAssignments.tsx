import React, { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SubmitTaskModal } from '@/components/tasks/SubmitTaskModal';
import { Clock, FileUp, ExternalLink, CheckCircle2, AlertCircle, Filter } from 'lucide-react';

export default function StudentAssignments() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'reviewed'>('all');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  useEffect(() => {
    if (profile) fetchTasks();
  }, [profile]);

  async function fetchTasks() {
    setLoading(true);
    try {
      const data = await supabaseService.getTasks(profile!.id);
      setTasks(data);
    } finally { setLoading(false); }
  }

  const typeMap: Record<string, { label: string; color: string }> = {
    design_daily:        { label: 'Design Daily',      color: 'bg-purple-500/10 text-purple-500' },
    programming_weekly:  { label: 'Programming Weekly', color: 'bg-blue-500/10 text-blue-500' },
    business_monthly:    { label: 'Business Monthly',   color: 'bg-orange-500/10 text-orange-500' },
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const counts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    submitted: tasks.filter(t => t.status === 'submitted').length,
    reviewed: tasks.filter(t => t.status === 'reviewed').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Assignments</h1>
        <p className="text-muted-foreground">Submit your work and track feedback from teachers.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'pending', 'submitted', 'reviewed'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs gap-1.5 capitalize"
            onClick={() => setFilter(f)}
          >
            {f}
            <Badge variant={filter === f ? 'secondary' : 'outline'} className="text-[10px] h-4 px-1">
              {counts[f]}
            </Badge>
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Loading assignments...</div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <AlertCircle className="w-10 h-10 mb-3 opacity-20" />
            <p className="font-medium">No {filter === 'all' ? '' : filter} assignments</p>
            <p className="text-sm">
              {filter === 'pending'
                ? 'Great job! You have no pending tasks.'
                : 'Check back later for new assignments.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(task => {
            const meta = typeMap[task.type] || { label: task.type, color: '' };
            const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status === 'pending';

            return (
              <Card
                key={task.id}
                className={`transition-all hover:shadow-md ${
                  task.status === 'reviewed' ? 'border-emerald-500/20' :
                  task.status === 'submitted' ? 'border-blue-500/20' :
                  isOverdue ? 'border-destructive/20' : 'hover:border-primary/20'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>
                      {meta.label}
                    </span>
                    <StatusBadge status={task.status as any} />
                  </div>
                  <CardTitle className="text-base">{task.title}</CardTitle>
                  {task.description && (
                    <CardDescription className="text-xs line-clamp-2">{task.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    Deadline: {task.deadline
                      ? new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                      : 'No deadline'}
                    {isOverdue && <Badge variant="destructive" className="text-[10px] ml-1">Overdue</Badge>}
                  </div>

                  {/* Show grade if reviewed */}
                  {task.status === 'reviewed' && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-medium text-emerald-600">✓ Reviewed by Teacher</p>
                    </div>
                  )}

                  {task.status === 'submitted' && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-500 bg-blue-500/10 px-3 py-2 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Submitted — awaiting teacher review
                    </div>
                  )}

                  {task.status === 'pending' && (
                    <Button
                      size="sm"
                      className="w-full gap-2 text-xs"
                      onClick={() => { setSelectedTask(task); setSubmitOpen(true); }}
                    >
                      <FileUp className="w-3.5 h-3.5" /> Submit Work
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedTask && (
        <SubmitTaskModal
          task={selectedTask}
          open={submitOpen}
          onClose={() => setSubmitOpen(false)}
          onSubmitted={fetchTasks}
        />
      )}
    </div>
  );
}
