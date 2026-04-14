import React, { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart2, TrendingUp } from 'lucide-react';

export function ExamScoresList() {
  const { profile } = useAuth();
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      supabaseService.getExamScores(profile.id)
        .then(setScores)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [profile]);

  if (loading) return null;

  const average = scores.length
    ? (scores.reduce((a, s) => a + s.score, 0) / scores.length).toFixed(1)
    : null;

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-primary" /> Exam Scores
        </CardTitle>
        {average && (
          <div className="flex items-center gap-1 text-xs text-emerald-500">
            <TrendingUp className="w-3 h-3" /> Avg: <strong>{average}</strong>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {scores.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No exam scores yet.</p>
        ) : scores.slice(0, 6).map(score => (
          <div key={score.id} className="flex items-center justify-between">
            <span className="text-xs font-medium truncate max-w-[150px]">{score.subject}</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${score.score >= 75 ? 'bg-emerald-500' : score.score >= 50 ? 'bg-amber-500' : 'bg-destructive'}`}
                  style={{ width: `${score.score}%` }}
                />
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] h-5 px-1.5 ${score.score >= 75 ? 'text-emerald-500 border-emerald-500' : score.score >= 50 ? 'text-amber-500 border-amber-500' : 'text-destructive border-destructive'}`}
              >
                {score.score}
              </Badge>
            </div>
          </div>
        ))}
        {scores.length > 6 && (
          <p className="text-[10px] text-muted-foreground text-center">+{scores.length - 6} more subjects</p>
        )}
      </CardContent>
    </Card>
  );
}
