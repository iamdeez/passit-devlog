import { test } from "@playwright/test";
import { setupApiMocks, setAuthInLocalStorage } from "./helpers/apiMock";

/**
 * admin 계정 채팅 확인 데모
 */

test.describe("Admin 채팅 확인", () => {
  test.setTimeout(180000);

  test("admin 계정으로 채팅방 목록 및 메시지 확인", async ({ page }) => {
    console.log("=".repeat(80));
    console.log("🎬 Admin 채팅 확인 시작");
    console.log("=".repeat(80));

    // API Mock 설정 (admin 계정)
    await setupApiMocks(page, "admin");
    await setAuthInLocalStorage(page, "admin");
    console.log("✅ Admin 인증 완료");

    // 채팅 목록 페이지로 이동
    await page.goto("/chat", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    console.log("📋 채팅 목록 페이지 로드 완료");

    // 페이지 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(2000);

    // 첫 번째 채팅방 클릭 (김민준)
    const firstChat = page.locator('[href*="/chat/"]').first();
    if (await firstChat.isVisible({ timeout: 5000 })) {
      await firstChat.click();
      await page.waitForTimeout(3000);
      console.log("💬 채팅방 1 (김민준) 입장");

      // 메시지 스크롤
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
    }

    // 채팅 목록으로 돌아가기
    await page.goto("/chat", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // 두 번째 채팅방 클릭 (이서윤 - 양도 요청)
    const secondChat = page.locator('[href*="/chat/"]').nth(1);
    if (await secondChat.isVisible({ timeout: 5000 })) {
      await secondChat.click();
      await page.waitForTimeout(3000);
      console.log("💬 채팅방 2 (이서윤 - 양도 요청) 입장");

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
    }

    // 채팅 목록으로 돌아가기
    await page.goto("/chat", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // 세 번째 채팅방 클릭 (최유진)
    const thirdChat = page.locator('[href*="/chat/"]').nth(2);
    if (await thirdChat.isVisible({ timeout: 5000 })) {
      await thirdChat.click();
      await page.waitForTimeout(3000);
      console.log("💬 채팅방 3 (최유진) 입장");

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
    }

    // 채팅 목록으로 돌아가기
    await page.goto("/chat", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // 네 번째 채팅방 클릭 (송유나 - BTS 콘서트)
    const fourthChat = page.locator('[href*="/chat/"]').nth(3);
    if (await fourthChat.isVisible({ timeout: 5000 })) {
      await fourthChat.click();
      await page.waitForTimeout(3000);
      console.log("💬 채팅방 4 (송유나 - BTS 콘서트) 입장");

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
    }

    // 채팅 목록으로 돌아가기
    await page.goto("/chat", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    // 다섯 번째 채팅방 클릭 (오민호 - 프리미어리그)
    const fifthChat = page.locator('[href*="/chat/"]').nth(4);
    if (await fifthChat.isVisible({ timeout: 5000 })) {
      await fifthChat.click();
      await page.waitForTimeout(3000);
      console.log("💬 채팅방 5 (오민호 - 프리미어리그) 입장");

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
    }

    console.log("\n" + "=".repeat(80));
    console.log("✅ Admin 채팅 확인 완료!");
    console.log("=".repeat(80));
    console.log("📹 비디오: test-results/ 폴더 확인");
    console.log("📊 확인한 채팅방:");
    console.log("   1. ✓ 김민준 - 뮤지컬 위키드");
    console.log("   2. ✓ 이서윤 - 뮤지컬 위키드 (양도 요청)");
    console.log("   3. ✓ 최유진 - 뮤지컬 위키드");
    console.log("   4. ✓ 송유나 - BTS 콘서트 (양도 요청)");
    console.log("   5. ✓ 오민호 - 프리미어리그");
    console.log("=".repeat(80));

    await page.waitForTimeout(3000);
  });
});
