import React from "react";
import { motion } from "motion/react";
import { 
  Users, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  Filter,
  MoreVertical,
  GraduationCap,
  Code2,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function TeacherDashboard() {
  const students = [
    { id: 1, name: "Rayyan Muhammad", grade: "11", streak: 12, points: 2450, status: "Active", lastActivity: "2 mins ago" },
    { id: 2, name: "Ahmad Fauzi", grade: "11", streak: 5, points: 1800, status: "Idle", lastActivity: "1 hour ago" },
    { id: 3, name: "Siti Aminah", grade: "10", streak: 20, points: 3100, status: "Active", lastActivity: "Just now" },
    { id: 4, name: "Zaid Ibrahim", grade: "12", streak: 0, points: 1200, status: "Offline", lastActivity: "2 days ago" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Console</h1>
          <p className="text-muted-foreground">Monitor student progress, evaluate projects, and manage curriculum.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <GraduationCap className="w-4 h-4" /> Grade All
          </Button>
          <Button className="gap-2">
            <PlusIcon className="w-4 h-4" /> New Assignment
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          icon={<Users className="w-5 h-5 text-blue-500" />}
          label="Total Students"
          value="42"
          description="Across 3 grades"
        />
        <StatCard 
          icon={<Code2 className="w-5 h-5 text-emerald-500" />}
          label="Active Projects"
          value="128"
          description="24 pending review"
        />
        <StatCard 
          icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
          label="Low Engagement"
          value="5"
          description="Students with < 3 day streak"
        />
      </div>

      {/* Student Management Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Student Roster</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search students..." className="pl-9 w-64 h-9" />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Streak</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      {student.name}
                    </div>
                  </TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{student.streak}</span>
                      <span className="text-orange-500 text-xs">🔥</span>
                    </div>
                  </TableCell>
                  <TableCell>{student.points.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'Active' ? 'default' : student.status === 'Idle' ? 'secondary' : 'outline'}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{student.lastActivity}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function PlusIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
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
