import { buildPage, demoTickets, demoUser } from "./demoData";

const categoryMap = {
  1: "뮤지컬",
  2: "연극",
  3: "콘서트",
  4: "스포츠",
  5: "전시",
  6: "클래식",
  7: "기타",
};

const normalize = (value) => String(value || "").toLowerCase();

const filterTickets = (params = {}) => {
  const keyword = normalize(params.keyword || params.eventName);
  const categoryId = params.categoryId ? Number(params.categoryId) : null;
  const category = normalize(params.category);
  const status = params.ticketStatus || params.status;
  const region = normalize(params.region);

  return demoTickets.filter((ticket) => {
    const matchesKeyword =
      !keyword ||
      normalize(ticket.eventName).includes(keyword) ||
      normalize(ticket.description).includes(keyword) ||
      normalize(ticket.eventLocation).includes(keyword);
    const matchesCategoryId = !categoryId || ticket.categoryId === categoryId;
    const matchesCategory =
      !category || normalize(categoryMap[ticket.categoryId]).includes(category);
    const matchesStatus = !status || ticket.ticketStatus === status;
    const matchesRegion = !region || normalize(ticket.region).includes(region);

    return matchesKeyword && matchesCategoryId && matchesCategory && matchesStatus && matchesRegion;
  });
};

export const demoTicketService = {
  async getTickets(params = {}) {
    const page = Number(params.page || 0);
    const size = Number(params.size || 20);
    const filtered = filterTickets(params);
    const content = filtered.slice(page * size, page * size + size);

    return {
      success: true,
      data: buildPage(content, page, size),
    };
  },

  async getTicketDetail(ticketId) {
    const ticket = demoTickets.find((item) => String(item.ticketId) === String(ticketId));

    if (!ticket) {
      return {
        success: false,
        error: "티켓 정보를 찾을 수 없습니다.",
      };
    }

    return {
      success: true,
      data: ticket,
    };
  },

  async getMyTickets(params = {}) {
    return this.getTickets(params);
  },

  async createTicket(formData) {
    const eventName =
      (formData instanceof FormData ? formData.get("eventName") : formData?.eventName) ||
      "데모 티켓";
    const sellingPrice = Number(
      (formData instanceof FormData ? formData.get("sellingPrice") : formData?.sellingPrice) || 0
    );
    const newTicket = {
      ticketId: Date.now(),
      id: Date.now(),
      ownerId: demoUser.userId,
      sellerId: demoUser.userId,
      sellerName: demoUser.name,
      eventName,
      title: eventName,
      ticketStatus: "AVAILABLE",
      sellingPrice,
      price: sellingPrice,
      createdAt: new Date().toISOString(),
    };
    demoTickets.unshift(newTicket);
    return { success: true, data: newTicket };
  },

  async toggleFavorite() {
    return { success: true, data: true };
  },

  async checkFavorite() {
    return { success: true, data: false };
  },
};

export default demoTicketService;

