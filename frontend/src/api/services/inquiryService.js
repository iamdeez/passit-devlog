import supabase from "../../config/supabaseClient";
import { isDemoMode } from "../../demo/demoConfig";
import { demoCsService } from "../../demo/demoCsService";

// ── 유저 ──────────────────────────────────────────────────

export const getMyInquiries = async () => {
  if (isDemoMode()) {
    const r = await demoCsService.getInquiries();
    // InquiryListPage 는 res.data 를 배열로 읽는다.
    return { data: r.data.content };
  }
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*, inquiry_images(*)")
    .eq("user_id", user.id)
    .eq("deleted", false)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
};

export const getInquiryDetail = async (inquiryId) => {
  const { data, error } = await supabase
    .from("inquiries")
    .select("*, inquiry_images(*)")
    .eq("id", inquiryId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const createInquiry = async ({ title, content, type, images = [] }) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: inquiry, error } = await supabase
    .from("inquiries")
    .insert({ user_id: user.id, title, content, type })
    .select()
    .single();
  if (error) throw new Error(error.message);

  if (images.length > 0) {
    await supabase.from("inquiry_images").insert(
      images.map((url) => ({ inquiry_id: inquiry.id, image_url: url }))
    );
  }
  return inquiry;
};

export const deleteInquiry = async (inquiryId) => {
  const { error } = await supabase
    .from("inquiries")
    .update({ deleted: true })
    .eq("id", inquiryId);
  if (error) throw new Error(error.message);
};

// ── 관리자 ────────────────────────────────────────────────

export const getAdminInquiries = async ({ status } = {}) => {
  let query = supabase
    .from("inquiries")
    .select("*, user:profiles!user_id(nickname, email), inquiry_images(*)")
    .eq("deleted", false)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
};

export const answerInquiry = async (inquiryId, { answer_content }) => {
  const { data, error } = await supabase
    .from("inquiries")
    .update({
      answer_content,
      status: "ANSWERED",
      answered_at: new Date().toISOString(),
    })
    .eq("id", inquiryId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};
