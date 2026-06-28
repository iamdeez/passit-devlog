const today = new Date();

const addDays = (days, hour = 19) => {
  const date = new Date(today);
  date.setDate(today.getDate() + days);
  date.setHours(hour, 30, 0, 0);
  return date.toISOString();
};

// ── 데모 계정 ───────────────────────────────────────────────
// 데모 모드 로그인은 백엔드 없이 아래 사용자로 매핑된다(AuthContext 참조).
export const demoUser = {
  userId: 9001,
  id: 9001,
  email: "demo@passit.app",
  name: "데모 구매자",
  nickname: "passit-demo",
  provider: "DEMO",
  role: "USER",
  status: "ACTIVE",
};

export const demoAdmin = {
  userId: 9000,
  id: 9000,
  email: "admin@passit.app",
  name: "데모 관리자",
  nickname: "passit-admin",
  provider: "DEMO",
  role: "ADMIN",
  status: "ACTIVE",
};

// ── 티켓 팩토리 ─────────────────────────────────────────────
// 카테고리 ID 규칙(앱 공통): 1=뮤지컬 2=연극 3=콘서트 4=스포츠 5=전시 6=클래식 7=기타
// 콘서트(cat 3)는 번들된 실제 이미지, 그 외는 깨지지 않는 Picsum CDN 시드 이미지 사용.
const eventImage = (cat, id) =>
  cat === 3 ? "/images/concert.webp" : `https://picsum.photos/seed/passit${id}/640/420`;

let _tid = 100;
const mkTicket = (o) => {
  _tid += 1;
  const id = _tid;
  const sell = o.sell ?? o.price;
  return {
    ticketId: id,
    id,
    ownerId: o.ownerId ?? 7000 + id,
    sellerId: o.ownerId ?? 7000 + id,
    sellerName: o.seller,
    eventName: o.name,
    title: o.name,
    description: o.desc ?? `${o.name} 정가 양도합니다. 예매 내역 확인 가능하며 안전하게 거래합니다.`,
    categoryId: o.cat,
    eventLocation: o.venue,
    region: o.region ?? "서울",
    seatInfo: o.seat,
    tradeType: o.trade ?? "ONSITE",
    ticketStatus: o.status ?? "AVAILABLE",
    originalPrice: o.price,
    sellingPrice: sell,
    price: sell,
    eventDate: addDays(o.in, o.hour ?? 19),
    createdAt: addDays(o.created ?? -3, 10),
    image1: eventImage(o.cat, id),
  };
};

export const demoTickets = [
  // ── 콘서트 (cat 3) ──
  mkTicket({ name: "DAY6 WORLD TOUR - SEOUL", seller: "정가양도러", cat: 3, venue: "KSPO DOME", seat: "FLOOR B구역 12열", price: 154000, in: 12, created: -1 }),
  mkTicket({ name: "아이유 HEREH 콘서트", seller: "유애나", cat: 3, venue: "서울월드컵경기장", seat: "남측 A구역 7열", price: 165000, in: 21, created: -2 }),
  mkTicket({ name: "세븐틴 FOLLOW TOUR", seller: "캐럿러브", cat: 3, venue: "고척스카이돔", seat: "1루 202블럭", price: 143000, in: 9, created: -4 }),
  mkTicket({ name: "NewJeans 팬미팅 BUNNIES", seller: "토끼굴", cat: 3, venue: "올림픽홀", seat: "지정석 D열 11번", price: 132000, sell: 120000, in: 30, created: -1 }),
  mkTicket({ name: "에스파 SYNK 콘서트", seller: "마이", cat: 3, venue: "잠실실내체육관", seat: "플로어 스탠딩 C", price: 154000, in: 16, region: "서울", created: -6 }),
  mkTicket({ name: "콜드플레이 내한공연", seller: "musicpark", cat: 3, venue: "고양종합운동장", seat: "스탠딩 A존", price: 198000, in: 40, region: "경기", created: -8, status: "RESERVED" }),

  // ── 뮤지컬 (cat 1) ──
  mkTicket({ name: "뮤지컬 레미제라블", seller: "뮤지컬러버", cat: 1, venue: "블루스퀘어 신한카드홀", seat: "1층 B구역 8열", price: 170000, in: 18, trade: "DELIVERY", hour: 20, created: -1 }),
  mkTicket({ name: "뮤지컬 오페라의 유령", seller: "팬텀", cat: 1, venue: "샤롯데씨어터", seat: "OP석 3열 14번", price: 190000, in: 25, trade: "DELIVERY", hour: 19, created: -3 }),
  mkTicket({ name: "뮤지컬 위키드", seller: "에메랄드", cat: 1, venue: "예술의전당 오페라극장", seat: "1층 A구역 5열", price: 160000, sell: 150000, in: 11, trade: "DELIVERY", hour: 15, created: -2 }),
  mkTicket({ name: "뮤지컬 지킬앤하이드", seller: "이중인격", cat: 1, venue: "블루스퀘어 신한카드홀", seat: "2층 1열 22번", price: 140000, in: 33, trade: "DELIVERY", created: -5 }),

  // ── 스포츠 (cat 4) ──
  mkTicket({ name: "두산 vs LG 주말 경기", seller: "야구직관", cat: 4, venue: "잠실야구장", seat: "1루 네이비 315블럭", price: 28000, in: 7, hour: 17, created: -3 }),
  mkTicket({ name: "FC서울 vs 울산 K리그", seller: "축덕", cat: 4, venue: "서울월드컵경기장", seat: "북측 응원석 12열", price: 35000, in: 5, hour: 16, created: -2 }),
  mkTicket({ name: "롯데 vs 삼성 사직 직관", seller: "부산갈매기", cat: 4, venue: "사직야구장", seat: "중앙 블루석 5블럭", price: 30000, in: 9, hour: 18, region: "부산", created: -1 }),
  mkTicket({ name: "KBL 챔피언결정전 4차전", seller: "농구사랑", cat: 4, venue: "잠실실내체육관", seat: "코트사이드 C", price: 45000, sell: 42000, in: 14, hour: 19, created: -4, status: "RESERVED" }),

  // ── 전시 (cat 5) ──
  mkTicket({ name: "반 고흐 인사이드 특별전", seller: "전시산책", cat: 5, venue: "그라운드시소 명동", seat: "주말 입장권", price: 20000, in: 6, trade: "DELIVERY", hour: 13, created: -5 }),
  mkTicket({ name: "팀랩 보더리스 서울", seller: "라이트아트", cat: 5, venue: "아르떼뮤지엄", seat: "성인 1매", price: 22000, sell: 19000, in: 10, trade: "DELIVERY", hour: 11, created: -2 }),
  mkTicket({ name: "모네에서 워홀까지", seller: "큐레이터", cat: 5, venue: "예술의전당 한가람미술관", seat: "성인 입장권", price: 18000, in: 20, trade: "DELIVERY", hour: 14, created: -7 }),

  // ── 클래식 (cat 6) ──
  mkTicket({ name: "빈 필하모닉 신년음악회", seller: "클래식홀릭", cat: 6, venue: "롯데콘서트홀", seat: "R석 2층 1열", price: 120000, in: 28, hour: 20, created: -3 }),
  mkTicket({ name: "조성진 피아노 리사이틀", seller: "피아니시모", cat: 6, venue: "예술의전당 콘서트홀", seat: "VIP석 1층 7열", price: 90000, in: 15, hour: 19, created: -1 }),
  mkTicket({ name: "서울시향 정기연주회", seller: "필하모니아", cat: 6, venue: "롯데콘서트홀", seat: "S석 1층 12열", price: 60000, sell: 55000, in: 8, hour: 20, created: -4 }),

  // ── 데모 사용자(판매자) 본인 등록 티켓 ──
  mkTicket({ name: "임영웅 IM HERO 앵콜", seller: demoUser.name, ownerId: demoUser.userId, cat: 3, venue: "KSPO DOME", seat: "FLOOR A구역 3열", price: 132000, in: 22, created: -2 }),
  mkTicket({ name: "뮤지컬 햄릿", seller: demoUser.name, ownerId: demoUser.userId, cat: 1, venue: "충무아트센터 대극장", seat: "1층 C구역 9열", price: 110000, sell: 100000, in: 19, trade: "DELIVERY", created: -3, status: "SOLD" }),
];

// 빠른 조회용 인덱스
const t = (idx) => demoTickets[idx];

// ── 거래(Deal) — 구매자/판매자 관점 + 다양한 상태 ──────────────
export const demoDeals = [
  {
    id: 501, dealId: 501,
    ticketId: t(0).ticketId, ticketTitle: t(0).eventName,
    buyerId: demoUser.userId, buyerName: demoUser.name,
    sellerId: t(0).sellerId, sellerName: t(0).sellerName,
    status: "REQUESTED", price: t(0).price,
    buyerMessage: "현장에서 확인 후 거래하고 싶습니다.",
    createdAt: addDays(-1, 15),
  },
  {
    id: 502, dealId: 502,
    ticketId: t(6).ticketId, ticketTitle: t(6).eventName,
    buyerId: demoUser.userId, buyerName: demoUser.name,
    sellerId: t(6).sellerId, sellerName: t(6).sellerName,
    status: "ACCEPTED", price: t(6).price,
    buyerMessage: "택배 거래 원합니다. 결제 진행할게요.",
    createdAt: addDays(-2, 11),
  },
  {
    id: 503, dealId: 503,
    ticketId: t(10).ticketId, ticketTitle: t(10).eventName,
    buyerId: demoUser.userId, buyerName: demoUser.name,
    sellerId: t(10).sellerId, sellerName: t(10).sellerName,
    status: "COMPLETED", price: t(10).price,
    buyerMessage: "감사합니다! 잘 받았어요.",
    createdAt: addDays(-9, 14),
  },
  {
    id: 504, dealId: 504,
    ticketId: t(14).ticketId, ticketTitle: t(14).eventName,
    buyerId: demoUser.userId, buyerName: demoUser.name,
    sellerId: t(14).sellerId, sellerName: t(14).sellerName,
    status: "REJECTED", price: t(14).price,
    buyerMessage: "혹시 직거래도 가능할까요?",
    createdAt: addDays(-6, 10),
  },
  // 데모 사용자가 '판매자'인 들어온 양도 요청
  {
    id: 505, dealId: 505,
    ticketId: t(21).ticketId, ticketTitle: t(21).eventName,
    buyerId: 7777, buyerName: "콘서트팬",
    sellerId: demoUser.userId, sellerName: demoUser.name,
    status: "REQUESTED", price: t(21).price,
    buyerMessage: "양도 가능하실까요? 정가 결제하겠습니다.",
    createdAt: addDays(0, 9),
  },
];

// ── 채팅 ────────────────────────────────────────────────────
export const demoChatRooms = [
  {
    chatroomId: 301, ticketId: t(0).ticketId, ticketTitle: t(0).eventName,
    sellerName: t(0).sellerName,
    lastMessage: "네, 예매 내역 확인 가능합니다.",
    lastMessageTime: new Date().toISOString(), unreadCount: 1,
  },
  {
    chatroomId: 302, ticketId: t(6).ticketId, ticketTitle: t(6).eventName,
    sellerName: t(6).sellerName,
    lastMessage: "택배로 보내드릴게요. 주소 부탁드립니다.",
    lastMessageTime: addDays(-2, 12), unreadCount: 0,
  },
  {
    chatroomId: 303, ticketId: t(21).ticketId, ticketTitle: t(21).eventName,
    sellerName: "콘서트팬",
    lastMessage: "양도 가능하실까요?",
    lastMessageTime: addDays(0, 9), unreadCount: 2,
  },
];

export const demoMessages = [
  // room 301 (구매자=데모유저, 판매자=정가양도러)
  { messageId: 1, chatroomId: 301, senderId: t(0).sellerId, type: "SYSTEM", content: "양도 요청이 생성되었습니다.", createdAt: addDays(-1, 15) },
  { messageId: 2, chatroomId: 301, senderId: demoUser.userId, type: "TEXT", content: "안녕하세요. 티켓 정가 양도 가능할까요?", createdAt: addDays(-1, 15) },
  { messageId: 3, chatroomId: 301, senderId: t(0).sellerId, type: "TEXT", content: "네, 예매 내역 확인 가능합니다.", createdAt: new Date().toISOString() },
  // room 302 (택배 거래, ACCEPTED)
  { messageId: 4, chatroomId: 302, senderId: demoUser.userId, type: "TEXT", content: "레미제라블 R석 양도 받고 싶어요.", createdAt: addDays(-2, 11) },
  { messageId: 5, chatroomId: 302, senderId: t(6).sellerId, type: "SYSTEM", content: "판매자가 양도 요청을 수락했습니다.", createdAt: addDays(-2, 11) },
  { messageId: 6, chatroomId: 302, senderId: t(6).sellerId, type: "TEXT", content: "택배로 보내드릴게요. 주소 부탁드립니다.", createdAt: addDays(-2, 12) },
  // room 303 (데모유저가 판매자)
  { messageId: 7, chatroomId: 303, senderId: 7777, type: "TEXT", content: "임영웅 앵콜 티켓 아직 있나요?", createdAt: addDays(0, 9) },
  { messageId: 8, chatroomId: 303, senderId: 7777, type: "TEXT", content: "양도 가능하실까요?", createdAt: addDays(0, 9) },
];

export const buildPage = (content, page = 0, size = 20) => ({
  content,
  page,
  size,
  totalPages: Math.max(1, Math.ceil(content.length / size)),
  totalElements: content.length,
});

// ── 관리자 데모: 회원 목록 ───────────────────────────────────
const mkUser = (id, name, nickname, email, role, status, daysAgo) => ({
  id, userId: id, name, nickname, email, role, status,
  provider: id % 3 === 0 ? "KAKAO" : "email",
  profileImageUrl: null, phone: null,
  createdAt: addDays(-daysAgo, 10),
});

export const demoUsers = [
  demoAdmin,
  { ...demoUser, createdAt: addDays(-40, 10) },
  mkUser(8001, "김민수", "ticket_master", "minsu.kim@example.com", "USER", "ACTIVE", 3),
  mkUser(8002, "이서연", "concert_lover", "seoyeon.lee@example.com", "USER", "ACTIVE", 7),
  mkUser(8003, "박지훈", "baseball_fan", "jihoon.park@example.com", "USER", "ACTIVE", 12),
  mkUser(8004, "최유진", "musical_yj", "yujin.choi@example.com", "USER", "SUSPENDED", 25),
  mkUser(8005, "정도윤", "doyoon_j", "doyoon.jung@example.com", "USER", "ACTIVE", 1),
  mkUser(8006, "한소희", "soheee", "sohee.han@example.com", "USER", "ACTIVE", 18),
  mkUser(8007, "오세훈", "sehun_o", "sehun.oh@example.com", "USER", "DELETED", 60),
];

// ── 관리자 데모: 카테고리 ───────────────────────────────────
const mkCat = (id, name, icon, count) => ({
  id, categoryId: id, name, icon, depth: 0, parentId: null, parent_id: null,
  ticketCount: count, children: [],
});

export const demoCategories = [
  mkCat(1, "뮤지컬", "theater_comedy", 4),
  mkCat(3, "콘서트", "music_note", 7),
  mkCat(4, "스포츠", "sports_baseball", 4),
  mkCat(5, "전시", "palette", 3),
  mkCat(6, "클래식", "piano", 3),
];

// ── 관리자 데모: 1:1 문의 / 신고 시드 ───────────────────────
export const demoInquiries = [
  { id: 9101, inquiryId: 9101, title: "정가보다 비싸게 올라온 티켓이 있어요", category: "거래", content: "특정 판매자가 정가보다 높은 금액으로 등록한 것 같습니다. 확인 부탁드립니다.", status: "PENDING", userId: 8002, userNickname: "concert_lover", createdAt: addDays(-1, 14) },
  { id: 9102, inquiryId: 9102, title: "결제가 중간에 멈췄습니다", category: "결제", content: "결제 진행 중 오류가 발생했는데 거래 상태가 어떻게 되는지 궁금합니다.", status: "PENDING", userId: 8003, userNickname: "baseball_fan", createdAt: addDays(-2, 11) },
  { id: 9103, inquiryId: 9103, title: "닉네임 변경은 어디서 하나요?", category: "계정", content: "마이페이지에서 닉네임을 바꾸고 싶은데 메뉴를 못 찾겠어요.", status: "ANSWERED", answer: "마이페이지 > 회원정보에서 변경 가능합니다.", userId: 8005, userNickname: "doyoon_j", createdAt: addDays(-5, 9) },
];

export const demoReports = [
  { id: 9201, reportId: 9201, targetType: "TICKET", target_type: "TICKET", reason: "정가 초과 의심 매물", status: "PENDING", reporterNickname: "ticket_master", reporterId: 8001, createdAt: addDays(-1, 16) },
  { id: 9202, reportId: 9202, targetType: "USER", target_type: "USER", reason: "외부 거래 유도", status: "PENDING", reporterNickname: "seoyeon_lee", reporterId: 8002, createdAt: addDays(-3, 13) },
  { id: 9203, reportId: 9203, targetType: "CHAT", target_type: "CHAT", reason: "비방·욕설", status: "RESOLVED", reporterNickname: "soheee", reporterId: 8006, createdAt: addDays(-8, 10) },
];
