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
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin', roles: ['admin'] },
  { icon: LayoutDashboard, label: 'Overview', path: '/teacher', roles: ['teacher'] },
  { icon: LayoutDashboard, label: 'Overview', path: '/student', roles: ['student'] },
  { icon: Users, label: 'User Management', path: '/admin/users', roles: ['admin'] },
  { icon: GraduationCap, label: 'Classes', path: '/admin/classes', roles: ['admin'] },
  { icon: BookOpen, label: 'My Classes', path: '/teacher/classes', roles: ['teacher'] },
  { icon: CheckSquare, label: 'Assignments', path: '/teacher/assignments', roles: ['teacher'] },
  { icon: BookOpen, label: 'Assignments', path: '/student/assignments', roles: ['student'] },
  { icon: FolderKanban, label: 'Projects', path: '/student/projects', roles: ['student'] },
  { icon: UserCircle, label: 'Portfolio', path: '/student/portfolio', roles: ['student'] },
  { icon: CheckSquare, label: 'Attendance', path: '/student/attendance', roles: ['student'] },
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/40 bg-card/30 backdrop-blur-md sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">N</span>
          </div>
          <span className="text-xl font-bold tracking-tight">NUSA <span className="text-primary">Boarding</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {filteredItems.map((item, idx) => (
            <Link key={idx} to={item.path}>
              <Button
                variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-3 h-11"
              >
                <item.icon className={`w-4 h-4 ${location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'}`} />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-4">
          <Separator className="bg-border/40" />
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{profile?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{profile?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 h-11 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
            Sign Out
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
                <span className="text-xl font-bold tracking-tight">NUSA</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="space-y-1">
              {filteredItems.map((item, idx) => (
                <Link key={idx} to={item.path} onClick={() => setIsSidebarOpen(false)}>
                  <Button
                    variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3 h-11"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
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

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Badge variant="outline" className="capitalize hidden sm:flex">{profile?.role}</Badge>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
