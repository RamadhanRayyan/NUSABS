import React from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  UserPlus,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

const data = [
  { name: 'Mon', students: 40, teachers: 24 },
  { name: 'Tue', students: 30, teachers: 13 },
  { name: 'Wed', students: 20, teachers: 98 },
  { name: 'Thu', students: 27, teachers: 39 },
  { name: 'Fri', students: 18, teachers: 48 },
  { name: 'Sat', students: 23, teachers: 38 },
  { name: 'Sun', students: 34, teachers: 43 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
          <p className="text-muted-foreground">Monitor and manage NUSA Boarding School ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <UserPlus className="w-4 h-4" /> Invite User
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Create Class
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Users className="w-5 h-5 text-blue-500" />}
          label="Total Students"
          value="1,284"
          trend="+12% from last month"
        />
        <StatCard 
          icon={<GraduationCap className="w-5 h-5 text-emerald-500" />}
          label="Total Teachers"
          value="84"
          trend="+2 new this week"
        />
        <StatCard 
          icon={<BookOpen className="w-5 h-5 text-amber-500" />}
          label="Active Classes"
          value="42"
          trend="8 currently in session"
        />
        <StatCard 
          icon={<Activity className="w-5 h-5 text-primary" />}
          label="System Health"
          value="99.9%"
          trend="All systems operational"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Chart */}
        <Card className="lg:col-span-2 bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle>Activity Analytics</CardTitle>
            <CardDescription>Daily engagement levels for students and teachers.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Bar dataKey="students" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="teachers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity Logs */}
        <Card className="bg-card/50 border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Logs
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LogItem 
              user="Ahmad Fauzi"
              action="Created Assignment"
              time="2 mins ago"
              type="teacher"
            />
            <LogItem 
              user="Rayyan Muhammad"
              action="Submitted Project"
              time="15 mins ago"
              type="student"
            />
            <LogItem 
              user="System"
              action="Database Backup"
              time="1 hour ago"
              type="admin"
            />
            <LogItem 
              user="Siti Aminah"
              action="Joined Class: IT-101"
              time="3 hours ago"
              type="student"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <Card className="bg-card/50 border-border/40">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-secondary/50">{icon}</div>
          <TrendingUp className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <p className="text-xs text-primary mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> {trend}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function LogItem({ user, action, time, type }: { user: string, action: string, time: string, type: 'admin' | 'teacher' | 'student' }) {
  const colors = {
    admin: 'bg-blue-500',
    teacher: 'bg-amber-500',
    student: 'bg-emerald-500'
  };

  return (
    <div className="flex items-start gap-3 group cursor-pointer">
      <div className={`w-2 h-2 rounded-full mt-1.5 ${colors[type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{user}</p>
        <p className="text-xs text-muted-foreground">{action}</p>
      </div>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{time}</span>
    </div>
  );
}
