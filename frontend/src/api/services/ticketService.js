import supabase from "../../config/supabaseClient";
import { isDemoMode } from "../../demo/demoConfig";
import demoTicketService from "../../demo/demoTicketService";
import { demoTickets, demoUser, buildPage } from "../../demo/demoData";

const TICKET_SELECT = `
  *,
  owner:users!owner_id(id:user_id, nickname, profile_image_url),
  category:categories!category_id(id, name, parent_id, depth)
`;

const SORT_COL = {
  eventDate: "event_date",
  createdAt: "created_at",
  sellingPrice: "selling_price",
  originalPrice: "original_price",
  event_date: "event_date",
  created_at: "created_at",
  selling_price: "selling_price",
};

const mapTicket = (t) => !t ? null : {
  ticketId: t.ticket_id,
  eventName: t.event_name,
  eventDate: t.event_date,
  eventLocation: t.event_location,
  ownerId: t.owner_id,
  ticketStatus: t.ticket_status,
  originalPrice: t.original_price,
  sellingPrice: t.selling_price,
  seatInfo: t.seat_info,
  ticketType: t.ticket_type,
  categoryId: t.category_id,
  image1: t.image1,
  image2: t.image2,
  description: t.description,
  tradeType: t.trade_type,
  createdAt: t.created_at,
  updatedAt: t.updated_at,
  owner: t.owner,
  category: t.category,
  rootCategoryId: t.category?.depth === 0 ? t.category?.id : t.category?.parent_id,
};

export const ticketService = {
  async getTickets({
    keyword,
    eventName,
    categoryId,
    status,
    ticketStatus,
    sortBy = "created_at",
    sortDirection = "DESC",
    page = 0,
    size = 20,
  } = {}) {
    if (isDemoMode()) {
      return demoTicketService.getTickets({ keyword, eventName, categoryId, status, ticketStatus, sortBy, sortDirection, page, size });
    }

    const effectiveStatus = ticketStatus || status || "AVAILABLE";
    const effectiveKeyword = eventName || keyword;
    const sortCol = SORT_COL[sortBy] || sortBy;
    const ascending = sortDirection === "ASC";

    let query = supabase
      .from("ticket")
      .select(TICKET_SELECT, { count: "exact" })
      .eq("ticket_status", effectiveStatus)
      .order(sortCol, { ascending })
      .range(page * size, (page + 1) * size - 1);

    if (effectiveKeyword) query = query.ilike("event_name", `%${effectiveKeyword}%`);
    if (categoryId) {
      // 루트 카테고리 ID → 해당 ID + 모든 서브카테고리 ID로 확장
      const { data: relatedCats } = await supabase
        .from("categories")
        .select("id")
        .or(`id.eq.${categoryId},parent_id.eq.${categoryId}`);
      const catIds = relatedCats?.map((c) => c.id) ?? [categoryId];
      query = query.in("category_id", catIds);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return {
      success: true,
      data: {
        content: (data ?? []).map(mapTicket),
        totalElements: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / size),
        page,
        size,
      },
    };
  },

  async getTicketById(ticketId) {
    if (isDemoMode()) {
      const r = await demoTicketService.getTicketDetail(ticketId);
      return r.success ? r.data : null;
    }
    const { data, error } = await supabase
      .from("ticket")
      .select(TICKET_SELECT)
      .eq("ticket_id", ticketId)
      .single();
    if (error) throw new Error(error.message);
    return mapTicket(data);
  },

  async getTicketDetail(ticketId) {
    try {
      const ticket = await this.getTicketById(ticketId);
      return { success: true, data: ticket };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  async createTicket(ticketData) {
    if (isDemoMode()) {
      const r = await demoTicketService.createTicket(ticketData);
      return r.data;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("ticket")
      .insert({ ...ticketData, owner_id: user.id })
      .select(TICKET_SELECT)
      .single();
    if (error) throw new Error(error.message);
    return mapTicket(data);
  },

  async updateTicket(ticketId, updates) {
    if (isDemoMode()) {
      const base = demoTickets.find((t) => String(t.ticketId) === String(ticketId)) || {};
      return { ...base, ...updates };
    }
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("ticket")
      .update(updates)
      .eq("ticket_id", ticketId)
      .eq("owner_id", user.id)
      .select(TICKET_SELECT)
      .single();
    if (error) throw new Error(error.message);
    return mapTicket(data);
  },

  async deleteTicket(ticketId) {
    if (isDemoMode()) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("ticket")
      .delete()
      .eq("ticket_id", ticketId)
      .eq("owner_id", user.id);
    if (error) throw new Error(error.message);
  },

  async getMyTickets({ status, ticketStatus, page = 0, size = 20 } = {}) {
    if (isDemoMode()) {
      const want = ticketStatus || status;
      const mine = demoTickets.filter(
        (t) => String(t.ownerId) === String(demoUser.userId) && (!want || t.ticketStatus === want)
      );
      return { success: true, data: buildPage(mine, page, size) };
    }
    const { data: { user } } = await supabase.auth.getUser();
    const effectiveStatus = ticketStatus || status;
    let query = supabase
      .from("ticket")
      .select(TICKET_SELECT, { count: "exact" })
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .range(page * size, (page + 1) * size - 1);

    if (effectiveStatus) query = query.eq("ticket_status", effectiveStatus);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return {
      success: true,
      data: {
        content: (data ?? []).map(mapTicket),
        totalElements: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / size),
        page,
        size,
      },
    };
  },

  async uploadImage(file, ticketId) {
    if (isDemoMode()) return "/images/concert.webp";
    const { data: { user } } = await supabase.auth.getUser();
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${ticketId ?? "temp"}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("ticket-images").upload(path, file);
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = supabase.storage.from("ticket-images").getPublicUrl(path);
    return publicUrl;
  },

  async toggleFavorite(ticketId) {
    if (isDemoMode()) return { success: true, data: true };
    const { data: { user } } = await supabase.auth.getUser();
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("ticket_id", ticketId)
      .single();

    if (existing) {
      await supabase.from("favorites").delete().eq("id", existing.id);
      return { success: true, data: false };
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, ticket_id: ticketId });
      return { success: true, data: true };
    }
  },

  async checkFavorite(ticketId) {
    if (isDemoMode()) return { success: true, data: false };
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("ticket_id", ticketId)
      .maybeSingle();
    return { success: true, data: !!data };
  },

  async getMyFavorites() {
    if (isDemoMode()) return demoTickets.slice(0, 4);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("favorites")
      .select(`ticket:ticket(${TICKET_SELECT.trim()})`)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((f) => mapTicket(f.ticket));
  },
};

export default ticketService;
