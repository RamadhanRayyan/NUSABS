import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Download, FileText, Link as LinkIcon, Loader2, MessageSquare, Star, Calendar } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

interface TaskDetailModalProps {
  task: any;
  open: boolean;
  onClose: () => void;
}

export function TaskDetailModal({ task, open, onClose }: TaskDetailModalProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState<any>(null);

  useEffect(() => {
    if (open && task && profile) {
      fetchSubmission();
    }
  }, [open, task, profile]);

  const fetchSubmission = async () => {
    setLoading(true);
    try {
      const subs = await supabaseService.getSubmissions(task.id, profile?.id);
      if (subs && subs.length > 0) {
        setSubmission(subs[0]);
      } else {
        setSubmission(null);
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] overflow-hidden p-0 gap-0">
        <div className="p-6 space-y-6">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <Badge variant="outline" className="mb-2">{task.type}</Badge>
              <StatusBadge status={task.status} />
            </div>
            <DialogTitle className="text-2xl font-bold leading-tight">{task.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 mt-2">
              <Calendar className="w-3.5 h-3.5" />
              Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No deadline'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Task Description
              </h4>
              <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                {task.description || 'No description provided.'}
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-xs">Fetching submission details...</p>
              </div>
            ) : submission ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" /> Grade
                    </h4>
                    <div className="text-3xl font-bold text-amber-500">
                      {submission.grade ?? 'Ungraded'}
                    </div>
                  </div>
                  
                  {submission.file_url && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-blue-500" /> Submission Link
                      </h4>
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-9" asChild>
                        <a href={submission.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-3.5 h-3.5" /> View Submission
                        </a>
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" /> Teacher's Feedback
                  </h4>
                  {submission.feedback ? (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl relative">
                      <p className="text-sm italic text-foreground leading-relaxed">
                        "{submission.feedback}"
                      </p>
                      <div className="absolute -top-2 -right-2 opacity-10">
                        <MessageSquare className="w-12 h-12 text-emerald-500" />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic bg-secondary/20 p-3 rounded-lg">
                      No feedback provided yet.
                    </p>
                  )}
                </div>

                {submission.comment && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">Your Notes</h4>
                    <p className="text-xs text-muted-foreground bg-secondary/10 p-3 rounded-lg border border-border/50">
                      {submission.comment}
                    </p>
                  </div>
                )}
              </div>
            ) : task.status !== 'pending' && (
               <div className="text-center py-6 bg-secondary/20 rounded-lg">
                 <p className="text-sm text-muted-foreground">Submission details could not be found.</p>
               </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="bg-secondary/30 p-4 border-t border-border/40">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">Close</Button>
          {task.status === 'pending' && (
            <Button className="w-full sm:w-auto">Submit Task</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
