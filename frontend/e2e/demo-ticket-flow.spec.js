import { test, expect } from "@playwright/test";
import { setupApiMocks, setAuthInLocalStorage } from "./helpers/apiMock";

/**
 * 티켓 양도 플로우 데모 - 백엔드 없이 Frontend만으로 실행
 *
 * 테스트 시나리오:
 * 1. 판매자: 티켓 목록 조회 → 상세 조회
 * 2. 구매자: 티켓 상세 → 채팅 시작 → 메시지 전송
 * 3. 구매자: 티켓 상세 → 양도 요청
 */

test.describe("티켓 양도 플로우 데모 (Frontend Only)", () => {
  test.setTimeout(180000); // 3분

  test("티켓 양도 플로우 - 목록 조회부터 양도 요청까지", async ({ page }) => {
    console.log("=".repeat(80));
    console.log("🎬 티켓 양도 플로우 데모 시작");
    console.log("=".repeat(80));

    // ========================================
    // PART 1: 판매자 - 티켓 조회
    // ========================================
    console.log("\n" + "─".repeat(80));
    console.log("📍 PART 1: 판매자 - 티켓 조회");
    console.log("─".repeat(80));

    await setupApiMocks(page, "seller");
    await setAuthInLocalStorage(page, "seller");
    console.log("✅ 판매자 인증 완료");

    // 티켓 목록 페이지
    await page.goto("/tickets", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    console.log("📋 티켓 목록 페이지 로드 완료");

    // 첫 번째 티켓 클릭
    const firstTicket = page.locator('[href*="/tickets/"]').first();
    if (await firstTicket.isVisible({ timeout: 5000 })) {
      await firstTicket.click();
      await page.waitForTimeout(3000);
      console.log("🎫 티켓 상세 페이지 로드 완료");
    }

    // 페이지 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1500);

    // ========================================
    // PART 2: 구매자 - 채팅
    // ========================================
    console.log("\n" + "─".repeat(80));
    console.log("📍 PART 2: 구매자 - 채팅");
    console.log("─".repeat(80));

    // 구매자로 전환
    await setupApiMocks(page, "buyer");
    await setAuthInLocalStorage(page, "buyer");
    console.log("✅ 구매자 인증 완료");

    // 티켓 목록으로 이동
    await page.goto("/tickets", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    console.log("📋 티켓 목록 페이지 로드 완료");

    // 첫 번째 티켓 클릭
    const ticketCard = page.locator('[href*="/tickets/"]').first();
    if (await ticketCard.isVisible({ timeout: 5000 })) {
      await ticketCard.click();
      await page.waitForTimeout(3000);
      console.log("🎫 티켓 상세 페이지 로드 완료");
    }

    // 페이지 스크롤하여 채팅 버튼 찾기
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    // 채팅하기 버튼 클릭
    const chatButton = page.getByRole("button", { name: /채팅/i });
    if (await chatButton.isVisible({ timeout: 5000 })) {
      await chatButton.click();
      await page.waitForTimeout(3000);
      console.log("💬 채팅방 입장 완료");

      // 메시지 입력 및 전송
      const messageInput = page.locator('input[placeholder*="메시지"], textarea[placeholder*="메시지"]');
      const sendButton = page.getByRole("button", { name: /전송|보내기/i });

      if (await messageInput.isVisible({ timeout: 3000 })) {
        // 첫 번째 메시지
        await messageInput.click();
        await page.waitForTimeout(500);
        await messageInput.fill("안녕하세요! 이 티켓 아직 판매 가능한가요?");
        await page.waitForTimeout(1500);

        if (await sendButton.isVisible({ timeout: 2000 })) {
          await sendButton.click();
          await page.waitForTimeout(2000);
          console.log("✅ 메시지 1 전송 완료");
        }

        // 두 번째 메시지
        await messageInput.click();
        await page.waitForTimeout(500);
        await messageInput.fill("가격 협상 가능한가요?");
        await page.waitForTimeout(1500);

        if (await sendButton.isVisible({ timeout: 2000 })) {
          await sendButton.click();
          await page.waitForTimeout(2000);
          console.log("✅ 메시지 2 전송 완료");
        }

        // 세 번째 메시지
        await messageInput.click();
        await page.waitForTimeout(500);
        await messageInput.fill("답변 부탁드립니다 😊");
        await page.waitForTimeout(1500);

        if (await sendButton.isVisible({ timeout: 2000 })) {
          await sendButton.click();
          await page.waitForTimeout(2500);
          console.log("✅ 메시지 3 전송 완료");
        }
      }

      await page.waitForTimeout(2000);
    }

    // ========================================
    // PART 3: 구매자 - 양도 요청
    // ========================================
    console.log("\n" + "─".repeat(80));
    console.log("📍 PART 3: 구매자 - 양도 요청");
    console.log("─".repeat(80));

    // 티켓 상세 페이지로 이동
    await page.goto("/tickets/1/detail", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    console.log("🎫 티켓 상세 페이지 로드 완료");

    // 페이지 스크롤하여 양도 요청 버튼 찾기
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    // 양도 요청하기 버튼 클릭
    const purchaseButton = page.getByRole("button", { name: /양도.*요청/i });
    if (await purchaseButton.isVisible({ timeout: 5000 })) {
      await purchaseButton.click();
      await page.waitForTimeout(2000);
      console.log("📋 양도 요청 모달 열림");

      // 모달에서 수량 입력
      const quantityInput = page.locator('input[type="number"], input[name*="quantity"]');
      if (await quantityInput.isVisible({ timeout: 2000 })) {
        await quantityInput.fill("1");
        await page.waitForTimeout(1000);
        console.log("  → 수량 입력: 1");
      }

      // 요청 확인 버튼 클릭
      const confirmButtons = page.getByRole("button", { name: /요청|신청|확인/i });
      const confirmButton = confirmButtons.last();
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
        await page.waitForTimeout(3000);
        console.log("✅ 양도 요청 완료");
      }

      // 성공 모달이 나타나면 확인
      const successConfirmButton = page.getByRole("button", { name: /확인/i });
      if (await successConfirmButton.isVisible({ timeout: 3000 })) {
        await page.waitForTimeout(1500);
        await successConfirmButton.click();
        await page.waitForTimeout(2000);
        console.log("✅ 성공 확인");
      }
    }

    // ========================================
    // 완료
    // ========================================
    console.log("\n" + "=".repeat(80));
    console.log("✅ 티켓 양도 플로우 데모 완료!");
    console.log("=".repeat(80));
    console.log("📹 비디오 파일: test-results/ 폴더 확인");
    console.log("📊 실행된 플로우:");
    console.log("   1. ✓ 판매자: 티켓 목록 조회 → 상세 조회");
    console.log("   2. ✓ 구매자: 티켓 상세 → 채팅 시작 → 메시지 전송");
    console.log("   3. ✓ 구매자: 티켓 상세 → 양도 요청");
    console.log("=".repeat(80));

    await page.waitForTimeout(3000);
  });
});
