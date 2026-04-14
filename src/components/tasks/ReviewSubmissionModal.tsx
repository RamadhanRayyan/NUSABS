import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClipboardCheck, Loader2, ExternalLink } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface ReviewSubmissionModalProps {
  submission: any;
  open: boolean;
  onClose: () => void;
  onReviewed: () => void;
}

export function ReviewSubmissionModal({ submission, open, onClose, onReviewed }: ReviewSubmissionModalProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ score: '', feedback: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const scoreNum = parseFloat(formData.score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      setError('Score must be between 0 and 100.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await supabaseService.createReview({
        submission_id: submission.id,
        teacher_id: profile!.id,
        score: scoreNum,
        feedback: formData.feedback,
      });
      onReviewed();
      onClose();
      setFormData({ score: '', feedback: '' });
    } catch (err: any) {
      setError(err.message || 'Review failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-500" /> Review Submission
            </DialogTitle>
            <DialogDescription>
              Reviewing submission from <strong>{submission?.user?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Submission preview */}
            <div className="p-4 bg-secondary/30 rounded-lg space-y-2 border border-border/40">
              <h4 className="text-sm font-semibold">{submission?.task?.title}</h4>
              {submission?.file_url && (
                <a
                  href={submission.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> View Submitted File/Link
                </a>
              )}
              {submission?.comment && (
                <p className="text-xs text-muted-foreground bg-background p-2 rounded border">
                  "{submission.comment}"
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Submitted: {new Date(submission?.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="rv-score">Score (0 - 100)</Label>
              <Input
                id="rv-score"
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 85"
                value={formData.score}
                onChange={e => setFormData({ ...formData, score: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rv-feedback">Feedback</Label>
              <Textarea
                id="rv-feedback"
                placeholder="Provide constructive feedback on the student's work..."
                rows={4}
                value={formData.feedback}
                onChange={e => setFormData({ ...formData, feedback: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Submitting Review...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
