import { demoDeals, demoTickets, demoUser } from "./demoData";

let _deals = demoDeals.map((d) => ({ ...d }));
let _payments = [];

const findDeal = (dealId) => _deals.find((d) => String(d.dealId ?? d.id) === String(dealId));

export const demoTradeService = {
  async createDealRequest({ ticketId, quantity = 1 }) {
    const ticket = demoTickets.find((t) => String(t.ticketId) === String(ticketId));
    if (!ticket) return { success: false, error: "티켓 정보를 찾을 수 없습니다." };

    const id = Date.now();
    const deal = {
      id,
      dealId: id,
      ticketId: ticket.ticketId,
      ticketTitle: ticket.eventName,
      eventName: ticket.eventName,
      buyerId: demoUser.userId,
      buyerName: demoUser.name,
      sellerId: ticket.ownerId,
      sellerName: ticket.sellerName,
      status: "REQUESTED",
      dealStatus: "REQUESTED",
      quantity,
      price: ticket.sellingPrice * quantity,
      buyerMessage: "데모 모드에서 생성된 양도 요청입니다.",
      createdAt: new Date().toISOString(),
      ticket,
    };

    _deals.unshift(deal);
    return { success: true, data: deal };
  },

  async getDealDetail(dealId) {
    const deal = findDeal(dealId);
    if (!deal) return { success: false, error: "거래를 찾을 수 없습니다." };
    const ticket = demoTickets.find((t) => String(t.ticketId) === String(deal.ticketId));
    return { success: true, data: { ...deal, ticket } };
  },

  async acceptDeal(dealId) {
    const deal = findDeal(dealId);
    if (!deal) return { success: false, error: "거래를 찾을 수 없습니다." };
    deal.status = "ACCEPTED";
    deal.dealStatus = "ACCEPTED";

    const paymentId = (deal.dealId ?? deal.id) * 100;
    const existing = _payments.find((p) => String(p.dealId) === String(deal.dealId ?? deal.id));
    if (!existing) {
      _payments.push({
        paymentId,
        dealId: deal.dealId ?? deal.id,
        buyerId: deal.buyerId,
        amount: deal.price,
        paymentStatus: "PENDING",
        createdAt: new Date().toISOString(),
      });
    }
    deal.paymentId = paymentId;

    return { success: true, data: { ...deal } };
  },

  async rejectDeal(dealId) {
    const deal = findDeal(dealId);
    if (!deal) return { success: false, error: "거래를 찾을 수 없습니다." };
    deal.status = "REJECTED";
    deal.dealStatus = "REJECTED";
    return { success: true, data: { ...deal } };
  },

  async cancelDeal(dealId) {
    const deal = findDeal(dealId);
    if (!deal) return { success: false, error: "거래를 찾을 수 없습니다." };
    deal.status = "CANCELLED";
    deal.dealStatus = "CANCELLED";
    return { success: true, data: { ...deal } };
  },

  async confirmDeal(dealId) {
    const deal = findDeal(dealId);
    if (!deal) return { success: false, error: "거래를 찾을 수 없습니다." };
    deal.status = "COMPLETED";
    deal.dealStatus = "COMPLETED";
    return { success: true, data: { ...deal } };
  },

  async getMyDeals(params = {}) {
    return {
      success: true,
      data: {
        content: _deals,
        page: 0,
        size: 20,
        totalPages: 1,
        totalElements: _deals.length,
      },
    };
  },

  async getPurchaseHistory(params = {}) {
    const purchases = _deals.filter((d) => String(d.buyerId) === String(demoUser.userId));
    return {
      success: true,
      data: {
        content: purchases,
        page: 0,
        size: 20,
        totalPages: 1,
        totalElements: purchases.length,
      },
    };
  },

  async getSalesHistory(params = {}) {
    return { success: true, data: { content: [], page: 0, size: 20, totalPages: 0, totalElements: 0 } };
  },

  async getPaymentByDeal(dealId) {
    const payment = _payments.find((p) => String(p.dealId) === String(dealId));
    if (!payment) return { success: false, error: "결제 정보를 찾을 수 없습니다." };
    const deal = findDeal(dealId);
    const ticket = deal ? demoTickets.find((t) => String(t.ticketId) === String(deal.ticketId)) : null;
    return { success: true, data: { payment, payments: payment, deal, ticket } };
  },

  async getPaymentDetail(paymentId) {
    const payment = _payments.find((p) => String(p.paymentId) === String(paymentId));
    if (!payment) return { success: false, error: "결제 정보를 찾을 수 없습니다." };
    const deal = findDeal(payment.dealId);
    const ticket = deal ? demoTickets.find((t) => String(t.ticketId) === String(deal.ticketId)) : null;
    return { success: true, data: { payments: payment, deal, ticket } };
  },

  async completePayment(paymentId) {
    const payment = _payments.find((p) => String(p.paymentId) === String(paymentId));
    if (!payment) return { success: false, error: "결제 정보를 찾을 수 없습니다." };
    payment.paymentStatus = "PAID";
    const deal = findDeal(payment.dealId);
    if (deal) {
      deal.status = "PAID";
      deal.dealStatus = "PAID";
    }
    return { success: true, data: { ...payment } };
  },
};

export default demoTradeService;
