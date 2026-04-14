import React, { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { AttendanceCard } from '@/components/attendance/AttendanceCard';
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
  const [stats, setStats] = useState({ pendingTasks: 0, averageScore: 0, totalCheckins: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    if (profile) {
      supabaseService.getStudentStats(profile.id).then(setStats);
      supabaseService.getNotifications(profile.id).then(data => {
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.is_read).length);
      });
    }
  }, [profile]);

  async function markAllRead() {
    if (!profile) return;
    await supabaseService.markAllRead(profile.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

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
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotif(!showNotif)}>
            {unreadCount > 0 ? <BellDot className="w-5 h-5 text-primary" /> : <Bell className="w-5 h-5" />}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </Button>

          {/* Notification Panel */}
          {showNotif && (
            <Card className="absolute right-0 top-12 w-80 z-50 shadow-2xl border-border/60">
              <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Notifications</CardTitle>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs h-6" onClick={markAllRead}>
                    Mark all read
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-6">No notifications.</p>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-border/30 last:border-0 ${!n.is_read ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                      <div>
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(n.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
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
              value={stats.averageScore ? `${stats.averageScore}` : 'N/A'}
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
          <AttendanceCard />

          {/* Attendance Progress */}
          {stats.totalCheckins > 0 && (
            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>This Month</span>
                  <span>{Math.min(100, Math.round((stats.totalCheckins / 22) * 100))}%</span>
                </div>
                <Progress value={Math.min(100, (stats.totalCheckins / 22) * 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">{stats.totalCheckins} check-ins recorded</p>
              </CardContent>
            </Card>
          )}

          <ExamScoresList />
        </div>
      </div>
    </div>
  );
}
