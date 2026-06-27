const today = new Date();

const addDays = (days, hour = 19) => {
  const date = new Date(today);
  date.setDate(today.getDate() + days);
  date.setHours(hour, 30, 0, 0);
  return date.toISOString();
};

export const demoUser = {
  userId: 9001,
  id: 9001,
  email: "demo.buyer@passit.app",
  name: "데모 구매자",
  nickname: "passit-demo",
  provider: "DEMO",
  role: "USER",
};

export const demoTickets = [
  {
    ticketId: 101,
    id: 101,
    ownerId: 7001,
    sellerId: 7001,
    sellerName: "정가양도러",
    eventName: "DAY6 WORLD TOUR - SEOUL",
    title: "DAY6 WORLD TOUR - SEOUL",
    description: "개인 일정으로 정가 양도합니다. 현장 확인 후 안전하게 거래 가능합니다.",
    categoryId: 1,
    eventLocation: "KSPO DOME",
    region: "서울",
    seatInfo: "FLOOR B구역 12열",
    tradeType: "ONSITE",
    ticketStatus: "AVAILABLE",
    originalPrice: 154000,
    sellingPrice: 154000,
    price: 154000,
    eventDate: addDays(12),
    createdAt: addDays(-2, 10),
    image1: "/images/concert.webp",
  },
  {
    ticketId: 102,
    id: 102,
    ownerId: 7002,
    sellerId: 7002,
    sellerName: "뮤지컬러버",
    eventName: "뮤지컬 레미제라블",
    title: "뮤지컬 레미제라블",
    description: "R석 1매 정가 양도합니다. 예매 내역 확인 가능합니다.",
    categoryId: 2,
    eventLocation: "블루스퀘어 신한카드홀",
    region: "서울",
    seatInfo: "1층 B구역 8열",
    tradeType: "DELIVERY",
    ticketStatus: "AVAILABLE",
    originalPrice: 170000,
    sellingPrice: 170000,
    price: 170000,
    eventDate: addDays(18, 20),
    createdAt: addDays(-1, 11),
    image1: "/images/defaultTicket.png",
  },
  {
    ticketId: 103,
    id: 103,
    ownerId: 7003,
    sellerId: 7003,
    sellerName: "야구직관",
    eventName: "두산 vs LG 주말 경기",
    title: "두산 vs LG 주말 경기",
    description: "잠실 1루 네이비석 연석 중 1매입니다. 정가 그대로 양도합니다.",
    categoryId: 3,
    eventLocation: "잠실야구장",
    region: "서울",
    seatInfo: "1루 네이비 315블럭",
    tradeType: "ONSITE",
    ticketStatus: "AVAILABLE",
    originalPrice: 28000,
    sellingPrice: 28000,
    price: 28000,
    eventDate: addDays(7, 17),
    createdAt: addDays(-3, 9),
    image1: "/images/defaultTicket.png",
  },
  {
    ticketId: 104,
    id: 104,
    ownerId: 7004,
    sellerId: 7004,
    sellerName: "전시산책",
    eventName: "국립현대미술관 특별전",
    title: "국립현대미술관 특별전",
    description: "주말 입장권 2매 중 1매 양도합니다.",
    categoryId: 4,
    eventLocation: "국립현대미술관 서울",
    region: "서울",
    seatInfo: "입장권",
    tradeType: "DELIVERY",
    ticketStatus: "RESERVED",
    originalPrice: 18000,
    sellingPrice: 18000,
    price: 18000,
    eventDate: addDays(5, 13),
    createdAt: addDays(-5, 16),
    image1: "/images/defaultTicket.png",
  },
];

export const demoDeals = [
  {
    id: 501,
    dealId: 501,
    ticketId: 101,
    ticketTitle: "DAY6 WORLD TOUR - SEOUL",
    buyerId: demoUser.userId,
    buyerName: demoUser.name,
    sellerId: 7001,
    sellerName: "정가양도러",
    status: "REQUESTED",
    price: 154000,
    buyerMessage: "현장에서 확인 후 거래하고 싶습니다.",
    createdAt: addDays(-1, 15),
  },
];

export const demoChatRooms = [
  {
    chatroomId: 301,
    ticketId: 101,
    ticketTitle: "DAY6 WORLD TOUR - SEOUL",
    sellerName: "정가양도러",
    lastMessage: "네, 예매 내역 확인 가능합니다.",
    lastMessageTime: new Date().toISOString(),
    unreadCount: 1,
  },
];

export const demoMessages = [
  {
    messageId: 1,
    chatroomId: 301,
    senderId: 7001,
    type: "SYSTEM",
    content: "양도 요청이 생성되었습니다.",
    createdAt: addDays(-1, 15),
  },
  {
    messageId: 2,
    chatroomId: 301,
    senderId: demoUser.userId,
    type: "TEXT",
    content: "안녕하세요. 티켓 정가 양도 가능할까요?",
    createdAt: addDays(-1, 15),
  },
  {
    messageId: 3,
    chatroomId: 301,
    senderId: 7001,
    type: "TEXT",
    content: "네, 예매 내역 확인 가능합니다.",
    createdAt: new Date().toISOString(),
  },
];

export const buildPage = (content, page = 0, size = 20) => ({
  content,
  page,
  size,
  totalPages: Math.max(1, Math.ceil(content.length / size)),
  totalElements: content.length,
});

