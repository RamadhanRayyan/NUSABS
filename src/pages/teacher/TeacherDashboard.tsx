import React from 'react';
import { 
  BookOpen, 
  CheckSquare, 
  Users, 
  Plus, 
  Clock, 
  MessageSquare,
  FileText,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function TeacherDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Console</h1>
          <p className="text-muted-foreground">Manage your classes, assignments, and student evaluations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <BookOpen className="w-4 h-4" /> My Classes
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New Assignment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Assignments */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Active Assignments
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <AssignmentCard 
              title="Database Normalization"
              class="IT-101: Backend Dev"
              submissions={18}
              total={24}
              deadline="Oct 15, 2026"
            />
            <AssignmentCard 
              title="React Hooks Deep Dive"
              class="IT-202: Frontend Dev"
              submissions={12}
              total={20}
              deadline="Oct 18, 2026"
            />
            <AssignmentCard 
              title="Fiqh of Business"
              class="REL-101: Islamic Ethics"
              submissions={22}
              total={24}
              deadline="Oct 20, 2026"
            />
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" /> Pending Reviews
          </h2>
          <Card className="bg-card/50 border-border/40">
            <CardContent className="p-4 space-y-4">
              <ReviewItem 
                student="Rayyan Muhammad"
                assignment="E-Commerce API"
                time="2 hours ago"
              />
              <ReviewItem 
                student="Siti Aminah"
                assignment="Portfolio Design"
                time="5 hours ago"
              />
              <ReviewItem 
                student="Zaid Ibrahim"
                assignment="Auth System"
                time="Yesterday"
              />
              <Button className="w-full mt-2" variant="outline">View All Submissions</Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Class Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">84.5%</div>
              <p className="text-xs text-muted-foreground mt-1">+2.4% from last semester</p>
              <Progress value={84.5} className="h-1.5 mt-4" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AssignmentCard({ title, class: className, submissions, total, deadline }: { title: string, class: string, submissions: number, total: number, deadline: string }) {
  const percentage = (submissions / total) * 100;

  return (
    <Card className="bg-card/50 border-border/40 hover:border-primary/40 transition-all group">
      <CardContent className="p-6 flex items-center justify-between gap-6">
        <div className="flex-1 space-y-1">
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground">{className}</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1">
              <div className="flex justify-between text-[10px] mb-1">
                <span>Submissions</span>
                <span>{submissions}/{total}</span>
              </div>
              <Progress value={percentage} className="h-1" />
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Deadline</p>
              <p className="text-xs font-medium">{deadline}</p>
            </div>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="rounded-full">
          <ChevronRight className="w-5 h-5" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ReviewItem({ student, assignment, time }: { student: string, assignment: string, time: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/40 hover:bg-secondary/50 transition-colors cursor-pointer">
      <div className="min-w-0">
        <h4 className="text-sm font-medium truncate">{student}</h4>
        <p className="text-xs text-muted-foreground truncate">{assignment}</p>
      </div>
      <div className="text-right ml-4">
        <Badge variant="secondary" className="text-[10px]">{time}</Badge>
      </div>
    </div>
  );
}
