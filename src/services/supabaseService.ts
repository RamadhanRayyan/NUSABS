import { supabase } from "@/lib/supabase";

export const supabaseService = {

  // ── PROFILES ──────────────────────────────────────────────────────────────
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*, class:classes(name)')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  // ── USER MANAGEMENT ───────────────────────────────────────────────────────
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*, class:classes(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getPendingUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*, class:classes(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getUsersByRole(role: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*, class:classes(name)')
      .eq('role', role)
      .eq('status', 'active')
      .order('name', { ascending: true });
    if (error) throw error;
    return data ?? [];
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
      .select('*, teacher:users(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
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
    if (error) throw error;
    return data ?? [];
  },

  async getAllTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, user:users(name, email, role)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async createTask(task: any) {
    const { error } = await supabase.from('tasks').insert([task]);
    if (error) throw error;
  },

  async updateTaskStatus(taskId: string, status: 'pending' | 'submitted' | 'reviewed') {
    const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId);
    if (error) throw error;
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
    let query = supabase
      .from('submissions')
      .select('*, user:users(name, email), task:tasks(title, type)');
    if (taskId) query = query.eq('task_id', taskId);
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
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
      .select('*, teacher:users(name)')
      .eq('submission_id', submissionId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  // ── ATTENDANCE ────────────────────────────────────────────────────────────
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
    if (error) throw error;
    return data ?? [];
  },

  async getAllAttendanceLogs(limit = 50) {
    const { data, error } = await supabase
      .from('check_logs')
      .select('*, user:users(name, email, role)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async getTodayAttendance() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from('check_logs')
      .select('*, user:users(name, email, role)')
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  // ── EXAM SCORES ───────────────────────────────────────────────────────────
  async getExamScores(userId: string) {
    const { data, error } = await supabase
      .from('exam_scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getAllExamScores() {
    const { data, error } = await supabase
      .from('exam_scores')
      .select('*, user:users(name, email), teacher:users!exam_scores_teacher_id_fkey(name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
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
    if (error) throw error;
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
    if (error) throw error;
  },

  async markAllRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    if (error) throw error;
  },

  // ── STATISTICS ────────────────────────────────────────────────────────────
  async getStudentStats(userId: string) {
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
  },

  async getTeacherStats() {
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
  },

  async getAdminStats() {
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
  },

  // ── STUDENT TRACKING (for Admin) ──────────────────────────────────────────
  async getStudentDetail(studentId: string) {
    const [profile, tasks, scores, logs, subs] = await Promise.all([
      supabase.from('users').select('*, class:classes(name)').eq('id', studentId).single(),
      supabase.from('tasks').select('*').eq('user_id', studentId).order('created_at', { ascending: false }),
      supabase.from('exam_scores').select('*').eq('user_id', studentId).order('created_at', { ascending: false }),
      supabase.from('check_logs').select('*').eq('user_id', studentId).order('created_at', { ascending: false }).limit(20),
      supabase.from('submissions').select('*, task:tasks(title, type)').eq('user_id', studentId).order('created_at', { ascending: false }),
    ]);
    return {
      profile: profile.data,
      tasks: tasks.data ?? [],
      scores: scores.data ?? [],
      attendance: logs.data ?? [],
      submissions: subs.data ?? [],
    };
  },

  // ── TEACHER TRACKING (for Admin) ──────────────────────────────────────────
  async getTeacherDetail(teacherId: string) {
    const [profile, classes, reviews, scores] = await Promise.all([
      supabase.from('users').select('*').eq('id', teacherId).single(),
      supabase.from('classes').select('*').eq('teacher_id', teacherId),
      supabase.from('reviews').select('*, submission:submissions(task:tasks(title), user:users(name))').eq('teacher_id', teacherId).order('created_at', { ascending: false }).limit(20),
      supabase.from('exam_scores').select('*, user:users(name)').eq('teacher_id', teacherId).order('created_at', { ascending: false }).limit(20),
    ]);
    return {
      profile: profile.data,
      classes: classes.data ?? [],
      reviews: reviews.data ?? [],
      scores: scores.data ?? [],
    };
  },

  // ── ACTIVITY LOGS ─────────────────────────────────────────────────────────
  async getActivityLogs(limit = 15) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*, user:users(name, role)')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async getWeeklyActivity() {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: logs } = await supabase
      .from('activity_logs')
      .select('created_at, user:users(role)')
      .gte('created_at', since);

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
