const { test, expect } = require("@playwright/test");

const BASE = "http://localhost:3000";

const routes = [
  { name: "home", path: "/" },
  { name: "tickets", path: "/tickets" },
  { name: "ticket-detail", path: "/tickets/101/detail" },
  { name: "deal-detail", path: "/deals/501/detail" },
  { name: "chat-list", path: "/chat" },
  { name: "chat-room", path: "/chat/301" },
  { name: "notices", path: "/cs/notices" },
  { name: "faqs", path: "/cs/faqs" },
  { name: "sell", path: "/sell" },
  { name: "my-tickets", path: "/mypage/my-tickets" },
  { name: "deals", path: "/deals" },
];

const MOBILE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

for (const { name, path } of routes) {
  test(`desk-${name}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `/tmp/desk-${name}.png`, fullPage: true });
    expect((await page.locator("body").innerText()).length).toBeGreaterThan(10);
  });

  test(`mob-${name}`, async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `/tmp/mob-${name}.png`, fullPage: true });
    expect((await page.locator("body").innerText()).length).toBeGreaterThan(10);
  });
}
