import React from "react";
import { motion } from "motion/react";
import { 
  Code, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Github, 
  ExternalLink,
  Plus,
  Flame,
  Trophy,
  Target
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assalamu'alaikum, Rayyan!</h1>
          <p className="text-muted-foreground">Here's what's happening with your projects today.</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          label="Coding Streak"
          value="12 Days"
          description="+2 from last week"
        />
        <StatCard 
          icon={<Trophy className="w-5 h-5 text-yellow-500" />}
          label="NUSA Points"
          value="2,450"
          description="Top 5% in Grade 11"
        />
        <StatCard 
          icon={<Target className="w-5 h-5 text-primary" />}
          label="Project Progress"
          value="84%"
          description="3 active projects"
        />
        <StatCard 
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
          label="Est. Earnings"
          value="$420.00"
          description="Freelance simulation"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Learning & Projects */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Project */}
          <Card className="overflow-hidden border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Active Project</Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Due in 4 days
                </span>
              </div>
              <CardTitle className="text-2xl mt-2">E-Commerce API with Node.js</CardTitle>
              <CardDescription>Building a robust backend for a modern marketplace using Express and MongoDB.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Milestones Completed</span>
                  <span className="font-medium">7/10</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>
              <div className="flex items-center gap-4 pt-2">
                <Button size="sm" className="gap-2">Continue Coding</Button>
                <Button size="sm" variant="ghost" className="gap-2">View Details</Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Portfolio Work */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Portfolio</h2>
              <Button variant="link" className="text-primary">View All</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PortfolioCard 
                title="SaaS Landing Page"
                tags={["React", "Tailwind", "Motion"]}
                image="https://picsum.photos/seed/saas/400/250"
              />
              <PortfolioCard 
                title="Prayer Times App"
                tags={["Next.js", "API", "PWA"]}
                image="https://picsum.photos/seed/prayer/400/250"
              />
            </div>
          </div>
        </div>

        {/* Sidebar: Daily Tracker & Assignments */}
        <div className="space-y-8">
          {/* Daily Activity Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" /> Daily Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ActivityItem label="Tahajjud & Subuh" completed={true} />
              <ActivityItem label="Morning Coding Session" completed={true} />
              <ActivityItem label="English Speaking Challenge" completed={false} />
              <ActivityItem label="Dhuhr Prayer" completed={true} />
              <ActivityItem label="Project Work" completed={false} />
              <ActivityItem label="Evening Islamic Study" completed={false} />
              <Button className="w-full mt-2" variant="outline">Update Tracker</Button>
            </CardContent>
          </Card>

          {/* Upcoming Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AssignmentItem 
                title="Database Normalization"
                subject="Backend Dev"
                due="Tomorrow"
              />
              <AssignmentItem 
                title="Fiqh of Business"
                subject="Religion"
                due="Oct 15"
              />
              <AssignmentItem 
                title="English Pitching"
                subject="Communication"
                due="Oct 18"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, description }: { icon: React.ReactNode, label: string, value: string, description: string }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/40">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-2 rounded-lg bg-secondary/50">{icon}</div>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <div className="text-2xl font-bold mb-1">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function PortfolioCard({ title, tags, image }: { title: string, tags: string[], image: string }) {
  return (
    <Card className="group overflow-hidden border-border/40 hover:border-primary/40 transition-all">
      <div className="aspect-video overflow-hidden relative">
        <img src={image} alt={title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Button size="icon" variant="secondary" className="rounded-full"><Github className="w-4 h-4" /></Button>
          <Button size="icon" variant="secondary" className="rounded-full"><ExternalLink className="w-4 h-4" /></Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold mb-2">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ label, completed }: { label: string, completed: boolean }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${completed ? 'bg-primary border-primary' : 'border-muted-foreground/30 group-hover:border-primary/50'}`}>
          {completed && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
        </div>
        <span className={`text-sm ${completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{label}</span>
      </div>
    </div>
  );
}

function AssignmentItem({ title, subject, due }: { title: string, subject: string, due: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/40">
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-xs text-muted-foreground">{subject}</p>
      </div>
      <Badge variant="outline" className="text-[10px]">{due}</Badge>
    </div>
  );
}
