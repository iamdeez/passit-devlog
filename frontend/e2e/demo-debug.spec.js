import { test, expect } from "@playwright/test";
import { setupApiMocks, setAuthInLocalStorage } from "./helpers/apiMock";

/**
 * 디버깅용 간소화된 플로우
 */

test.describe("디버깅 - 티켓 목록 조회", () => {
  test.setTimeout(60000);

  test("티켓 목록 페이지 로드 및 스크린샷", async ({ page }) => {
    console.log("🔍 디버깅 시작...");

    // API Mock 설정
    console.log("1️⃣ API Mock 설정 중...");
    await setupApiMocks(page, "seller");
    console.log("✅ API Mock 설정 완료");

    // 판매자로 인증
    console.log("2️⃣ 판매자 인증 중...");
    await setAuthInLocalStorage(page, "seller");
    console.log("✅ 판매자 인증 완료");

    // 홈페이지로 먼저 이동
    console.log("3️⃣ 홈페이지로 이동 중...");
    try {
      await page.goto("/", { timeout: 10000 });
      console.log("✅ 홈페이지 로드 완료");
      await page.screenshot({ path: "debug-01-home.png", fullPage: true });
      console.log("📸 홈페이지 스크린샷 저장");
    } catch (e) {
      console.log("❌ 홈페이지 로드 실패:", e.message);
    }

    await page.waitForTimeout(2000);

    // 티켓 목록 페이지로 이동
    console.log("4️⃣ 티켓 목록 페이지로 이동 중...");
    try {
      // waitUntil을 domcontentloaded로 변경
      await page.goto("/tickets", { waitUntil: "domcontentloaded", timeout: 10000 });
      console.log("✅ 티켓 목록 URL 로드 완료");

      await page.waitForTimeout(1000);
      console.log("✅ 1초 대기 완료");

      await page.waitForTimeout(2000);
      await page.screenshot({ path: "debug-02-tickets-loading.png", fullPage: true });
      console.log("📸 티켓 목록 로딩 중 스크린샷 저장");

      // 티켓 카드가 나타날 때까지 대기 (최대 5초)
      const ticketSelector = '[href*="/tickets/"], .MuiCard-root, [class*="Card"]';
      console.log(`5️⃣ 티켓 카드 찾는 중... (selector: ${ticketSelector})`);

      const ticketCard = page.locator(ticketSelector).first();
      const isVisible = await ticketCard.isVisible({ timeout: 5000 }).catch(() => false);

      if (isVisible) {
        console.log("✅ 티켓 카드 발견!");
        const count = await page.locator(ticketSelector).count();
        console.log(`📊 티켓 카드 개수: ${count}`);
      } else {
        console.log("⚠️ 티켓 카드를 찾을 수 없음");

        // 페이지 상태 확인
        const url = page.url();
        console.log(`📍 현재 URL: ${url}`);

        // 페이지 내용 확인
        const bodyText = await page.locator('body').textContent();
        console.log(`📄 페이지 내용 일부: ${bodyText.substring(0, 200)}...`);
      }

      await page.waitForTimeout(2000);
      await page.screenshot({ path: "debug-03-tickets-loaded.png", fullPage: true });
      console.log("📸 티켓 목록 로드 완료 스크린샷 저장");

      // 티켓 클릭 시도
      if (isVisible) {
        console.log("6️⃣ 첫 번째 티켓 클릭 시도...");
        await ticketCard.click();
        await page.waitForTimeout(3000);
        console.log("✅ 티켓 클릭 완료");

        await page.screenshot({ path: "debug-04-ticket-detail.png", fullPage: true });
        console.log("📸 티켓 상세 페이지 스크린샷 저장");
      }

    } catch (e) {
      console.log("❌ 티켓 목록 페이지 로드 실패:", e.message);
      await page.screenshot({ path: "debug-error.png", fullPage: true });
      console.log("📸 에러 스크린샷 저장");
    }

    console.log("\n🎯 디버깅 완료!");
    console.log("📁 스크린샷 파일들:");
    console.log("  - debug-01-home.png");
    console.log("  - debug-02-tickets-loading.png");
    console.log("  - debug-03-tickets-loaded.png");
    console.log("  - debug-04-ticket-detail.png");
    console.log("  - debug-error.png (에러 발생 시)");
  });
});
