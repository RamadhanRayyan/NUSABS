import React from 'react';
import { 
  BookOpen, 
  FolderKanban, 
  UserCircle, 
  CheckSquare, 
  Clock, 
  Github, 
  ExternalLink,
  Plus,
  TrendingUp,
  Flame
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function StudentDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground">Track your learning progress, projects, and assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Github className="w-4 h-4" /> Sync GitHub
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Coding Streak</p>
              <h3 className="text-2xl font-bold mt-1">12 Days</h3>
            </div>
            <Flame className="w-8 h-8 text-primary" />
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/40">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Assignments</p>
              <h3 className="text-2xl font-bold mt-1">4 Pending</h3>
            </div>
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/40">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">GPA Estimate</p>
              <h3 className="text-2xl font-bold mt-1">3.85</h3>
            </div>
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Assignments */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> My Assignments
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <StudentAssignmentCard 
              title="Database Normalization"
              subject="Backend Dev"
              status="pending"
              deadline="Oct 15, 2026"
            />
            <StudentAssignmentCard 
              title="React Hooks Deep Dive"
              subject="Frontend Dev"
              status="submitted"
              deadline="Oct 18, 2026"
            />
            <StudentAssignmentCard 
              title="Fiqh of Business"
              subject="Religion"
              status="graded"
              grade="95/100"
              deadline="Oct 10, 2026"
            />
          </div>
        </div>

        {/* Projects & Portfolio */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-primary" /> My Projects
          </h2>
          <Card className="bg-card/50 border-border/40">
            <CardContent className="p-4 space-y-4">
              <ProjectItem 
                title="E-Commerce API"
                status="published"
                github="github.com/rayyan/api"
              />
              <ProjectItem 
                title="SaaS Dashboard"
                status="draft"
                github="github.com/rayyan/saas"
              />
              <Button className="w-full mt-2" variant="outline">Manage Portfolio</Button>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98%</div>
              <Progress value={98} className="h-1.5 mt-4" />
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                <span>Present: 45 days</span>
                <span>Absent: 1 day</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StudentAssignmentCard({ title, subject, status, deadline, grade }: { title: string, subject: string, status: 'pending' | 'submitted' | 'graded', deadline: string, grade?: string }) {
  const statusColors = {
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    submitted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    graded: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  };

  return (
    <Card className="bg-card/50 border-border/40 hover:border-primary/40 transition-all group">
      <CardContent className="p-6 flex items-center justify-between gap-6">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{title}</h3>
            <Badge variant="outline" className={`text-[10px] capitalize ${statusColors[status]}`}>{status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{subject}</p>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {deadline}</span>
            {grade && <span className="font-medium text-primary">Grade: {grade}</span>}
          </div>
        </div>
        <Button size="sm" variant={status === 'pending' ? 'default' : 'outline'}>
          {status === 'pending' ? 'Submit Work' : 'View Details'}
        </Button>
      </CardContent>
    </Card>
  );
}

function ProjectItem({ title, status, github }: { title: string, status: 'draft' | 'published', github: string }) {
  return (
    <div className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{title}</h4>
        <Badge variant={status === 'published' ? 'default' : 'secondary'} className="text-[10px] capitalize">{status}</Badge>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground truncate">
        <Github className="w-3 h-3" /> {github}
      </div>
    </div>
  );
}
