import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUp, Loader2, Link as LinkIcon } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';

interface SubmitTaskModalProps {
  task: any;
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export function SubmitTaskModal({ task, open, onClose, onSubmitted }: SubmitTaskModalProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ comment: '', file_url: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.comment && !formData.file_url) {
      setError('Please provide a URL or a comment for your submission.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await supabaseService.submitTask({
        task_id: task.id,
        user_id: profile!.id,
        comment: formData.comment,
        file_url: formData.file_url,
      });
      onSubmitted();
      onClose();
      setFormData({ comment: '', file_url: '' });
    } catch (err: any) {
      setError(err.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileUp className="w-5 h-5 text-primary" /> Submit Task
            </DialogTitle>
            <DialogDescription>
              Submitting: <strong>{task?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="st-url" className="flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5" /> Project / File URL (Optional)
              </Label>
              <Input
                id="st-url"
                type="url"
                placeholder="https://github.com/your-repo or Google Drive link"
                value={formData.file_url}
                onChange={e => setFormData({ ...formData, file_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="st-comment">Notes / Comment</Label>
              <Textarea
                id="st-comment"
                placeholder="Describe what you've done, challenges faced, or any notes for the reviewer..."
                rows={4}
                value={formData.comment}
                onChange={e => setFormData({ ...formData, comment: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Submitting...' : 'Submit Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
