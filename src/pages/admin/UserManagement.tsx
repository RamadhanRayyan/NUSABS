import React, { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Search, Loader2, RefreshCw, Users, UserCheck, UserX, Clock, Eye, Trash2, ShieldAlert, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detailUser, setDetailUser] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await supabaseService.getUsers();
      setUsers(data || []);
    } catch (e: any) {
      toast.error('Gagal memuat data pengguna');
    } finally { setLoading(false); }
  }

  async function handleAction(userId: string, action: 'active' | 'rejected', userName: string) {
    setActionLoading(userId);
    try {
      await supabaseService.updateUserStatus(userId, action);
      if (action === 'active') {
        await supabaseService.createNotification(
          userId, 
          'Akun Disetujui', 
          'Selamat! Akun Anda telah disetujui oleh Admin. Anda sekarang dapat mengakses semua fitur.'
        );
      }
      const msg = action === 'active' ? `✅ ${userName} disetujui` : `❌ ${userName} ditolak`;
      toast.success(msg);
      fetchUsers();
    } catch (e: any) {
      toast.error('Gagal memperbarui status');
    } finally { setActionLoading(null); }
  }

  async function handleRoleChange(userId: string, role: string) {
    try {
      await supabaseService.updateUserRole(userId, role);
      toast.success('Role berhasil diubah');
      fetchUsers();
    } catch (e: any) {
      toast.error('Gagal mengubah role');
    }
  }

  async function handleDelete(userId: string) {
    try {
      await supabaseService.deleteUser(userId);
      toast.success('User berhasil dihapus');
      setDeleteConfirm(null);
      fetchUsers();
    } catch (e: any) {
      toast.error('Gagal menghapus user');
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const counts = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    rejected: users.filter(u => u.status === 'rejected').length,
  };

  const statusConfig: any = {
    pending: { className: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: <Clock className="w-3 h-3" /> },
    active: { className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: <CheckCircle2 className="w-3 h-3" /> },
    rejected: { className: 'bg-destructive/10 text-destructive border-destructive/30', icon: <XCircle className="w-3 h-3" /> },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manajemen User</h1>
          <p className="text-muted-foreground">Setujui, tolak, dan kelola semua akun pengguna.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={fetchUsers}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card/30 border-border/30 cursor-pointer hover:border-primary/30 transition-all" onClick={() => setFilterStatus('all')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Users className="w-4 h-4 text-blue-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{counts.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30 cursor-pointer hover:border-emerald-500/30 transition-all" onClick={() => setFilterStatus('active')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><UserCheck className="w-4 h-4 text-emerald-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Aktif</p>
              <p className="text-xl font-bold text-emerald-500">{counts.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30 cursor-pointer hover:border-amber-500/30 transition-all" onClick={() => setFilterStatus('pending')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10"><Clock className="w-4 h-4 text-amber-500" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-xl font-bold text-amber-500">{counts.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/30 border-border/30 cursor-pointer hover:border-destructive/30 transition-all" onClick={() => setFilterStatus('rejected')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10"><UserX className="w-4 h-4 text-destructive" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Ditolak</p>
              <p className="text-xl font-bold text-destructive">{counts.rejected}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari nama atau email..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Semua Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              <SelectItem value="student">Siswa</SelectItem>
              <SelectItem value="teacher">Guru</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="h-8 px-3">{filtered.length} pengguna</Badge>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Tidak ada pengguna ditemukan.
                    </TableCell>
                  </TableRow>
                ) : filtered.map(user => (
                  <TableRow key={user.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="text-sm bg-primary/10 text-primary">{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{user.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select defaultValue={user.role} onValueChange={v => handleRoleChange(user.id, v)}>
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Siswa</SelectItem>
                          <SelectItem value="teacher">Guru</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs border gap-1 ${statusConfig[user.status]?.className || ''}`}>
                        {statusConfig[user.status]?.icon}
                        {user.status === 'active' ? 'Aktif' : user.status === 'pending' ? 'Pending' : 'Ditolak'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {user.class?.name || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {user.status === 'pending' && (
                          <>
                            <Button
                              size="sm" variant="ghost"
                              className="h-8 text-xs text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 gap-1"
                              onClick={() => handleAction(user.id, 'active', user.name)}
                              disabled={actionLoading === user.id}
                            >
                              {actionLoading === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              Setujui
                            </Button>
                            <Button
                              size="sm" variant="ghost"
                              className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                              onClick={() => handleAction(user.id, 'rejected', user.name)}
                              disabled={actionLoading === user.id}
                            >
                              <XCircle className="w-3.5 h-3.5" /> Tolak
                            </Button>
                          </>
                        )}
                        {user.status === 'rejected' && (
                          <Button
                            size="sm" variant="ghost"
                            className="h-8 text-xs text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 gap-1"
                            onClick={() => handleAction(user.id, 'active', user.name)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aktifkan
                          </Button>
                        )}
                        {user.status === 'active' && user.role !== 'admin' && (
                          <Link to={user.role === 'student' ? `/admin/students` : `/admin/teachers`}>
                            <Button size="sm" variant="ghost" className="h-8 text-xs gap-1">
                              <Eye className="w-3.5 h-3.5" /> Tracking
                            </Button>
                          </Link>
                        )}
                        {user.role !== 'admin' && (
                          <Button
                            size="sm" variant="ghost"
                            className="h-8 text-xs text-destructive/50 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setDeleteConfirm(user)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-5 h-5" /> Hapus Pengguna
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{deleteConfirm?.name}</strong> ({deleteConfirm?.email})? 
              Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Batal</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm?.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
