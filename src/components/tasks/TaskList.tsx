import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { FileUp, Calendar, AlertCircle, Filter } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { SubmitTaskModal } from './SubmitTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { Badge } from '@/components/ui/badge';

export function TaskList() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'reviewed'>('all');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (profile) fetchTasks();
  }, [profile]);

  async function fetchTasks() {
    try {
      const data = await supabaseService.getTasks(profile!.id);
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmitClick = (e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    setSelectedTask(task);
    setSubmitOpen(true);
  };

  const handleCardClick = (task: any) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  const typeLabels: Record<string, string> = {
    design_daily: '🎨 Design Daily',
    programming_weekly: '💻 Programming Weekly',
    business_monthly: '📊 Business Monthly',
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  if (loading) return (
    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
      Loading tasks...
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'pending', 'submitted', 'reviewed'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs capitalize"
            onClick={() => setFilter(f)}
          >
            {f} {f !== 'all' && <Badge variant="secondary" className="ml-1 text-[10px] h-4">{tasks.filter(t => t.status === f).length}</Badge>}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">No {filter === 'all' ? '' : filter} tasks found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((task) => (
            <Card 
              key={task.id} 
              className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group"
              onClick={() => handleCardClick(task)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                    {typeLabels[task.type] || task.type}
                  </span>
                  <StatusBadge status={task.status} />
                </div>
                <CardTitle className="text-base leading-snug group-hover:text-primary transition-colors">{task.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs">{task.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID') : 'No deadline'}
                </div>
                {task.status === 'pending' && (
                  <Button size="sm" className="gap-2 h-8 text-xs" onClick={(e) => handleSubmitClick(e, task)}>
                    <FileUp className="w-3.5 h-3.5" /> Submit
                  </Button>
                )}
                {task.status === 'reviewed' && (
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-1 rounded">
                    <span>✓ Reviewed</span>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {selectedTask && (
        <>
          <SubmitTaskModal
            task={selectedTask}
            open={submitOpen}
            onClose={() => setSubmitOpen(false)}
            onSubmitted={fetchTasks}
          />
          <TaskDetailModal
            task={selectedTask}
            open={detailOpen}
            onClose={() => setDetailOpen(false)}
          />
        </>
      )}
    </div>
  );
}
