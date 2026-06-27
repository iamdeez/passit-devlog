import http from "k6/http";
import { check, sleep } from "k6";

// 실행 방법: k6 run performance/load-test.js
// Grafana 연동(InfluxDB 사용 시): k6 run --out influxdb=http://localhost:8086/k6 performance/load-test.js

export const options = {
  // 부하 테스트 시나리오 (발표용 5분 시연에 맞춤)
  stages: [
    { duration: "10s", target: 20 }, // Warm-up: 10초 동안 20명까지 서서히 증가
    { duration: "30s", target: 100 }, // Load: 30초 동안 100명 유지 (트래픽 급증 구간)
    { duration: "10s", target: 0 }, // Cool-down: 10초 동안 종료
  ],
  thresholds: {
    http_req_duration: ["p(95)<300"], // 95%의 요청이 300ms 이내 (캐싱 목표치)
    http_req_failed: ["rate<0.01"], // 에러율 1% 미만
  },
};

// 테스트 대상 URL (로컬 개발 서버 또는 운영 서버 주소)
const BASE_URL = __ENV.BASE_URL || "http://localhost:8082";

export default function () {
  // 티켓 목록 조회 (캐싱 적용 대상)
  const res = http.get(`${BASE_URL}/api/tickets`);

  check(res, {
    "status is 200": (r) => r.status === 200,
  });

  sleep(0.1); // 높은 RPS(초당 요청 수)를 위해 대기 시간 단축
}
