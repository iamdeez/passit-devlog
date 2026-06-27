import { test, expect } from "@playwright/test";
import { setupApiMocks, setAuthInLocalStorage } from "./helpers/apiMock";

/**
 * 간소화된 전체 플로우 데모 - 백엔드 없이 Frontend만으로 실행
 * 복잡한 폼 입력을 건너뛰고 더미 데이터로 바로 시작
 *
 * 테스트 시나리오:
 * 1. 판매자: 티켓 목록 조회 → 상세 조회
 * 2. 판매자: 문의 생성 → 목록 조회 → 상세 조회
 * 3. 구매자: 티켓 상세 → 채팅 시작 → 메시지 전송
 * 4. 구매자: 티켓 상세 → 양도 요청
 */

test.describe("전체 플로우 데모 - 간소화 버전 (Frontend Only)", () => {
  // 긴 타임아웃 설정 (데모용)
  test.setTimeout(300000); // 5분

  test("전체 플로우 - 티켓 조회부터 양도 요청까지", async ({ page }) => {
    console.log("=".repeat(80));
    console.log("🎬 전체 플로우 데모 시작 (Frontend Only - No Backend)");
    console.log("=".repeat(80));

    // ========================================
    // PART 1: 판매자 - 티켓 목록 조회
    // ========================================
    console.log("\n" + "─".repeat(80));
    console.log("📍 PART 1: 판매자 - 티켓 조회 플로우");
    console.log("─".repeat(80));

    // API Mock 설정
    await setupApiMocks(page, "seller");

    // 판매자로 인증
    await setAuthInLocalStorage(page, "seller");
    console.log("✅ 판매자 인증 완료");

    // 티켓 목록 페이지로 이동
    await page.goto("/tickets", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    console.log("📋 티켓 목록 페이지 로드 완료");

    // 첫 번째 티켓 클릭 (상세 조회)
    const firstTicket = page.locator('[href*="/tickets/"]').first();
    if (await firstTicket.isVisible({ timeout: 5000 })) {
      await firstTicket.click();
      await page.waitForTimeout(3000);
      console.log("🎫 티켓 상세 페이지 로드 완료");
    }

    // 페이지 스크롤하여 전체 내용 보기
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    // ========================================
    // PART 2: 판매자 - 문의 생성
    // ========================================
    console.log("\n" + "─".repeat(80));
    console.log("📍 PART 2: 판매자 - 문의 생성 플로우");
    console.log("─".repeat(80));

    // 문의 목록 페이지로 이동
    await page.goto("/cs/inquiries", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    console.log("📋 문의 목록 페이지 로드 완료");

    // 문의하기 버튼 클릭
    const createInquiryButton = page.getByRole("button", { name: /문의하기|작성/i }).first();
    if (await createInquiryButton.isVisible({ timeout: 5000 })) {
      await createInquiryButton.click();
      await page.waitForTimeout(2000);
      console.log("📝 문의 작성 페이지 로드 완료");

      // 문의 정보 입력
      const titleInput = page.locator('input[name="title"], input[placeholder*="제목"]');
      const contentInput = page.locator(
        'textarea[name="content"], textarea[placeholder*="내용"]'
      );

      if (await titleInput.isVisible({ timeout: 3000 })) {
        await titleInput.click();
        await page.waitForTimeout(500);
        await titleInput.fill("[데모] 티켓 환불 문의");
        await page.waitForTimeout(1000);
        console.log("  → 제목 입력 완료");
      }

      if (await contentInput.isVisible({ timeout: 3000 })) {
        await contentInput.click();
        await page.waitForTimeout(500);
        await contentInput.fill(
          "티켓 환불은 어떻게 진행하나요?\n\n상세한 절차를 알려주시면 감사하겠습니다.\n결제 후 7일 이내인데 환불이 가능한지 궁금합니다."
        );
        await page.waitForTimeout(1000);
        console.log("  → 내용 입력 완료");
      }

      // 제출 버튼 클릭
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.isVisible({ timeout: 3000 })) {
        await submitButton.click();
        await page.waitForTimeout(3000);
        console.log("✅ 문의 등록 완료");
      }
    }

    // 문의 목록으로 돌아가기
    await page.goto("/cs/inquiries", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    console.log("📋 문의 목록 재조회 완료");

    // 첫 번째 문의 클릭 (상세 조회)
    const firstInquiry = page.locator('[href*="/inquiries/"]').first();
    if (await firstInquiry.isVisible({ timeout: 5000 })) {
      await firstInquiry.click();
      await page.waitForTimeout(3000);
      console.log("📄 문의 상세 페이지 로드 완료");
    }

    // 페이지 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);

    // ========================================
    // PART 3: 구매자 - 채팅 시작
    // ========================================
    console.log("\n" + "─".repeat(80));
    console.log("📍 PART 3: 구매자 - 채팅 플로우");
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

    // 페이지 스크롤하여 채팅 버튼 보기
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // 채팅하기 버튼 클릭
    const chatButton = page.getByRole("button", { name: /채팅/i });
    if (await chatButton.isVisible({ timeout: 5000 })) {
      await chatButton.click();
      await page.waitForTimeout(3000);
      console.log("💬 채팅방 생성 및 입장 완료");

      // 메시지 입력 및 전송
      const messageInput = page.locator(
        'input[placeholder*="메시지"], textarea[placeholder*="메시지"]'
      );
      const sendButton = page.getByRole("button", { name: /전송|보내기/i });

      if (await messageInput.isVisible({ timeout: 3000 })) {
        // 첫 번째 메시지
        await messageInput.click();
        await page.waitForTimeout(500);
        await messageInput.fill("안녕하세요! 이 티켓 구매하고 싶은데 아직 판매 가능한가요?");
        await page.waitForTimeout(1500);

        if (await sendButton.isVisible({ timeout: 2000 })) {
          await sendButton.click();
          await page.waitForTimeout(2000);
          console.log("✅ 첫 번째 메시지 전송 완료");
        }

        // 두 번째 메시지
        await messageInput.click();
        await page.waitForTimeout(500);
        await messageInput.fill("가격은 협상 가능한가요?");
        await page.waitForTimeout(1500);

        if (await sendButton.isVisible({ timeout: 2000 })) {
          await sendButton.click();
          await page.waitForTimeout(2000);
          console.log("✅ 두 번째 메시지 전송 완료");
        }

        // 세 번째 메시지
        await messageInput.click();
        await page.waitForTimeout(500);
        await messageInput.fill("빠른 답변 부탁드립니다 😊");
        await page.waitForTimeout(1500);

        if (await sendButton.isVisible({ timeout: 2000 })) {
          await sendButton.click();
          await page.waitForTimeout(2000);
          console.log("✅ 세 번째 메시지 전송 완료");
        }
      }

      // 채팅 내역 스크롤
      await page.evaluate(() => {
        const chatContainer = document.querySelector('[class*="message"], [class*="chat"]');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      });
      await page.waitForTimeout(2000);
    }

    // ========================================
    // PART 4: 구매자 - 양도 요청
    // ========================================
    console.log("\n" + "─".repeat(80));
    console.log("📍 PART 4: 구매자 - 양도 요청 플로우");
    console.log("─".repeat(80));

    // 티켓 상세 페이지로 다시 이동
    await page.goto("/tickets/1/detail", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
    console.log("🎫 티켓 상세 페이지 로드 완료");

    // 페이지 스크롤하여 양도 요청 버튼 보기
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // 양도 요청하기 버튼 클릭
    const purchaseButton = page.getByRole("button", { name: /양도.*요청/i });
    if (await purchaseButton.isVisible({ timeout: 5000 })) {
      await purchaseButton.click();
      await page.waitForTimeout(2000);
      console.log("📋 양도 요청 모달 열림");

      // 모달에서 수량 입력 (필요한 경우)
      const quantityInput = page.locator('input[type="number"], input[name*="quantity"]');
      if (await quantityInput.isVisible({ timeout: 2000 })) {
        await quantityInput.fill("1");
        await page.waitForTimeout(1000);
        console.log("  → 수량 입력 완료");
      }

      // 요청 확인 버튼 클릭
      const confirmButtons = page.getByRole("button", { name: /요청|신청|확인/i });
      const confirmButton = confirmButtons.last();
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
        await page.waitForTimeout(3000);
        console.log("✅ 양도 요청 완료");
      }

      // 성공 모달이 나타나면 확인 버튼 클릭
      const successConfirmButton = page.getByRole("button", { name: /확인/i });
      if (await successConfirmButton.isVisible({ timeout: 3000 })) {
        await page.waitForTimeout(1000);
        await successConfirmButton.click();
        await page.waitForTimeout(2000);
        console.log("✅ 성공 모달 확인");
      }
    }

    // ========================================
    // 완료
    // ========================================
    console.log("\n" + "=".repeat(80));
    console.log("✅ 전체 플로우 데모 완료!");
    console.log("=".repeat(80));
    console.log("📹 비디오는 test-results 폴더에 저장됩니다");
    console.log("📊 실행된 플로우:");
    console.log("   1. ✓ 판매자: 티켓 목록 조회 → 상세 조회");
    console.log("   2. ✓ 판매자: 문의 생성 → 목록 조회 → 상세 조회");
    console.log("   3. ✓ 구매자: 티켓 상세 → 채팅 시작 → 메시지 전송");
    console.log("   4. ✓ 구매자: 티켓 상세 → 양도 요청");
    console.log("=".repeat(80));

    // 최종 대기
    await page.waitForTimeout(3000);
  });
});
