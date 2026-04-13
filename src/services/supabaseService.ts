import { supabase } from "@/lib/supabase";

export const supabaseService = {
  // Profiles
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw error;
    return data;
  },

  // Projects
  async getProjects(studentId?: string) {
    let query = supabase.from('projects').select('*');
    if (studentId) {
      query = query.eq('student_id', studentId);
    } else {
      query = query.eq('status', 'published');
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createProject(project: any) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project]);
    
    if (error) throw error;
    return data;
  },

  // Daily Activities
  async getDailyActivity(userId: string, date: string) {
    const { data, error } = await supabase
      .from('daily_activities')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data;
  },

  async upsertDailyActivity(activity: any) {
    const { data, error } = await supabase
      .from('daily_activities')
      .upsert(activity, { onConflict: 'user_id,date' });
    
    if (error) throw error;
    return data;
  }
};
