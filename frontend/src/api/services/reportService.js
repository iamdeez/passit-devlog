import supabase from "../../config/supabaseClient";

export const reportService = {
  async createReport({ targetType, targetId, reason }) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("reports")
      .insert({ user_id: user.id, target_type: targetType, target_id: targetId, reason })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getMyReports() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getAdminReports({ status } = {}) {
    let query = supabase
      .from("reports")
      .select("*, reporter:profiles!user_id(nickname, email)")
      .order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async updateReportStatus(reportId, status) {
    const { data, error } = await supabase
      .from("reports")
      .update({ status })
      .eq("id", reportId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
};

export default reportService;
