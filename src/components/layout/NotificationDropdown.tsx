import React, { useState, useEffect } from 'react';
import { Bell, BellDot, CheckCircle2, Clock, Info } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export function NotificationDropdown() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!profile) return;
    const data = await supabaseService.getNotifications(profile.id);
    setNotifications(data);
    setUnreadCount(data.filter((n: any) => !n.is_read).length);
  };

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription
    if (profile) {
      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${profile.id}`
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile]);

  const markAllRead = async () => {
    if (!profile) return;
    await supabaseService.markAllRead(profile.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const markAsRead = async (id: string) => {
    await supabaseService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative hover:bg-primary/10 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {unreadCount > 0 ? (
          <BellDot className="w-5 h-5 text-primary animate-pulse" />
        ) : (
          <Bell className="w-5 h-5 text-muted-foreground" />
        )}
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
        )}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <Card className="absolute right-0 mt-2 w-80 sm:w-96 z-50 shadow-2xl border-border/40 bg-card/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <CardHeader className="py-4 px-5 flex flex-row items-center justify-between border-b border-border/40">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold">Notifikasi</CardTitle>
                {unreadCount > 0 && (
                  <Badge variant="default" className="h-5 px-1.5 text-[10px] font-bold">
                    {unreadCount} BARU
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-8 text-primary hover:text-primary hover:bg-primary/5" 
                  onClick={markAllRead}
                >
                  Tandai semua dibaca
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[350px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                      <Bell className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Belum ada notifikasi</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Kami akan mengabarimu jika ada info baru.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/20">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "group px-5 py-4 transition-all hover:bg-secondary/30 cursor-pointer relative",
                          !n.is_read && "bg-primary/5"
                        )}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div className="flex gap-4">
                          <div className={cn(
                            "mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            !n.is_read ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                          )}>
                            {n.title.toLowerCase().includes('tugas') ? (
                              <Clock className="w-4 h-4" />
                            ) : n.title.toLowerCase().includes('selesai') ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Info className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className={cn(
                                "text-sm font-semibold truncate",
                                !n.is_read ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {n.title}
                              </p>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {formatTimeAgo(new Date(n.created_at))}
                              </span>
                            </div>
                            <p className={cn(
                              "text-xs leading-relaxed line-clamp-2",
                              !n.is_read ? "text-foreground/80" : "text-muted-foreground/70"
                            )}>
                              {n.message}
                            </p>
                          </div>
                          {!n.is_read && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="p-3 border-t border-border/40 text-center">
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-primary">
                  Lihat Semua Aktivitas
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Baru saja';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m yang lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}j yang lalu`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}h yang lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}
