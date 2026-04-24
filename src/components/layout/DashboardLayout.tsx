import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CheckSquare, 
  FolderKanban, 
  UserCircle, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  GraduationCap,
  Clock,
  Eye,
  ClipboardCheck,
  ShieldCheck,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  // Admin
  { icon: LayoutDashboard, label: 'Overview', path: '/admin', roles: ['admin'] },
  { icon: Users, label: 'Manajemen User', path: '/admin/users', roles: ['admin'] },
  { icon: GraduationCap, label: 'Manajemen Kelas', path: '/admin/classes', roles: ['admin'] },
  { icon: Eye, label: 'Tracking Siswa', path: '/admin/students', roles: ['admin'] },
  { icon: ShieldCheck, label: 'Tracking Guru', path: '/admin/teachers', roles: ['admin'] },
  { icon: Clock, label: 'Absensi', path: '/admin/attendance', roles: ['admin'] },
  // Teacher
  { icon: LayoutDashboard, label: 'Overview', path: '/teacher', roles: ['teacher'] },
  { icon: ClipboardCheck, label: 'Assignments', path: '/teacher/assignments', roles: ['teacher'] },
  { icon: Clock, label: 'Absensi Kelas', path: '/teacher/attendance', roles: ['teacher'] },
  { icon: Trophy, label: 'Nilai Ujian', path: '/teacher/scores', roles: ['teacher'] },
  // Student
  { icon: LayoutDashboard, label: 'Overview', path: '/student', roles: ['student'] },
  { icon: BookOpen, label: 'Assignments', path: '/student/assignments', roles: ['student'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredItems = sidebarItems.filter(item => profile && item.roles.includes(profile.role));

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const roleLabel: Record<string, string> = { admin: 'Administrator', teacher: 'Guru', student: 'Siswa' };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/40 bg-card/30 backdrop-blur-md sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-bold text-lg">N</span>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">NUSA<span className="text-primary">BS</span></span>
            <p className="text-[10px] text-muted-foreground -mt-0.5">Boarding School</p>
          </div>
        </div>

        <Separator className="bg-border/30 mx-4" />

        <nav className="flex-1 px-3 py-4 space-y-1">
          {filteredItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={idx} to={item.path}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={`w-full justify-start gap-3 h-10 text-sm transition-all ${isActive ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-secondary/50'}`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto space-y-3">
          <Separator className="bg-border/30" />
          <div className="flex items-center gap-3 px-2 py-1">
            <Avatar className="h-9 w-9 border border-primary/20">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">{profile?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{profile?.name}</p>
              <p className="text-[10px] text-muted-foreground">{roleLabel[profile?.role || ''] || profile?.role}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-10 text-destructive hover:text-destructive hover:bg-destructive/10 text-sm" 
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)}>
          <aside className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border p-6 space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">N</span>
                </div>
                <span className="text-xl font-bold tracking-tight">NUSA<span className="text-primary">BS</span></span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="space-y-1">
              {filteredItems.map((item, idx) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={idx} to={item.path} onClick={() => setIsSidebarOpen(false)}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={`w-full justify-start gap-3 h-10 ${isActive ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4">
              <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-destructive" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" /> Keluar
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border/40 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-secondary/50 border-none rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationDropdown />
            <Separator orientation="vertical" className="h-6" />
            <Badge variant="outline" className="capitalize hidden sm:flex text-xs">{roleLabel[profile?.role || ''] || profile?.role}</Badge>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
