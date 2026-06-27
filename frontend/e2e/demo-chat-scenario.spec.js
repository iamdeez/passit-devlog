import { test, expect } from "@playwright/test";
import { API_URLS } from "./helpers/apiConfig";
import { TicketCreatePage } from "./pages/TicketCreatePage";

/**
 * 데모용 채팅 시나리오 - 녹화용
 *
 * 시나리오:
 * 1. 판매자(admin)가 티켓 등록
 * 2. 구매자가 티켓을 보고 채팅 시작
 * 3. 판매자-구매자 간 채팅 진행
 */

test.describe("채팅 플로우 데모 시나리오", () => {
  // 긴 타임아웃 설정 (데모용)
  test.setTimeout(180000);

  test("전체 채팅 플로우 - 판매자 티켓 등록 → 구매자 채팅 시작 → 대화", async ({ browser }) => {
    // 판매자와 구매자 컨텍스트 생성
    const sellerContext = await browser.newContext();
    const buyerContext = await browser.newContext();

    const sellerPage = await sellerContext.newPage();
    const buyerPage = await buyerContext.newPage();

    console.log("=".repeat(60));
    console.log("🎬 채팅 플로우 데모 시나리오 시작");
    console.log("=".repeat(60));

    // ========================================
    // STEP 1: 판매자(admin) 로그인 및 티켓 등록
    // ========================================
    console.log("\n📍 STEP 1: 판매자(admin) 로그인");

    // 판매자 로그인
    const sellerLoginResponse = await sellerPage.request.post(`${API_URLS.ACCOUNT}/api/auth/login`, {
      data: {
        email: "admin@passit.com",
        password: "admin123!",
      },
    });

    const sellerLoginData = await sellerLoginResponse.json();

    if (!sellerLoginData.success) {
      throw new Error(`판매자 로그인 실패: ${sellerLoginData.message}`);
    }

    // 판매자 세션 설정
    await sellerPage.goto("/", { waitUntil: "domcontentloaded" });
    await sellerPage.evaluate((data) => {
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      const user = {
        userId: data.userId,
        email: data.email,
        name: data.name,
        role: data.role,
        provider: data.provider,
      };
      localStorage.setItem("user", JSON.stringify(user));
    }, sellerLoginData.data);

    console.log("✅ 판매자 로그인 완료:", sellerLoginData.data.email);

    // 티켓 등록 페이지로 이동
    console.log("\n📍 STEP 2: 티켓 등록");
    const ticketCreatePage = new TicketCreatePage(sellerPage);
    await ticketCreatePage.goto();
    await sellerPage.waitForTimeout(2000);

    // 티켓 정보 입력
    const timestamp = Date.now();
    const ticketName = `[데모] 뮤지컬 위키드 ${timestamp}`;

    // 날짜 선택 (미래 날짜) - datetime-local 형식: YYYY-MM-DDTHH:MM
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    futureDate.setHours(19, 30); // 오후 7시 30분
    const dateString = futureDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM 형식

    const ticketData = {
      eventName: ticketName,
      eventDate: dateString,
      eventLocation: "샤롯데씨어터",
      originalPrice: "150000",
      categoryId: "3", // 뮤지컬 카테고리 ID (보통 3)
      tradeType: "양도",
      sellingPrice: "150000",
      seatInfo: "1층 A구역 12열 15번",
      description: "뮤지컬 위키드 티켓 양도합니다. 직거래 가능합니다.",
    };

    console.log("📝 티켓 정보 입력 중:", ticketName);
    await ticketCreatePage.createTicket(ticketData);
    await sellerPage.waitForTimeout(3000);

    console.log("✅ 티켓 등록 완료");

    // 등록된 티켓 ID 가져오기 (URL에서)
    const currentUrl = sellerPage.url();
    let ticketId = null;

    // 티켓 목록에서 방금 등록한 티켓 찾기
    await sellerPage.goto("/tickets");
    await sellerPage.waitForTimeout(2000);

    // 검색으로 방금 등록한 티켓 찾기
    await sellerPage.fill('input[placeholder*="검색"]', ticketName);
    await sellerPage.waitForTimeout(2000);

    // 첫 번째 티켓 클릭 (Supabase 미연동 시 없을 수 있음)
    const firstTicket = sellerPage.locator('button[class*="hover-lift"], button[class*="rounded-2xl"][class*="overflow-hidden"], div[role="button"], a[href*="/tickets/"]').first();
    const isTicketVisible = await firstTicket.isVisible({ timeout: 5000 }).catch(() => false);
    if (isTicketVisible) {
      await firstTicket.click();
      await sellerPage.waitForTimeout(2000);

      // URL에서 티켓 ID 추출
      const ticketUrl = sellerPage.url();
      const ticketIdMatch = ticketUrl.match(/\/tickets\/(\d+)/);
      if (ticketIdMatch) {
        ticketId = ticketIdMatch[1];
        console.log("🎫 등록된 티켓 ID:", ticketId);
      }
    } else {
      console.log("ℹ️ 티켓을 찾을 수 없습니다 (Supabase 연동 환경에서 확인 필요)");
    }

    // ========================================
    // STEP 3: 구매자 로그인
    // ========================================
    console.log("\n📍 STEP 3: 구매자 계정 생성 및 로그인");

    const buyerEmail = `buyer-demo-${timestamp}@example.com`;
    const buyerPassword = "Test1234!";

    // 구매자 회원가입
    const buyerSignupResponse = await buyerPage.request.post(`${API_URLS.ACCOUNT}/api/auth/signup`, {
      data: {
        email: buyerEmail,
        password: buyerPassword,
        name: "구매자 데모",
        nickname: `buyer${timestamp}`,
      },
    });

    const buyerSignupData = await buyerSignupResponse.json();
    if (!buyerSignupData.success) {
      console.log("⚠️ 구매자 회원가입 실패, 로그인 시도:", buyerSignupData.message);
    }

    await buyerPage.waitForTimeout(2000);

    // 구매자 로그인
    const buyerLoginResponse = await buyerPage.request.post(`${API_URLS.ACCOUNT}/api/auth/login`, {
      data: {
        email: buyerEmail,
        password: buyerPassword,
      },
    });

    const buyerLoginData = await buyerLoginResponse.json();

    if (!buyerLoginData.success) {
      throw new Error(`구매자 로그인 실패: ${buyerLoginData.message}`);
    }

    // 구매자 세션 설정
    await buyerPage.goto("/", { waitUntil: "domcontentloaded" });
    await buyerPage.evaluate((data) => {
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      const user = {
        userId: data.userId,
        email: data.email,
        name: data.name,
        role: data.role,
        provider: data.provider,
      };
      localStorage.setItem("user", JSON.stringify(user));
    }, buyerLoginData.data);

    console.log("✅ 구매자 로그인 완료:", buyerEmail);

    // ========================================
    // STEP 4: 구매자가 티켓 조회 및 채팅 시작
    // ========================================
    console.log("\n📍 STEP 4: 구매자가 티켓 조회 및 채팅 시작");

    // 티켓 목록으로 이동
    await buyerPage.goto("/tickets");
    await buyerPage.waitForTimeout(2000);

    // 검색으로 티켓 찾기
    await buyerPage.fill('input[placeholder*="검색"]', ticketName);
    await buyerPage.waitForTimeout(2000);

    // 티켓 클릭 (Supabase 미연동 시 없을 수 있음)
    const buyerFirstTicket = buyerPage.locator('button[class*="hover-lift"], button[class*="rounded-2xl"][class*="overflow-hidden"], div[role="button"], a[href*="/tickets/"]').first();
    const isBuyerTicketVisible = await buyerFirstTicket.isVisible({ timeout: 5000 }).catch(() => false);
    if (isBuyerTicketVisible) {
      await buyerFirstTicket.click();
      await buyerPage.waitForTimeout(3000);
      console.log("✅ 티켓 상세 페이지 조회 완료");
    } else {
      console.log("ℹ️ 구매자: 티켓을 찾을 수 없습니다 (Supabase 연동 환경에서 확인 필요)");
    }

    // 채팅 시작 버튼 클릭
    const chatButton = buyerPage.getByRole("button", { name: /채팅|문의|대화/i });
    if (await chatButton.isVisible()) {
      await chatButton.click();
      await buyerPage.waitForTimeout(3000);
      console.log("✅ 채팅방 생성 완료");
    } else {
      console.log("⚠️ 채팅 시작 버튼을 찾을 수 없습니다");
    }

    // ========================================
    // STEP 5: 구매자가 메시지 전송
    // ========================================
    console.log("\n📍 STEP 5: 구매자가 메시지 전송");

    await buyerPage.waitForTimeout(2000);

    // 메시지 입력 및 전송
    const messageInput = buyerPage.locator('input[placeholder*="메시지"], textarea[placeholder*="메시지"]').first();
    if (await messageInput.isVisible()) {
      await messageInput.fill("안녕하세요! 이 티켓 구매하고 싶은데 아직 판매 가능한가요?");
      await buyerPage.waitForTimeout(1000);

      const sendButton = buyerPage.getByRole("button", { name: /전송|보내기/i });
      await sendButton.click();
      await buyerPage.waitForTimeout(2000);

      console.log("💬 구매자 메시지 전송: '안녕하세요! 이 티켓 구매하고 싶은데 아직 판매 가능한가요?'");
    }

    // ========================================
    // STEP 6: 판매자가 채팅방 확인 및 응답
    // ========================================
    console.log("\n📍 STEP 6: 판매자가 채팅방 확인");

    // 판매자 페이지에서 채팅 목록으로 이동
    await sellerPage.goto("/chat");
    await sellerPage.waitForTimeout(3000);

    console.log("✅ 판매자 채팅 목록 조회");

    // 첫 번째 채팅방 클릭
    const firstChatRoom = sellerPage.locator('div[role="button"], a[href*="/chat/"]').first();
    if (await firstChatRoom.isVisible()) {
      await firstChatRoom.click();
      await sellerPage.waitForTimeout(3000);
      console.log("✅ 판매자가 채팅방 입장");
    }

    // 판매자 응답
    const sellerMessageInput = sellerPage.locator('input[placeholder*="메시지"], textarea[placeholder*="메시지"]').first();
    if (await sellerMessageInput.isVisible()) {
      await sellerMessageInput.fill("네, 안녕하세요! 아직 판매 가능합니다 😊");
      await sellerPage.waitForTimeout(1000);

      const sellerSendButton = sellerPage.getByRole("button", { name: /전송|보내기/i });
      await sellerSendButton.click();
      await sellerPage.waitForTimeout(2000);

      console.log("💬 판매자 메시지 전송: '네, 안녕하세요! 아직 판매 가능합니다 😊'");

      // 추가 메시지
      await sellerMessageInput.fill("거래는 안전결제를 통해 진행됩니다!");
      await sellerPage.waitForTimeout(1000);
      await sellerSendButton.click();
      await sellerPage.waitForTimeout(2000);

      console.log("💬 판매자 메시지 전송: '거래는 안전결제를 통해 진행됩니다!'");
    }

    // ========================================
    // STEP 7: 구매자가 응답 확인
    // ========================================
    console.log("\n📍 STEP 7: 구매자가 판매자 응답 확인");

    await buyerPage.waitForTimeout(3000);

    // 구매자 추가 메시지
    if (await messageInput.isVisible()) {
      await messageInput.fill("감사합니다! 거래 신청할게요 👍");
      await buyerPage.waitForTimeout(1000);

      const buyerSendButton = buyerPage.getByRole("button", { name: /전송|보내기/i });
      await buyerSendButton.click();
      await buyerPage.waitForTimeout(2000);

      console.log("💬 구매자 메시지 전송: '감사합니다! 거래 신청할게요 👍'");
    }

    // 최종 대기
    await sellerPage.waitForTimeout(3000);
    await buyerPage.waitForTimeout(3000);

    console.log("\n" + "=".repeat(60));
    console.log("✅ 채팅 플로우 데모 시나리오 완료!");
    console.log("=".repeat(60));
    console.log("📹 비디오는 test-results 폴더에 저장됩니다");

    // 컨텍스트 종료
    await sellerContext.close();
    await buyerContext.close();
  });
});
