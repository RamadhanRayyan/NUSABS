import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderKanban, 
  UserCircle, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FolderKanban, label: "Projects", path: "/projects" },
    { icon: UserCircle, label: "Portfolio", path: "/portfolio/me" },
    { icon: BookOpen, label: "Learning", path: "/learning" },
    { icon: Calendar, label: "Daily Tracker", path: "/tracker" },
    { icon: TrendingUp, label: "Earnings", path: "/earnings" },
    { icon: GraduationCap, label: "Teacher Console", path: "/teacher" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-4">
      <div className="px-6 mb-8 flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold">N</span>
        </div>
        <span className="text-xl font-bold tracking-tight">NUSA <span className="text-primary">Boarding</span></span>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname === item.path ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 h-11"
              >
                <item.icon className={`w-4 h-4 ${location.pathname === item.path ? "text-primary" : "text-muted-foreground"}`} />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
        
        <Separator className="my-6" />
        
        <div className="space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 h-11 text-muted-foreground">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 h-11 text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </ScrollArea>

      <div className="px-6 mt-auto">
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-xs font-medium text-primary mb-1">Current Streak</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">12</span>
            <span className="text-xs text-muted-foreground">Days Coding</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border/40 fixed h-full bg-card/30 backdrop-blur-sm">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border/40 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search projects, tasks..." 
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
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">Rayyan Muhammad</p>
                <p className="text-xs text-muted-foreground">Student • Grade 11</p>
              </div>
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>RM</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
