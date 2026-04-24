import React, { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { TaskList } from '@/components/tasks/TaskList';
import { ExamScoresList } from '@/components/scores/ExamScoresList';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bell, Target, TrendingUp, CheckSquare, BellDot } from 'lucide-react';

function StatCard({ icon, label, value, description, color = 'text-primary' }: any) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/40">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-2 rounded-lg bg-secondary/50">{icon}</div>
          <span className={`text-sm font-medium text-muted-foreground`}>{label}</span>
        </div>
        <div className={`text-2xl font-bold mb-1 ${color}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ pendingTasks: 0, averageScore: 0 });
  useEffect(() => {
    if (profile) {
      supabaseService.getStudentStats(profile.id).then(setStats);
    }
  }, [profile]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Assalamu'alaikum, {profile?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">Keep pushing forward in your learning journey at NUSA.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={<Target className="w-5 h-5 text-amber-500" />}
              label="Pending Tasks"
              value={stats.pendingTasks}
              description="Need your attention"
              color="text-amber-500"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
              label="Average Score"
              value={stats.averageScore !== undefined && stats.averageScore !== null ? `${stats.averageScore}` : 'N/A'}
              description="Across all subjects"
              color="text-emerald-500"
            />
          </div>

          {/* Tasks */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" /> My Tasks
            </h2>
            <TaskList />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <ExamScoresList />
        </div>
      </div>
    </div>
  );
}
