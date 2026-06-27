/**
 * e2e 테스트용 API URL 설정
 * 로컬 개발 환경의 마이크로서비스 포트를 사용
 */

export const API_URLS = {
  ACCOUNT: process.env.REACT_APP_ACCOUNT_API_URL || "http://localhost:8081",
  TICKET: process.env.REACT_APP_TICKET_API_URL || "http://localhost:8082",
  TRADE: process.env.REACT_APP_TRADE_API_URL || "http://localhost:8083",
  CHAT: process.env.REACT_APP_CHAT_API_URL || "http://localhost:8084",
  CS: process.env.REACT_APP_CS_API_URL || "http://localhost:8085",
};

export const FRONTEND_URL = process.env.BASE_URL || "http://localhost:3000";

export default API_URLS;
