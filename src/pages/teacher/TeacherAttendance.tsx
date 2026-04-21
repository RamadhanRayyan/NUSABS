import React, { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Save, CalendarDays, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function TeacherAttendance() {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchClasses(); }, []);

  useEffect(() => {
    if (selectedClass && selectedDate) fetchAttendanceData();
  }, [selectedClass, selectedDate]);

  async function fetchClasses() {
    setLoadingConfig(true);
    try {
      const data = await supabaseService.getClasses();
      setClasses(data);
      if (data.length > 0) setSelectedClass(data[0].id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch classes');
    } finally {
      setLoadingConfig(false);
    }
  }

  async function fetchAttendanceData() {
    setLoadingData(true);
    try {
      const [stuData, attData] = await Promise.all([
        supabaseService.getStudentsByClass(selectedClass),
        supabaseService.getAttendanceByDate(selectedClass, selectedDate)
      ]);
      setStudents(stuData);
      
      const attMap: Record<string, string> = {};
      const noteMap: Record<string, string> = {};
      
      // Default all to present, then override with existing data
      stuData.forEach((s: any) => {
        attMap[s.id] = 'present';
        noteMap[s.id] = '';
      });
      
      attData.forEach((a: any) => {
        attMap[a.user_id] = a.status;
        noteMap[a.user_id] = a.note || '';
      });
      
      setAttendance(attMap);
      setNotes(noteMap);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch attendance data');
    } finally {
      setLoadingData(false);
    }
  }

  const handleSave = async () => {
    if (!profile || !selectedClass) return;
    setSaving(true);
    try {
      const records = students.map(s => ({
        user_id: s.id,
        teacher_id: profile.id,
        class_id: selectedClass,
        date: selectedDate,
        status: attendance[s.id] || 'present',
        note: notes[s.id] || null
      }));
      
      await supabaseService.upsertAttendance(records);
      toast.success('Attendance saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleSetAll = (status: string) => {
    const newAtt = { ...attendance };
    students.forEach(s => newAtt[s.id] = status);
    setAttendance(newAtt);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Class Attendance</h1>
        <p className="text-muted-foreground">Manage and record daily student attendance.</p>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6 flex flex-col md:flex-row gap-4">
          <div className="space-y-2 flex-1">
            <Label>Select Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass} disabled={loadingConfig}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a class..." />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 flex-1 md:max-w-[200px]">
            <Label>Date</Label>
            <div className="relative">
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Students
            </CardTitle>
            <CardDescription>
              {students.length} students found in this class
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => handleSetAll('present')}>All Present</Button>
            <Button size="sm" variant="outline" onClick={() => handleSetAll('absent')}>All Absent</Button>
            <Button size="sm" onClick={handleSave} disabled={saving || students.length === 0} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Attendance
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingData ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="w-10 h-10 mb-3 opacity-20" />
              <p className="font-medium">No students in this class</p>
            </div>
          ) : (
             <div className="overflow-x-auto">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Student</TableHead>
                     <TableHead className="min-w-[200px]">Status</TableHead>
                     <TableHead>Note (Optional)</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {students.map(s => (
                     <TableRow key={s.id}>
                       <TableCell>
                         <div className="flex items-center gap-3">
                           <Avatar className="h-8 w-8">
                             <AvatarFallback>{s.name[0]}</AvatarFallback>
                           </Avatar>
                           <div>
                             <p className="text-sm font-medium">{s.name}</p>
                             <p className="text-xs text-muted-foreground">{s.email}</p>
                           </div>
                         </div>
                       </TableCell>
                       <TableCell>
                         <div className="flex bg-secondary/30 rounded-lg p-1 gap-1 w-fit">
                           {(['present', 'excused', 'absent'] as const).map((status) => (
                             <button
                               key={status}
                               onClick={() => setAttendance({ ...attendance, [s.id]: status })}
                               className={`text-xs px-3 py-1.5 rounded-md capitalize transition-all border border-transparent ${
                                 attendance[s.id] === status
                                   ? status === 'present' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30 font-semibold shadow-sm'
                                   : status === 'excused' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30 font-semibold shadow-sm'
                                   : 'bg-rose-500/20 text-rose-500 border-rose-500/30 font-semibold shadow-sm'
                                   : 'hover:bg-secondary/50 text-muted-foreground cursor-pointer'
                               }`}
                             >
                               {status}
                             </button>
                           ))}
                         </div>
                       </TableCell>
                       <TableCell>
                         <Input 
                           value={notes[s.id] || ''} 
                           onChange={(e) => setNotes({ ...notes, [s.id]: e.target.value })}
                           placeholder="Reason..."
                           className="h-8 text-xs max-w-[200px]"
                         />
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
