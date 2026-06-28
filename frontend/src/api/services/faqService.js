import supabase from "../../config/supabaseClient";
import { isDemoMode } from "../../demo/demoConfig";
import { demoCsService } from "../../demo/demoCsService";

export const getFaqs = async () => {
  if (isDemoMode()) {
    const r = await demoCsService.getFaqs();
    return r.data.content;
  }
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_visible", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
};

export const getFaqDetail = async (faqId) => {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("faq_id", faqId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getAdminFaqs = async () => {
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
};

export const createFaq = async (payload) => {
  const { data, error } = await supabase.from("faqs").insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateFaq = async (faqId, payload) => {
  const { data, error } = await supabase
    .from("faqs")
    .update(payload)
    .eq("faq_id", faqId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteFaq = async (faqId) => {
  const { error } = await supabase.from("faqs").delete().eq("faq_id", faqId);
  if (error) throw new Error(error.message);
};
