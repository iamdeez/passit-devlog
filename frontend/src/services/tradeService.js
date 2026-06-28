import supabase from "../config/supabaseClient";
import { isDemoMode } from "../demo/demoConfig";
import { demoDeals, demoUser, buildPage } from "../demo/demoData";

const DEAL_SELECT = `
  *,
  ticket:tickets!ticket_id(ticket_id, event_name, selling_price, image1, ticket_status),
  buyer:profiles!buyer_id(id, nickname, profile_image_url),
  seller:profiles!seller_id(id, nickname, profile_image_url)
`;

class TradeService {
  async createDeal(ticketId, chatroomId) {
    const { data, error } = await supabase.rpc("create_deal", {
      p_ticket_id: ticketId,
      p_chatroom_id: chatroomId,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  async acceptDeal(dealId, chatroomId) {
    const { data, error } = await supabase.rpc("accept_deal", {
      p_deal_id: dealId,
      p_chatroom_id: chatroomId,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  async rejectDeal(dealId, chatroomId, cancelReason = null) {
    const { data, error } = await supabase.rpc("reject_deal", {
      p_deal_id: dealId,
      p_chatroom_id: chatroomId,
      p_cancel_reason: cancelReason,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  async confirmDeal(dealId) {
    const { data, error } = await supabase
      .from("deals")
      .update({ deal_status: "COMPLETED" })
      .eq("deal_id", dealId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async cancelDeal(dealId, cancelReason = null) {
    const { data, error } = await supabase
      .from("deals")
      .update({ deal_status: "CANCELLED", cancel_reason: cancelReason })
      .eq("deal_id", dealId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async getDealDetail(dealId) {
    if (isDemoMode()) {
      const d = demoDeals.find((x) => String(x.dealId) === String(dealId));
      return d ? { ...d } : null;
    }
    const { data, error } = await supabase
      .from("deals")
      .select(DEAL_SELECT)
      .eq("deal_id", dealId)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async getMyDeals({ status, role } = {}) {
    if (isDemoMode()) {
      let list = demoDeals.slice();
      if (role === "buyer") list = list.filter((d) => String(d.buyerId) === String(demoUser.userId));
      else if (role === "seller") list = list.filter((d) => String(d.sellerId) === String(demoUser.userId));
      if (status) list = list.filter((d) => d.status === status);
      return { success: true, data: buildPage(list) };
    }
    const { data: { user } } = await supabase.auth.getUser();
    let query = supabase.from("deals").select(DEAL_SELECT);

    if (role === "buyer") query = query.eq("buyer_id", user.id);
    else if (role === "seller") query = query.eq("seller_id", user.id);
    else query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

    if (status) query = query.eq("deal_status", status);

    const { data, error } = await query.order("deal_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async getPurchaseHistory(params = {}) {
    return this.getMyDeals({ ...params, role: "buyer" });
  }

  async getSalesHistory(params = {}) {
    return this.getMyDeals({ ...params, role: "seller" });
  }

  // ── 결제 ─────────────────────────────────────────────────

  async preparePayment({ dealId, amount, paymentMethod = "CARD" }) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: deal } = await supabase
      .from("deals")
      .select("seller_id")
      .eq("deal_id", dealId)
      .single();

    const { data, error } = await supabase
      .from("payments")
      .insert({
        deal_id: dealId,
        buyer_id: user.id,
        seller_id: deal.seller_id,
        price: amount,
        payment_method: paymentMethod,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async getPaymentByDeal(dealId) {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("deal_id", dealId)
      .order("payment_date", { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== "PGRST116") throw new Error(error.message);
    return data ?? null;
  }

  async getMyPayments({ status } = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    let query = supabase
      .from("payments")
      .select("*, deal:deals(*, ticket:tickets(event_name))")
      .eq("buyer_id", user.id)
      .order("payment_date", { ascending: false });
    if (status) query = query.eq("payment_status", status);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data ?? [];
  }
}

export default new TradeService();
