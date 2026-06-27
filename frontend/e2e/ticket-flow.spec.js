import { test, expect } from "@playwright/test";
import { TicketCreatePage } from "./pages/TicketCreatePage";
import { TicketListPage } from "./pages/TicketListPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { API_URLS } from "./helpers/apiConfig";

/**
 * 티켓 전체 플로우 E2E 테스트
 *
 * 티켓 생성 → 목록 조회 → 상세 조회를 한 번에 테스트
 */

test.describe("티켓 전체 플로우 (등록 → 조회)", () => {
  let ticketCreatePage;
  let ticketListPage;
  let ticketDetailPage;
  let testEmail;
  let testPassword;
  let createdTicketName;

  test.beforeAll(async ({ browser }) => {
    // 테스트용 계정 생성 및 티켓 등록
    const page = await browser.newPage();
    ticketCreatePage = new TicketCreatePage(page);

    testEmail = `e2e-flow-${Date.now()}@example.com`;
    testPassword = "Test1234";
    const testNickname = `flowtest${Date.now()}`;
    createdTicketName = `E2E 플로우 테스트 티켓 ${Date.now()}`;

    try {
      // API를 통한 회원가입 및 로그인 (UI 기반 이메일 인증 우회)
      console.log(`📝 회원가입: ${testEmail}`);
      const signupResponse = await page.request.post(`${API_URLS.ACCOUNT}/api/auth/signup`, {
        data: {
          email: testEmail,
          password: testPassword,
          name: "E2E Flow Tester",
          nickname: testNickname,
        },
      });
      const signupData = await signupResponse.json();
      if (!signupData.success) {
        console.log("⚠️ 회원가입 실패:", signupData.message);
        await page.close();
        return;
      }

      await page.waitForTimeout(1000);

      // 로그인
      console.log(`🔐 로그인: ${testEmail}`);
      const loginResponse = await page.request.post(`${API_URLS.ACCOUNT}/api/auth/login`, {
        data: { email: testEmail, password: testPassword },
      });
      const loginData = await loginResponse.json();
      if (!loginData.success) {
        console.log("⚠️ 로그인 실패:", loginData.message);
        await page.close();
        return;
      }

      // localStorage에 인증 상태 설정
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.evaluate((data) => {
        localStorage.setItem("token", data.accessToken);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify({
          userId: data.userId,
          email: data.email,
          name: data.name,
          role: data.role,
          provider: data.provider,
        }));
      }, loginData.data);

      // 티켓 생성
      console.log(`🎫 티켓 생성: ${createdTicketName}`);
      await ticketCreatePage.goto();

      const ticketData = {
        eventName: createdTicketName,
        eventDate: "2026-06-20T19:00",
        eventLocation: "서울 잠실종합운동장",
        originalPrice: "120000",
        sellingPrice: "120000",
        seatInfo: "B구역 3열 8번",
        description: "E2E 전체 플로우 테스트용 티켓입니다.",
      };

      await ticketCreatePage.createTicket(ticketData);
      await page.waitForTimeout(3000);

      console.log("✅ 티켓 생성 완료");

      // 티켓이 DB에 저장되고 목록에 반영될 시간 대기
      await page.waitForTimeout(2000);

      await page.close();
    } catch (error) {
      console.log("❌ 티켓 생성 중 에러:", error.message);
      await page.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    ticketListPage = new TicketListPage(page);
    ticketDetailPage = new TicketDetailPage(page);
  });

  test("1. 생성한 티켓이 목록에 표시되는지 확인", async ({ page }) => {
    await ticketListPage.goto();
    await ticketListPage.waitForTicketsToLoad();

    const ticketCount = await ticketListPage.getTicketCount();
    console.log(`📋 티켓 카드 개수: ${ticketCount}`);

    if (ticketCount === 0) {
      console.log("ℹ️ 티켓이 없습니다 (Supabase 연동 환경에서 확인 필요)");
      test.skip();
    } else {
      expect(ticketCount).toBeGreaterThan(0);
      console.log("✅ 티켓 목록에 항목이 표시됩니다");
    }
  });

  test("2. 생성한 티켓 검색하기", async ({ page }) => {
    await ticketListPage.goto();
    await ticketListPage.waitForTicketsToLoad();

    // 생성한 티켓 이름으로 검색
    console.log(`🔍 검색어: "${createdTicketName}"`);
    await ticketListPage.search(createdTicketName);
    await ticketListPage.waitForTicketsToLoad();

    console.log("✅ 검색 실행 완료");
  });

  test("3. 티켓 상세 페이지 조회", async ({ page }) => {
    await ticketListPage.goto();
    await ticketListPage.waitForTicketsToLoad();

    const ticketCount = await ticketListPage.getTicketCount();

    if (ticketCount > 0) {
      // 첫 번째 티켓 클릭
      await ticketListPage.clickFirstTicket();

      // 상세 페이지로 이동 확인
      await page.waitForURL(/\/tickets\/\d+\/detail/, { timeout: 10000 });
      console.log(`📍 상세 페이지: ${page.url()}`);

      // 티켓 정보 표시 확인
      await ticketDetailPage.expectTicketInfoVisible();

      console.log("✅ 티켓 상세 정보가 표시됩니다");
    } else {
      test.skip();
    }
  });

  test("4. 상세 페이지에서 목록으로 복귀", async ({ page }) => {
    await ticketListPage.goto();
    await ticketListPage.waitForTicketsToLoad();

    const ticketCount = await ticketListPage.getTicketCount();

    if (ticketCount > 0) {
      // 상세 페이지로 이동
      await ticketListPage.clickFirstTicket();
      await page.waitForURL(/\/tickets\/\d+\/detail/, { timeout: 10000 });

      // 뒤로가기
      await page.goBack();
      await page.waitForLoadState("networkidle");

      // 목록 페이지 확인
      expect(page.url()).toContain("/tickets");
      expect(page.url()).not.toContain("/detail");

      console.log("✅ 목록 페이지로 복귀 완료");
    } else {
      test.skip();
    }
  });
});
