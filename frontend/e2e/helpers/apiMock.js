/**
 * API Mock Helper - 백엔드 없이 테스트하기 위한 Mock 응답
 */

/**
 * 인증 관련 Mock 데이터
 */
export const mockAuthData = {
  seller: {
    userId: 1,
    email: "seller@demo.com",
    name: "판매자",
    nickname: "seller_demo",
    role: "USER",
    provider: "LOCAL",
  },
  buyer: {
    userId: 2,
    email: "buyer@demo.com",
    name: "구매자",
    nickname: "buyer_demo",
    role: "USER",
    provider: "LOCAL",
  },
  admin: {
    userId: 1,
    email: "admin@passit.com",
    name: "관리자",
    nickname: "admin",
    role: "ADMIN",
    provider: "LOCAL",
  },
};

/**
 * 더미 티켓 데이터
 */
export const mockTicketData = {
  ticketId: 1,
  eventName: "[데모] 뮤지컬 위키드",
  eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  eventLocation: "샤롯데씨어터",
  originalPrice: 150000,
  sellingPrice: 150000,
  categoryId: 2,
  tradeType: "ONSITE",
  seatInfo: "1층 A구역 12열 15번",
  description: "뮤지컬 위키드 티켓 양도합니다. 직거래 가능합니다.",
  ticketStatus: "AVAILABLE",
  ownerId: 1,
  image1: "https://via.placeholder.com/800x600?text=Wicked+Musical",
  image2: null,
  createdAt: new Date().toISOString(),
};

/**
 * 더미 문의 데이터
 */
export const mockInquiryData = {
  inquiryId: 1,
  title: "[데모] 티켓 환불 문의",
  content: "티켓 환불은 어떻게 진행하나요?",
  status: "PENDING",
  userId: 2,
  createdAt: new Date().toISOString(),
  response: null,
};

/**
 * 더미 채팅방 데이터
 */
export const mockChatRoomData = {
  chatroomId: 1,
  ticketId: 1,
  sellerId: 1,
  buyerId: 2,
  createdAt: new Date().toISOString(),
};

/**
 * admin 계정용 채팅방 목록
 */
export const mockAdminChatRooms = [
  {
    chatroomId: 101,
    ticketId: 201,
    sellerId: 1,
    buyerId: 2,
    ticketName: "[관리자 판매] 뮤지컬 위키드",
    buyerName: "김민준",
    buyerNickname: "민준이",
    lastMessage: "강남역이나 홍대 쪽에서 만나실 수 있나요? 편하신 곳으로 정해주세요!",
    lastMessageAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    roomStatus: "OPEN",
    dealStatus: "PENDING",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    chatroomId: 102,
    ticketId: 201,
    sellerId: 1,
    buyerId: 3,
    ticketName: "[관리자 판매] 뮤지컬 위키드",
    buyerName: "이서윤",
    buyerNickname: "서윤맘",
    lastMessage: "양도 요청을 보냈습니다.",
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadCount: 1,
    roomStatus: "OPEN",
    dealStatus: "REQUESTED",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    chatroomId: 103,
    ticketId: 201,
    sellerId: 1,
    buyerId: 5,
    ticketName: "[관리자 판매] 뮤지컬 위키드",
    buyerName: "최유진",
    buyerNickname: "유진언니",
    lastMessage: "감사합니다! 티켓은 현장에서 직거래로 전달드리겠습니다.",
    lastMessageAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    roomStatus: "OPEN",
    dealStatus: "PENDING",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    chatroomId: 104,
    ticketId: 202,
    sellerId: 1,
    buyerId: 7,
    ticketName: "[관리자 판매] BTS 콘서트",
    buyerName: "송유나",
    buyerNickname: "유나티켓",
    lastMessage: "양도 요청을 보냈습니다.",
    lastMessageAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    unreadCount: 1,
    roomStatus: "OPEN",
    dealStatus: "REQUESTED",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    chatroomId: 105,
    ticketId: 203,
    sellerId: 1,
    buyerId: 10,
    ticketName: "[관리자 판매] 프리미어리그 관람권",
    buyerName: "오민호",
    buyerNickname: "민호형",
    lastMessage: "고민 좀 해볼게요! 감사합니다!!",
    lastMessageAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    roomStatus: "OPEN",
    dealStatus: "PENDING",
    createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * admin 채팅방별 메시지 목록
 */
export const mockAdminChatMessages = {
  101: [
    {
      messageId: 1001,
      chatroomId: 101,
      senderId: 2,
      senderName: "김민준",
      content: "안녕하세요! 뮤지컬 위키드 티켓 구매하고 싶습니다.",
      sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 1002,
      chatroomId: 101,
      senderId: 1,
      senderName: "관리자",
      content: "안녕하세요~ 관심 가져주셔서 감사합니다! VIP석이라 정말 좋은 자리입니다.",
      sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 1003,
      chatroomId: 101,
      senderId: 2,
      senderName: "김민준",
      content: "좌석 위치가 어떤가요? 무대가 잘 보이나요?",
      sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 1004,
      chatroomId: 101,
      senderId: 1,
      senderName: "관리자",
      content: "1층 A구역 12열이라 무대가 정면으로 아주 잘 보입니다! 뮤지컬 위키드는 특히 무대 연출이 화려해서 이 자리에서 보시면 최고예요.",
      sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 7 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 1005,
      chatroomId: 101,
      senderId: 2,
      senderName: "김민준",
      content: "와 좋네요! 가격 협상은 가능한가요?",
      sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 1006,
      chatroomId: 101,
      senderId: 1,
      senderName: "관리자",
      content: "죄송하지만 정가로 거래하고 싶습니다. 이미 충분히 저렴한 가격이에요 ㅎㅎ",
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 1007,
      chatroomId: 101,
      senderId: 2,
      senderName: "김민준",
      content: "알겠습니다! 그럼 구매 진행할게요. 직거래 가능하다고 하셨는데 어디서 만날 수 있을까요?",
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 1008,
      chatroomId: 101,
      senderId: 1,
      senderName: "관리자",
      content: "강남역이나 홍대 쪽에서 만나실 수 있나요? 편하신 곳으로 정해주세요!",
      sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
  ],
  102: [
    {
      messageId: 2001,
      chatroomId: 102,
      senderId: 3,
      senderName: "이서윤",
      content: "관리자님 안녕하세요! 위키드 티켓 아직 판매 중이신가요?",
      sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 2002,
      chatroomId: 102,
      senderId: 1,
      senderName: "관리자",
      content: "네 안녕하세요! 아직 판매 중입니다 😊",
      sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 2003,
      chatroomId: 102,
      senderId: 3,
      senderName: "이서윤",
      content: "혹시 공연 날짜 변경 가능한가요? 제가 그날 일정이 있어서...",
      sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 6 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 2004,
      chatroomId: 102,
      senderId: 1,
      senderName: "관리자",
      content: "죄송하지만 티켓이 이미 발권된 상태라 날짜 변경은 불가능합니다 ㅠㅠ",
      sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 2005,
      chatroomId: 102,
      senderId: 3,
      senderName: "이서윤",
      content: "아 그렇군요. 그럼 바로 구매하겠습니다!",
      sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 2006,
      chatroomId: 102,
      senderId: 3,
      senderName: "이서윤",
      content: "양도 요청을 보냈습니다.",
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: "SYSTEM_ACTION_MESSAGE",
    },
  ],
  103: [
    {
      messageId: 3001,
      chatroomId: 103,
      senderId: 5,
      senderName: "최유진",
      content: "위키드 티켓 문의드립니다. 혹시 2장 구매 가능한가요?",
      sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 3002,
      chatroomId: 103,
      senderId: 1,
      senderName: "관리자",
      content: "안녕하세요! 죄송하지만 1장만 판매 중입니다.",
      sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 3003,
      chatroomId: 103,
      senderId: 5,
      senderName: "최유진",
      content: "아쉽네요 ㅠㅠ 그래도 1장이라도 구매하고 싶어요!",
      sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 3004,
      chatroomId: 103,
      senderId: 1,
      senderName: "관리자",
      content: "감사합니다! 티켓은 현장에서 직거래로 전달드리겠습니다.",
      sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
  ],
  104: [
    {
      messageId: 4001,
      chatroomId: 104,
      senderId: 7,
      senderName: "송유나",
      content: "관리자님!! BTS 콘서트 VIP석 구매하고 싶어요!! 😍",
      sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 4002,
      chatroomId: 104,
      senderId: 1,
      senderName: "관리자",
      content: "안녕하세요! 네, 정말 좋은 자리입니다. VIP석 1구역 3열이라 멤버들 표정까지 다 보입니다!",
      sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 4003,
      chatroomId: 104,
      senderId: 7,
      senderName: "송유나",
      content: "와!! 대박!! 꼭 구매하고 싶어요!! 혹시 포토카드나 굿즈도 포함인가요?",
      sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 6 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 4004,
      chatroomId: 104,
      senderId: 1,
      senderName: "관리자",
      content: "VIP석 특전으로 포토카드 세트와 에코백이 포함되어 있습니다!",
      sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 4005,
      chatroomId: 104,
      senderId: 7,
      senderName: "송유나",
      content: "완벽해요!! 바로 구매 신청할게요!!",
      sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 4006,
      chatroomId: 104,
      senderId: 7,
      senderName: "송유나",
      content: "양도 요청을 보냈습니다.",
      sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      type: "SYSTEM_ACTION_MESSAGE",
    },
  ],
  105: [
    {
      messageId: 5001,
      chatroomId: 105,
      senderId: 10,
      senderName: "오민호",
      content: "프리미어리그 티켓 문의드립니다. VIP 라운지석이면 어떤 혜택이 있나요?",
      sentAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 5002,
      chatroomId: 105,
      senderId: 1,
      senderName: "관리자",
      content: "안녕하세요! VIP 라운지는 실내 좌석이고 음식과 음료가 무제한 제공됩니다. 그리고 선수 입장 시 가까이서 볼 수 있어요!",
      sentAt: new Date(Date.now() - 7 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 5003,
      chatroomId: 105,
      senderId: 10,
      senderName: "오민호",
      content: "와 대박이네요! 가격이 좀 있긴 한데... 평생 한번 경험해보고 싶어요!",
      sentAt: new Date(Date.now() - 7 * 60 * 60 * 1000 + 7 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 5004,
      chatroomId: 105,
      senderId: 1,
      senderName: "관리자",
      content: "정말 특별한 경험이실 거예요! 원가보다 저렴하게 드리는 거라 이 가격에 구하기 힘드실 겁니다.",
      sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
    {
      messageId: 5005,
      chatroomId: 105,
      senderId: 10,
      senderName: "오민호",
      content: "고민 좀 해볼게요! 감사합니다!!",
      sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      type: "TEXT",
    },
  ],
};

/**
 * 더미 메시지 데이터
 */
export const mockMessages = [
  {
    messageId: 1,
    chatroomId: 1,
    senderId: 2,
    content: "안녕하세요! 이 티켓 구매하고 싶은데 아직 판매 가능한가요?",
    sentAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    messageId: 2,
    chatroomId: 1,
    senderId: 1,
    content: "네, 안녕하세요! 아직 판매 가능합니다 😊",
    sentAt: new Date(Date.now() - 30000).toISOString(),
  },
];

/**
 * 더미 거래 데이터
 */
export const mockDealData = {
  dealId: 1,
  ticketId: 1,
  buyerId: 2,
  sellerId: 1,
  quantity: 1,
  status: "PENDING",
  expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
};

/**
 * Page에서 API를 Mock하는 헬퍼 함수
 */
export async function setupApiMocks(page, userType = "seller") {
  const user = userType === "seller" ? mockAuthData.seller : mockAuthData.buyer;

  // 회원가입 Mock
  await page.route("**/api/auth/signup", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "회원가입 성공",
        data: user,
      }),
    });
  });

  // 로그인 Mock
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "로그인 성공",
        data: {
          ...user,
          accessToken: "mock-access-token",
          refreshToken: "mock-refresh-token",
        },
      }),
    });
  });

  // 티켓 목록 조회 Mock - 더 넓은 패턴 사용
  await page.route("**/api/tickets**", async (route) => {
    const url = route.request().url();
    console.log(`🔍 티켓 API 호출: ${url}`);

    // 상세 조회가 아닌 목록 조회인 경우
    if (!url.includes("/detail")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            content: [mockTicketData],
            totalElements: 1,
            totalPages: 1,
            size: 20,
            number: 0,
          },
        }),
      });
      console.log(`✅ 티켓 목록 Mock 응답 완료`);
    } else {
      await route.continue();
    }
  });

  // 티켓 상세 조회 Mock
  await page.route("**/api/tickets/**/detail", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: mockTicketData,
      }),
    });
  });

  // 티켓 등록 Mock
  await page.route("**/api/tickets", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "티켓이 등록되었습니다",
          data: mockTicketData,
        }),
      });
    } else {
      await route.continue();
    }
  });

  // 찜하기 상태 확인 Mock
  await page.route("**/api/tickets/**/favorite/check", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: false,
      }),
    });
  });

  // 찜하기 토글 Mock
  await page.route("**/api/tickets/**/favorite", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: true,
      }),
    });
  });

  // 문의 목록 조회 Mock
  await page.route("**/api/inquiries?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          content: [mockInquiryData],
          totalElements: 1,
          totalPages: 1,
          size: 20,
          number: 0,
        },
      }),
    });
  });

  // 문의 상세 조회 Mock
  await page.route("**/api/inquiries/**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: mockInquiryData,
        }),
      });
    } else {
      await route.continue();
    }
  });

  // 문의 생성 Mock
  await page.route("**/api/inquiries", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "문의가 등록되었습니다",
          data: mockInquiryData,
        }),
      });
    } else {
      await route.continue();
    }
  });

  // 채팅방 생성 Mock
  await page.route("**/api/chatrooms", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "채팅방이 생성되었습니다",
          data: mockChatRoomData,
        }),
      });
    } else {
      await route.continue();
    }
  });

  // 채팅방 목록 조회 Mock
  await page.route("**/api/chatrooms?**", async (route) => {
    // admin 계정이면 admin 채팅방 목록 반환
    if (user.email === "admin@passit.com") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            content: mockAdminChatRooms,
            totalElements: mockAdminChatRooms.length,
            totalPages: 1,
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            content: [
              {
                ...mockChatRoomData,
                ticketName: mockTicketData.eventName,
                lastMessage: mockMessages[mockMessages.length - 1].content,
                lastMessageAt: mockMessages[mockMessages.length - 1].sentAt,
              },
            ],
            totalElements: 1,
            totalPages: 1,
          },
        }),
      });
    }
  });

  // 채팅방 상세 조회 Mock
  await page.route("**/api/chatrooms/**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: mockChatRoomData,
        }),
      });
    } else {
      await route.continue();
    }
  });

  // 메시지 목록 조회 Mock
  await page.route("**/api/chatrooms/**/messages?**", async (route) => {
    const url = route.request().url();
    const chatroomIdMatch = url.match(/chatrooms\/(\d+)\/messages/);

    if (chatroomIdMatch && user.email === "admin@passit.com") {
      const chatroomId = parseInt(chatroomIdMatch[1]);
      const messages = mockAdminChatMessages[chatroomId] || [];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            content: messages,
            totalElements: messages.length,
            totalPages: 1,
          },
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            content: mockMessages,
            totalElements: mockMessages.length,
            totalPages: 1,
          },
        }),
      });
    }
  });

  // 메시지 전송 Mock
  await page.route("**/api/chatrooms/**/messages", async (route) => {
    if (route.request().method() === "POST") {
      const requestBody = route.request().postDataJSON();
      const newMessage = {
        messageId: mockMessages.length + 1,
        chatroomId: mockChatRoomData.chatroomId,
        senderId: user.userId,
        content: requestBody.content,
        sentAt: new Date().toISOString(),
      };

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: newMessage,
        }),
      });
    } else {
      await route.continue();
    }
  });

  // 거래 요청 Mock
  await page.route("**/api/deals/request", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "거래 요청이 완료되었습니다",
        data: mockDealData,
      }),
    });
  });

  // 거래 목록 조회 Mock
  await page.route("**/api/deals?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          content: [mockDealData],
          totalElements: 1,
          totalPages: 1,
        },
      }),
    });
  });

  // 사용자 정보 조회 Mock
  await page.route("**/api/users/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: user,
      }),
    });
  });

  // 카테고리 목록 조회 Mock
  await page.route("**/api/categories**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: [
          {
            id: 1,
            name: "콘서트",
            children: [
              { id: 11, name: "K-POP", children: [] },
              { id: 12, name: "팝/록", children: [] },
            ],
          },
          {
            id: 2,
            name: "뮤지컬",
            children: [
              { id: 21, name: "대형 뮤지컬", children: [] },
              { id: 22, name: "소극장 뮤지컬", children: [] },
            ],
          },
          {
            id: 3,
            name: "스포츠",
            children: [
              { id: 31, name: "야구", children: [] },
              { id: 32, name: "축구", children: [] },
            ],
          },
        ],
      }),
    });
  });
}

/**
 * localStorage에 인증 정보 설정
 */
export async function setAuthInLocalStorage(page, userType = "seller") {
  const user = userType === "seller" ? mockAuthData.seller : mockAuthData.buyer;

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate((data) => {
    localStorage.setItem("token", "mock-access-token");
    localStorage.setItem("accessToken", "mock-access-token");
    localStorage.setItem("refreshToken", "mock-refresh-token");
    localStorage.setItem("user", JSON.stringify(data));
  }, user);
}
