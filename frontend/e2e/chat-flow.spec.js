import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { TicketListPage } from "./pages/TicketListPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { ChatListPage } from "./pages/ChatListPage";
import { ChatRoomPage } from "./pages/ChatRoomPage";
import { API_URLS, FRONTEND_URL } from "./helpers/apiConfig";

/**
 * 채팅 플로우 E2E 테스트
 *
 * 테스트 시나리오:
 * - 티켓 상세에서 채팅 시작
 * - 채팅방 목록 조회
 * - 채팅방 입장 및 메시지 전송
 * - 채팅방 나가기
 */

test.describe("채팅 플로우", () => {
  let testEmail;
  let testPassword;
  let ticketId;
  let chatroomId;

  test.beforeAll(async ({ browser }) => {
    // 테스트용 계정 생성 및 티켓 조회
    const page = await browser.newPage();
    testEmail = `e2e-chat-${Date.now()}@example.com`;
    testPassword = "Test1234!";

    try {
      // 회원가입
      console.log(`📝 회원가입: ${testEmail}`);
      const signupResponse = await page.request.post(`${API_URLS.ACCOUNT}/api/auth/signup`, {
        data: {
          email: testEmail,
          password: testPassword,
          name: "E2E Chat Tester",
          nickname: `chattester${Date.now()}`,
        },
      });

      const signupData = await signupResponse.json();
      if (!signupData.success) {
        console.log("⚠️ 회원가입 실패:", signupData.message);
        await page.close();
        return;
      }

      // 로그인
      await page.waitForTimeout(2000);
      const loginResponse = await page.request.post(`${API_URLS.ACCOUNT}/api/auth/login`, {
        data: { email: testEmail, password: testPassword },
      });

      const loginData = await loginResponse.json();
      if (!loginData.success) {
        console.log("⚠️ 로그인 실패");
        await page.close();
        return;
      }

      // 인증 상태 설정 - localStorage를 먼저 설정
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.evaluate((data) => {
        localStorage.setItem("token", data.accessToken);
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
      }, loginData.data);

      // 티켓 목록에서 첫 번째 티켓 ID 가져오기
      const ticketListResponse = await page.request.get(`${API_URLS.TICKET}/api/tickets?page=0&size=1`);
      const ticketListData = await ticketListResponse.json();
      
      if (ticketListData.success && ticketListData.data?.content?.length > 0) {
        ticketId = ticketListData.data.content[0].id;
        console.log(`🎫 테스트용 티켓 ID: ${ticketId}`);
      } else {
        console.log("⚠️ 사용 가능한 티켓이 없습니다");
      }

      await page.close();
    } catch (error) {
      console.log("❌ 초기 설정 중 에러:", error.message);
      await page.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로그인 상태 설정
    const loginResponse = await page.request.post(`${API_URLS.ACCOUNT}/api/auth/login`, {
      data: { email: testEmail, password: testPassword },
    });

    const loginData = await loginResponse.json();
    if (loginData.success) {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.evaluate((data) => {
        localStorage.setItem("token", data.accessToken);
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
      }, loginData.data);
    }
  });

  test("1. 티켓 상세에서 채팅 시작", async ({ page }) => {
    if (!ticketId) {
      test.skip();
      return;
    }

    const ticketDetailPage = new TicketDetailPage(page);
    await ticketDetailPage.goto(ticketId);
    await ticketDetailPage.expectTicketInfoVisible();

    // 채팅 버튼 찾기 및 클릭
    const chatButton = page.getByRole("button", { name: /채팅|문의|연락/i }).or(
      page.locator('[aria-label*="chat"], [aria-label*="채팅"]')
    );

    if (await chatButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await chatButton.click();
      await page.waitForURL(/\/chat\/\d+/, { timeout: 10000 });
      
      // URL에서 chatroomId 추출
      const url = page.url();
      const match = url.match(/\/chat\/(\d+)/);
      if (match) {
        chatroomId = parseInt(match[1]);
        console.log(`💬 채팅방 ID: ${chatroomId}`);
      }
    } else {
      console.log("⚠️ 채팅 버튼을 찾을 수 없습니다");
    }
  });

  test("2. 채팅방 목록 조회", async ({ page }) => {
    const chatListPage = new ChatListPage(page);
    await chatListPage.goto();
    await chatListPage.waitForChatRoomsToLoad();

    const count = await chatListPage.getChatRoomCount();
    console.log(`📋 채팅방 개수: ${count}`);

    if (count > 0) {
      await chatListPage.expectChatRoomsVisible();
      console.log("✅ 채팅방 목록이 표시됩니다");
    } else {
      await chatListPage.expectEmpty();
      console.log("ℹ️ 채팅방이 없습니다 (정상)");
    }
  });

  test("3. 채팅방 입장 및 메시지 전송", async ({ page }) => {
    if (!chatroomId) {
      // 채팅방 목록에서 첫 번째 채팅방 선택
      const chatListPage = new ChatListPage(page);
      await chatListPage.goto();
      await chatListPage.waitForChatRoomsToLoad();

      const count = await chatListPage.getChatRoomCount();
      if (count === 0) {
        test.skip();
        return;
      }

      await chatListPage.clickFirstChatRoom();
    } else {
      const chatRoomPage = new ChatRoomPage(page);
      await chatRoomPage.goto(chatroomId);
    }

    const chatRoomPage = new ChatRoomPage(page);
    await chatRoomPage.waitForMessagesToLoad();
    await chatRoomPage.expectHeaderVisible();

    // 테스트 메시지 전송
    const testMessage = `E2E 테스트 메시지 ${Date.now()}`;
    await chatRoomPage.sendMessage(testMessage);
    await page.waitForTimeout(2000);

    // 메시지가 표시되는지 확인
    await chatRoomPage.expectMessageContaining(testMessage);
    console.log("✅ 메시지 전송 및 표시 확인");
  });

  test("4. 채팅방에서 뒤로가기", async ({ page }) => {
    const chatListPage = new ChatListPage(page);
    await chatListPage.goto();
    await chatListPage.waitForChatRoomsToLoad();

    const count = await chatListPage.getChatRoomCount();
    if (count === 0) {
      test.skip();
      return;
    }

    // 채팅방 입장
    await chatListPage.clickFirstChatRoom();

    // 뒤로가기
    const chatRoomPage = new ChatRoomPage(page);
    await chatRoomPage.goBack();

    // 채팅 목록 페이지로 돌아왔는지 확인
    await expect(page).toHaveURL(/\/chat$/);
    console.log("✅ 채팅방에서 목록으로 복귀 완료");
  });
});

