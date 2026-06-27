import { test, expect } from "@playwright/test";

test("API 캐싱 성능 시각화", async ({ request }, testInfo) => {
  const iterations = 5;
  const timings = [];
  const endpoint = "/api/tickets";

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    const res = await request.get(endpoint);
    expect(res.ok()).toBeTruthy();
    timings.push(Date.now() - start);
  }

  const html = `
  <html>
    <head>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </head>
    <body>
      <h2>API 캐싱 성능 측정 (${endpoint})</h2>
      <canvas id="chart"></canvas>
      <script>
        new Chart(document.getElementById('chart'), {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(timings.map((_, i) => `Request ${i + 1}`))},
            datasets: [{
              label: '응답 시간 (ms)',
              data: ${JSON.stringify(timings)},
            }]
          }
        });
      </script>
    </body>
  </html>
  `;

  await testInfo.attach("cache-performance.html", {
    body: html,
    contentType: "text/html",
  });
});
