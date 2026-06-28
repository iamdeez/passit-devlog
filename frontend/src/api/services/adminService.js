import supabase from "../../config/supabaseClient";
import { isDemoMode } from "../../demo/demoConfig";
import { demoUsers } from "../../demo/demoData";

const demoSetStatus = (userId, status) => {
  const u = demoUsers.find((x) => String(x.id) === String(userId));
  if (u) u.status = status;
  return { success: true };
};

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
    if (isDemoMode()) {
      const kw = (keyword || "").toLowerCase();
      let list = demoUsers.filter((u) =>
        (!kw || u.name.includes(kw) || u.email.toLowerCase().includes(kw) || (u.nickname || "").toLowerCase().includes(kw)) &&
        (!status || u.status === status)
      );
      const total = list.length;
      const content = list.slice(page * size, page * size + size);
      return { success: true, data: { content, totalElements: total } };
    }

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
    if (isDemoMode()) {
      const u = demoUsers.find((x) => String(x.id) === String(userId));
      return u ? { success: true, data: u } : { success: false, error: "회원을 찾을 수 없습니다." };
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return { success: true, data: mapProfile(data) };
  },

  updateUser: async (userId, updates) => {
    if (isDemoMode()) {
      const u = demoUsers.find((x) => String(x.id) === String(userId));
      if (u) Object.assign(u, updates);
      return { success: true, data: u };
    }
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
    if (isDemoMode()) return demoSetStatus(userId, "SUSPENDED");
    const { error } = await supabase.from("profiles").update({ status: "SUSPENDED" }).eq("id", userId);
    if (error) throw error;
    return { success: true };
  },

  activateUser: async (userId) => {
    if (isDemoMode()) return demoSetStatus(userId, "ACTIVE");
    const { error } = await supabase.from("profiles").update({ status: "ACTIVE" }).eq("id", userId);
    if (error) throw error;
    return { success: true };
  },

  deleteUser: async (userId) => {
    if (isDemoMode()) return demoSetStatus(userId, "DELETED");
    const { error } = await supabase.from("profiles").update({ status: "DELETED" }).eq("id", userId);
    if (error) throw error;
    return { success: true };
  },
};

export default adminService;
