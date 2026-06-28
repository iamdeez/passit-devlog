import supabase from "../config/supabaseClient";
import { isDemoMode } from "../demo/demoConfig";
import { demoCsService } from "../demo/demoCsService";

export const getNotices = async ({ page = 0, size = 20 } = {}) => {
  if (isDemoMode()) {
    const r = await demoCsService.getNotices({ page, size });
    // NoticeListPage 는 res.data.data 를 배열로 읽는다.
    return { data: { data: r.data.content } };
  }
  const { data, error, count } = await supabase
    .from("notices")
    .select("*", { count: "exact" })
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false })
    .range(page * size, (page + 1) * size - 1);
  if (error) throw new Error(error.message);
  return { content: data ?? [], totalElements: count ?? 0 };
};

export const getNoticeDetail = async (noticeId) => {
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("notice_id", noticeId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const createAdminNotice = async (payload) => {
  const { data, error } = await supabase.from("notices").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const getAdminNotices = async ({ page = 0, size = 20 } = {}) => {
  const { data, error, count } = await supabase
    .from("notices")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(page * size, (page + 1) * size - 1);
  if (error) throw new Error(error.message);
  return { content: data ?? [], totalElements: count ?? 0 };
};

export const updateAdminNotice = async (noticeId, payload) => {
  const { data, error } = await supabase
    .from("notices").update(payload).eq("notice_id", noticeId).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteAdminNotice = async (noticeId) => {
  const { error } = await supabase.from("notices").delete().eq("notice_id", noticeId);
  if (error) throw new Error(error.message);
};
