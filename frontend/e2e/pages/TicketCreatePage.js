import { expect } from "@playwright/test";

/**
 * TicketCreatePage - Page Object Model
 *
 * 티켓 등록 페이지의 요소와 액션을 캡슐화
 */
export class TicketCreatePage {
  constructor(page) {
    this.page = page;

    // 폼 입력 필드
    this.eventNameInput = page.locator('input[name="eventName"]');
    this.eventDateInput = page.locator('input[name="eventDate"]');
    this.eventLocationInput = page.locator('input[name="eventLocation"]');
    this.originalPriceInput = page.locator('input[name="originalPrice"]');
    this.categorySelect = page.locator('#categoryId, [name="categoryId"]');
    this.tradeTypeSelect = page.locator('#tradeType, [name="tradeType"]');
    this.sellingPriceInput = page.locator('input[name="sellingPrice"]');
    this.seatInfoInput = page.locator('input[name="seatInfo"]');
    this.descriptionInput = page.locator('textarea[name="description"]');

    this.submitButton = page.locator('form').getByRole("button", { name: /등록|제출/i });
    this.successMessage = page.getByText(/티켓이 등록되었습니다|등록 완료|성공/i);
    this.errorMessage = page.getByRole("alert");
  }

  /**
   * 티켓 등록 페이지로 이동
   */
  async goto() {
    await this.page.goto("/sell");
    await this.page.waitForLoadState("domcontentloaded");

    // 폼이 로드될 때까지 대기 (로그인 리다이렉트 가능성 있음)
    try {
      await this.eventNameInput.waitFor({ state: "visible", timeout: 10000 });
    } catch (e) {
      // 로그인 페이지로 리다이렉트되었을 수 있음
      console.log("Ticket create form not found - might be redirected to login");
    }
  }

  /**
   * 티켓 등록
   */
  async createTicket(ticketData) {
    console.log("  → 이벤트명 입력");
    await this.eventNameInput.fill(ticketData.eventName);
    await this.page.waitForTimeout(500);

    // 이벤트 날짜
    if (ticketData.eventDate) {
      console.log("  → 이벤트 날짜 입력");
      await this.eventDateInput.fill(ticketData.eventDate);
      await this.page.waitForTimeout(500);
    }

    // 장소
    if (ticketData.eventLocation) {
      console.log("  → 장소 입력");
      await this.eventLocationInput.fill(ticketData.eventLocation);
      await this.page.waitForTimeout(500);
    }

    // 정가
    if (ticketData.originalPrice) {
      console.log("  → 정가 입력");
      await this.originalPriceInput.fill(ticketData.originalPrice.toString());
      await this.page.waitForTimeout(500);
    }

    // 카테고리 선택 - TextField select
    if (ticketData.categoryId) {
      console.log("  → 카테고리 선택");
      try {
        // TextField의 select를 클릭 (hidden input이므로 force 또는 MUI 컴포넌트 직접 클릭)
        const categorySelectVisible = this.page.locator('[role="combobox"], .MuiSelect-select').first();
        await categorySelectVisible.click({ timeout: 3000 }).catch(async () => {
          await this.categorySelect.click({ force: true, timeout: 3000 });
        });
        await this.page.waitForTimeout(1000);

        // 드롭다운에서 옵션 선택
        const categoryOption = this.page.locator(`li[data-value="${ticketData.categoryId}"]`).first();
        await categoryOption.click({ timeout: 5000 });
        await this.page.waitForTimeout(500);
        console.log("  ✅ 카테고리 선택 완료");
      } catch (e) {
        console.log("  ⚠️ 카테고리 선택 실패:", e.message);
        // 실패해도 계속 진행
      }
    }

    // 거래 유형 - TextField select
    if (ticketData.tradeType) {
      console.log("  → 거래 유형 선택");
      try {
        // TextField의 select를 클릭 (두 번째 MUI Select)
        const tradeTypeSelectVisible = this.page.locator('[role="combobox"], .MuiSelect-select').nth(1);
        await tradeTypeSelectVisible.click({ timeout: 3000 }).catch(async () => {
          await this.tradeTypeSelect.click({ force: true, timeout: 3000 });
        });
        await this.page.waitForTimeout(1000);

        // 드롭다운에서 옵션 선택 - tradeType 값에 따라 다르게 처리
        let tradeOption;
        if (ticketData.tradeType === "양도" || ticketData.tradeType === "ONSITE") {
          tradeOption = this.page.locator('li[data-value="ONSITE"]').first();
        } else if (ticketData.tradeType === "배송" || ticketData.tradeType === "DELIVERY") {
          tradeOption = this.page.locator('li[data-value="DELIVERY"]').first();
        }

        if (tradeOption) {
          await tradeOption.click({ timeout: 5000 });
          await this.page.waitForTimeout(500);
          console.log("  ✅ 거래 유형 선택 완료");
        }
      } catch (e) {
        console.log("  ⚠️ 거래 유형 선택 실패:", e.message);
        // 실패해도 계속 진행
      }
    }

    // 판매가
    if (ticketData.sellingPrice) {
      console.log("  → 판매가 입력");
      await this.sellingPriceInput.fill(ticketData.sellingPrice.toString());
      await this.page.waitForTimeout(500);
    }

    // 좌석 정보
    if (ticketData.seatInfo) {
      console.log("  → 좌석 정보 입력");
      await this.seatInfoInput.fill(ticketData.seatInfo);
      await this.page.waitForTimeout(500);
    }

    // 설명
    if (ticketData.description) {
      console.log("  → 설명 입력");
      await this.descriptionInput.fill(ticketData.description);
      await this.page.waitForTimeout(500);
    }

    // 제출
    console.log("  → 티켓 등록 버튼 클릭");
    await this.submitButton.click();
    await this.page.waitForTimeout(3000);
  }

  /**
   * 성공 메시지 확인
   */
  async expectSuccessMessage() {
    await expect(this.successMessage).toBeVisible({ timeout: 10000 });
  }

  /**
   * 에러 메시지 확인
   */
  async expectErrorMessage(message) {
    const errorElement = this.page.locator('[role="alert"], .MuiAlert-root').first();
    await expect(errorElement).toBeVisible({ timeout: 10000 });
    if (message) {
      await expect(errorElement).toContainText(message);
    }
  }

  /**
   * 티켓 목록 페이지로 리다이렉트되었는지 확인
   */
  async expectRedirectToTicketList() {
    await this.page.waitForURL(/\/tickets/, { timeout: 10000 });
  }
}
