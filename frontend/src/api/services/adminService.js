import supabase from "../../config/supabaseClient";

const mapProfile = (u) => ({
  userId: u.id,
  email: u.email,
  name: u.name,
  nickname: u.nickname,
  phone: u.phone,
  profileImageUrl: u.profile_image_url,
  role: u.role,
  status: u.status,
  provider: u.provider,
  createdAt: u.created_at,
  updatedAt: u.updated_at,
});

export const adminService = {
  searchUsers: async ({ keyword, status, page = 0, size = 10, sortBy = "createdAt", sortDirection = "DESC" } = {}) => {
    let query = supabase.from("profiles").select("*", { count: "exact" });

    if (keyword) {
      query = query.or(`name.ilike.%${keyword}%,email.ilike.%${keyword}%,nickname.ilike.%${keyword}%`);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const column = sortBy === "createdAt" ? "created_at" : sortBy;
    query = query.order(column, { ascending: sortDirection === "ASC" });
    query = query.range(page * size, page * size + size - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      success: true,
      data: { content: data.map(mapProfile), totalElements: count },
    };
  },

  getUserById: async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return { success: true, data: mapProfile(data) };
  },

  updateUser: async (userId, updates) => {
    const patch = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.nickname !== undefined) patch.nickname = updates.nickname;
    if (updates.profileImageUrl !== undefined) patch.profile_image_url = updates.profileImageUrl;

    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data: mapProfile(data) };
  },

  suspendUser: async (userId) => {
    const { error } = await supabase.from("profiles").update({ status: "SUSPENDED" }).eq("id", userId);
    if (error) throw error;
    return { success: true };
  },

  activateUser: async (userId) => {
    const { error } = await supabase.from("profiles").update({ status: "ACTIVE" }).eq("id", userId);
    if (error) throw error;
    return { success: true };
  },

  deleteUser: async (userId) => {
    const { error } = await supabase.from("profiles").update({ status: "DELETED" }).eq("id", userId);
    if (error) throw error;
    return { success: true };
  },
};

export default adminService;
