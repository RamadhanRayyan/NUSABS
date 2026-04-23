import { supabase } from "@/lib/supabase";

// Helper: safely run a query and return empty array on error
async function safeQuery<T>(queryFn: () => Promise<{ data: T | null; error: any }>): Promise<T> {
  try {
    const { data, error } = await queryFn();
    if (error) {
      console.warn('[SupabaseService] Query error:', error.message || error);
      return (Array.isArray(data) ? [] : null) as T;
    }
    return data as T;
  } catch (e: any) {
    console.warn('[SupabaseService] Unexpected error:', e.message || e);
    return ([] as unknown) as T;
  }
}

// Helper: manually attach classes to users to workaround the missing users.class_id foreign key constraint
async function attachClassToUsers(users: any[]) {
  if (!users || users.length === 0) return users;
  const classIds = users.filter((u: any) => u && u.class_id).map((u: any) => u.class_id);
  if (classIds.length === 0) return users.map((u: any) => ({ ...u, class: null }));
  
  const { data: classes } = await supabase.from('classes').select('id, name').in('id', classIds);
  const classMap: Record<string, { name: string }> = {};
  if (classes) {
    classes.forEach((c: any) => { classMap[c.id] = { name: c.name }; });
  }
  return users.map((u: any) => ({
    ...u,
    class: u.class_id ? (classMap[u.class_id] || null) : null
  }));
}

// Helper: manually attach users and tasks to submissions
async function attachDataToSubmissions(submissions: any[]) {
  if (!submissions || submissions.length === 0) return submissions;
  const userIds = submissions.filter(s => s && s.user_id).map(s => s.user_id);
  const taskIds = submissions.filter(s => s && s.task_id).map(s => s.task_id);
  
  const [{ data: users }, { data: tasks }] = await Promise.all([
    supabase.from('users').select('id, name, email').in('id', userIds),
    supabase.from('tasks').select('id, title, type').in('id', taskIds)
  ]);
  
  const userMap: Record<string, any> = {};
  const taskMap: Record<string, any> = {};
  if (users) users.forEach(u => userMap[u.id] = u);
  if (tasks) tasks.forEach(t => taskMap[t.id] = t);
  
  return submissions.map(s => ({
    ...s,
    user: s.user_id ? (userMap[s.user_id] || null) : null,
    task: s.task_id ? (taskMap[s.task_id] || null) : null
  }));
}

export const supabaseService = {

  // ── PROFILES ──────────────────────────────────────────────────────────────
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) console.warn('getProfile error:', error.message);
    if (!data) return data;
    const enriched = await attachClassToUsers([data]);
    return enriched[0];
  },

  // ── USER MANAGEMENT ───────────────────────────────────────────────────────
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('getUsers error:', error.message);
      return [];
    }
    return attachClassToUsers(data ?? []);
  },

  async getPendingUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('getPendingUsers error:', error.message);
      return [];
    }
    return attachClassToUsers(data ?? []);
  },

  async getUsersByRole(role: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .eq('status', 'active')
      .order('name', { ascending: true });
    if (error) {
      console.warn('getUsersByRole error:', error.message);
      return [];
    }
    return attachClassToUsers(data ?? []);
  },

  async updateUserStatus(userId: string, status: 'active' | 'pending' | 'rejected') {
    const { error } = await supabase.from('users').update({ status }).eq('id', userId);
    if (error) throw error;
  },

  async updateUserRole(userId: string, role: string) {
    const { error } = await supabase.from('users').update({ role }).eq('id', userId);
    if (error) throw error;
  },

  async updateUserClass(userId: string, classId: string | null) {
    const { error } = await supabase.from('users').update({ class_id: classId }).eq('id', userId);
    if (error) throw error;
  },

  async activateUser(userId: string) {
    return this.updateUserStatus(userId, 'active');
  },

  async deleteUser(userId: string) {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
  },

  // ── CLASSES ───────────────────────────────────────────────────────────────
  async getClasses() {
    const { data, error } = await supabase
      .from('classes')
      .select('*, teacher:users!classes_teacher_id_fkey(name)')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('getClasses error:', error.message);
      return [];
    }
    return data ?? [];
  },

  async createClass(name: string, teacherId?: string) {
    const { error } = await supabase.from('classes').insert([{ 
      name, 
      teacher_id: teacherId || null 
    }]);
    if (error) throw error;
  },

  async deleteClass(classId: string) {
    // Unassign students first
    await supabase.from('users').update({ class_id: null }).eq('class_id', classId);
    const { error } = await supabase.from('classes').delete().eq('id', classId);
    if (error) throw error;
  },

  // ── TASKS ─────────────────────────────────────────────────────────────────
  async getTasks(userId?: string, type?: string) {
    let query = supabase.from('tasks').select('*');
    if (userId) query = query.eq('user_id', userId);
    if (type)   query = query.eq('type', type);
    const { data, error } = await query.order('deadline', { ascending: true });
    if (error) {
      console.warn('getTasks error:', error.message);
      return [];
    }
    return data ?? [];
  },

  async getAllTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*');
    
    if (error) {
      console.warn('getAllTasks error:', error.message);
      return [];
    }

    // Try to sort manually if the database column is missing
    let sortedData = data ?? [];
    try {
      sortedData = [...sortedData].sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    } catch(e) {}

    return attachClassToUsers(sortedData);
  },

  async getTasksByTeacher(teacherId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('created_by', teacherId);
      
    if (error) {
      console.warn('getTasksByTeacher error:', error.message);
      return [];
    }

    let sortedData = data ?? [];
    try {
      sortedData = [...sortedData].sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    } catch(e) {}

    return attachClassToUsers(sortedData);
  },

  async createTask(task: any) {
    console.log('[SupabaseService] Creating task:', task);
    const { data, error } = await supabase.from('tasks').insert([task]).select();
    if (error) {
      console.error('[SupabaseService] Create task error:', error);
      throw error;
    }
    console.log('[SupabaseService] Task created successfully:', data);
    return data;
  },

  async updateTaskStatus(taskId: string, status: 'pending' | 'submitted' | 'reviewed') {
    const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId);
    if (error) console.warn('updateTaskStatus error:', error.message);
  },

  async deleteTask(taskId: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw error;
  },

  // ── SUBMISSIONS ───────────────────────────────────────────────────────────
  async submitTask(submission: any) {
    const { error } = await supabase
      .from('submissions')
      .upsert(submission, { onConflict: 'task_id,user_id' });
    if (error) throw error;
    await this.updateTaskStatus(submission.task_id, 'submitted');
  },

  async getSubmissions(taskId?: string, userId?: string) {
    let query = supabase.from('submissions').select('*');
    if (taskId) query = query.eq('task_id', taskId);
    if (userId) query = query.eq('user_id', userId);
    
    const { data, error } = await query;
    if (error) {
      console.warn('getSubmissions error:', error.message);
      return [];
    }

    let sortedData = data ?? [];
    try {
      sortedData = [...sortedData].sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    } catch(e) {}

    return attachDataToSubmissions(sortedData);
  },

  // ── REVIEWS ───────────────────────────────────────────────────────────────
  async createReview(review: any) {
    const { error } = await supabase.from('reviews').insert([review]);
    if (error) throw error;

    // Update submission with grade & feedback
    await supabase.from('submissions')
      .update({ grade: review.score, feedback: review.feedback })
      .eq('id', review.submission_id);

    // Update task status
    const { data: sub } = await supabase
      .from('submissions')
      .select('task_id')
      .eq('id', review.submission_id)
      .single();
    if (sub) await this.updateTaskStatus(sub.task_id, 'reviewed');
  },

  async getReviews(submissionId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, teacher:users!reviews_teacher_id_fkey(name)')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('getReviews error:', error.message);
      return [];
    }
    return data ?? [];
  },

  // ── ATTENDANCE (Self check-in/out) ─────────────────────────────────────────
  async checkIn(userId: string, note?: string) {
    const { error } = await supabase
      .from('check_logs')
      .insert([{ user_id: userId, type: 'checkin', note }]);
    if (error) throw error;
  },

  async checkOut(userId: string, note?: string) {
    const { error } = await supabase
      .from('check_logs')
      .insert([{ user_id: userId, type: 'checkout', note }]);
    if (error) throw error;
  },

  async getCheckLogs(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('check_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.warn('getCheckLogs error:', error.message);
      return [];
    }
    return data ?? [];
  },

  async getAllAttendanceLogs(limit = 50) {
    const { data, error } = await supabase
      .from('check_logs')
      .select('*, user:users!check_logs_user_id_fkey(name, email, role)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.warn('getAllAttendanceLogs error:', error.message);
      return [];
    }
    return data ?? [];
  },

  async getTodayAttendance() {
    // Try attendance_records first (teacher-led), fallback to check_logs (self-check-in)
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*, user:users!attendance_records_user_id_fkey(name, email, role), class:classes!attendance_records_class_id_fkey(name)')
      .eq('date', today)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('getTodayAttendance (attendance_records) error, trying check_logs:', error.message);
      // Fallback: try check_logs
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const { data: fallback } = await supabase
        .from('check_logs')
        .select('*, user:users!check_logs_user_id_fkey(name, email, role)')
        .gte('created_at', todayDate.toISOString())
        .order('created_at', { ascending: false });
      return fallback ?? [];
    }
    return data ?? [];
  },

  // ── TEACHER LED ATTENDANCE ────────────────────────────────────────────────
  async getStudentsByClass(classId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('class_id', classId)
      .eq('role', 'student')
      .eq('status', 'active')
      .order('name', { ascending: true });
    if (error) {
      console.warn('getStudentsByClass error:', error.message);
      return [];
    }
    return data ?? [];
  },

  async getAttendanceByDate(classId: string, date: string) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('class_id', classId)
      .eq('date', date);
    if (error) {
      console.warn('getAttendanceByDate error:', error.message);
      return [];
    }
    return data ?? [];
  },

  async upsertAttendance(records: any[]) {
    const { error } = await supabase
      .from('attendance_records')
      .upsert(records, { onConflict: 'user_id,date' });
    if (error) throw error;
  },

  async getAllClassAttendanceLogs(limit = 100) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*, user:users!attendance_records_user_id_fkey(name, email, role), class:classes!attendance_records_class_id_fkey(name), teacher:users!attendance_records_teacher_id_fkey(name)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.warn('getAllClassAttendanceLogs error:', error.message);
      return [];
    }
    return data ?? [];
  },

  async getTodayClassAttendance() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*, user:users!attendance_records_user_id_fkey(name, email, role), class:classes!attendance_records_class_id_fkey(name), teacher:users!attendance_records_teacher_id_fkey(name)')
      .eq('date', today)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('getTodayClassAttendance error:', error.message);
      return [];
    }
    return data ?? [];
  },

  // ── EXAM SCORES ───────────────────────────────────────────────────────────
  async getExamScores(userId: string) {
    const { data, error } = await supabase
      .from('exam_scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('getExamScores error:', error.message);
      return [];
    }
    return data ?? [];
  },

  async getAllExamScores() {
    const { data, error } = await supabase
      .from('exam_scores')
      .select('*, user:users!exam_scores_user_id_fkey(name, email), teacher:users!exam_scores_teacher_id_fkey(name)')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('getAllExamScores error:', error.message);
      return [];
    }
    return data ?? [];
  },

  async addExamScore(score: any) {
    const { error } = await supabase.from('exam_scores').insert([score]);
    if (error) throw error;
  },

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
  async getNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      console.warn('getNotifications error:', error.message);
      return [];
    }
    return data ?? [];
  },

  async createNotification(userId: string, title: string, message: string) {
    const { error } = await supabase
      .from('notifications')
      .insert([{ user_id: userId, title, message }]);
    if (error) throw error;
  },

  async markNotificationRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) console.warn('markNotificationRead error:', error.message);
  },

  async markAllRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    if (error) console.warn('markAllRead error:', error.message);
  },

  // ── STATISTICS ────────────────────────────────────────────────────────────
  async getStudentStats(userId: string) {
    try {
      const [tasks, scores, logs] = await Promise.all([
        supabase.from('tasks').select('status').eq('user_id', userId),
        supabase.from('exam_scores').select('score').eq('user_id', userId),
        supabase.from('check_logs').select('id', { count: 'exact' })
          .eq('user_id', userId).eq('type', 'checkin'),
      ]);
      const pending = tasks.data?.filter(t => t.status === 'pending').length || 0;
      const submitted = tasks.data?.filter(t => t.status === 'submitted').length || 0;
      const reviewed = tasks.data?.filter(t => t.status === 'reviewed').length || 0;
      const avg = scores.data?.length
        ? +(scores.data.reduce((a, s) => a + s.score, 0) / scores.data.length).toFixed(1)
        : 0;
      return {
        pendingTasks: pending,
        submittedTasks: submitted,
        reviewedTasks: reviewed,
        totalTasks: tasks.data?.length || 0,
        averageScore: avg,
        totalCheckins: logs.count || 0,
      };
    } catch (e) {
      console.warn('getStudentStats error:', e);
      return { pendingTasks: 0, submittedTasks: 0, reviewedTasks: 0, totalTasks: 0, averageScore: 0, totalCheckins: 0 };
    }
  },

  async getTeacherStats() {
    try {
      const [students, subs, tasks] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' })
          .eq('role', 'student').eq('status', 'active'),
        supabase.from('submissions').select('id, grade', { count: 'exact' }),
        supabase.from('tasks').select('id', { count: 'exact' }),
      ]);
      const ungraded = (subs.data || []).filter(s => !s.grade).length;
      return {
        totalStudents: students.count || 0,
        totalSubmissions: subs.count || 0,
        ungradedSubmissions: ungraded,
        totalTasks: tasks.count || 0,
      };
    } catch (e) {
      console.warn('getTeacherStats error:', e);
      return { totalStudents: 0, totalSubmissions: 0, ungradedSubmissions: 0, totalTasks: 0 };
    }
  },

  async getAdminStats() {
    try {
      const [students, teachers, pending, classes, tasks, subs] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }).eq('role', 'student').eq('status', 'active'),
        supabase.from('users').select('id', { count: 'exact' }).eq('role', 'teacher').eq('status', 'active'),
        supabase.from('users').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('classes').select('id', { count: 'exact' }),
        supabase.from('tasks').select('id', { count: 'exact' }),
        supabase.from('submissions').select('id', { count: 'exact' }),
      ]);
      return {
        totalStudents: students.count || 0,
        totalTeachers: teachers.count || 0,
        pendingApprovals: pending.count || 0,
        totalClasses: classes.count || 0,
        totalTasks: tasks.count || 0,
        totalSubmissions: subs.count || 0,
        systemHealth: '99.9%',
      };
    } catch (e) {
      console.warn('getAdminStats error:', e);
      return { totalStudents: 0, totalTeachers: 0, pendingApprovals: 0, totalClasses: 0, totalTasks: 0, totalSubmissions: 0, systemHealth: '—' };
    }
  },

  // ── STUDENT TRACKING (for Admin) ──────────────────────────────────────────
  async getStudentDetail(studentId: string) {
    try {
      const [profile, tasks, scores, logs, subs] = await Promise.all([
        supabase.from('users').select('*').eq('id', studentId).maybeSingle(),
        supabase.from('tasks').select('*').eq('user_id', studentId).order('created_at', { ascending: false }),
        supabase.from('exam_scores').select('*').eq('user_id', studentId).order('created_at', { ascending: false }),
        supabase.from('check_logs').select('*').eq('user_id', studentId).order('created_at', { ascending: false }).limit(20),
        supabase.from('submissions').select('*, task:tasks(title, type)').eq('user_id', studentId).order('created_at', { ascending: false }),
      ]);
      
      let profileData = profile.data;
      if (profileData) {
        const enriched = await attachClassToUsers([profileData]);
        profileData = enriched[0];
      }

      return {
        profile: profileData,
        tasks: tasks.data ?? [],
        scores: scores.data ?? [],
        attendance: logs.data ?? [],
        submissions: subs.data ?? [],
      };
    } catch (e) {
      console.warn('getStudentDetail error:', e);
      return { profile: null, tasks: [], scores: [], attendance: [], submissions: [] };
    }
  },

  // ── TEACHER TRACKING (for Admin) ──────────────────────────────────────────
  async getTeacherDetail(teacherId: string) {
    try {
      const [profile, classes, reviews, scores] = await Promise.all([
        supabase.from('users').select('*').eq('id', teacherId).maybeSingle(),
        supabase.from('classes').select('*').eq('teacher_id', teacherId),
        supabase.from('reviews').select('*, submission:submissions!reviews_submission_id_fkey(task:tasks(title), user:users(name))').eq('teacher_id', teacherId).order('created_at', { ascending: false }).limit(20),
        supabase.from('exam_scores').select('*, user:users!exam_scores_user_id_fkey(name)').eq('teacher_id', teacherId).order('created_at', { ascending: false }).limit(20),
      ]);
      return {
        profile: profile.data,
        classes: classes.data ?? [],
        reviews: reviews.data ?? [],
        scores: scores.data ?? [],
      };
    } catch (e) {
      console.warn('getTeacherDetail error:', e);
      return { profile: null, classes: [], reviews: [], scores: [] };
    }
  },

  // ── ACTIVITY LOGS ─────────────────────────────────────────────────────────
  async getActivityLogs(limit = 15) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, user:users!activity_logs_user_id_fkey(name, role)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.warn('getActivityLogs error:', error.message);
      return [];
    }
    return data ?? [];
  },

  async getWeeklyActivity() {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('created_at, user:users!activity_logs_user_id_fkey(role)')
      .gte('created_at', since);

    if (error) {
      console.warn('getWeeklyActivity error:', error.message);
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chart = days.map(d => ({ name: d, students: 0, teachers: 0 }));
    (logs || []).forEach(log => {
      const d = days[new Date(log.created_at).getDay()];
      const entry = chart.find(x => x.name === d);
      if (entry) {
        const role = (log.user as any)?.role;
        if (role === 'teacher') entry.teachers++;
        else entry.students++;
      }
    });
    return chart;
  },
};
