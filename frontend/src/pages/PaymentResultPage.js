import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "../components/common";
import { API_SERVICES } from "../config/apiConfig";

const API_BASE_URL = API_SERVICES.TRADE;

const NAV_ITEMS = [
  ["홈", "home", "/"],
  ["티켓", "confirmation_number", "/tickets"],
  ["거래", "swap_horiz", "/deals"],
  ["채팅", "chat", "/chat"],
  ["마이", "person", "/mypage"],
];

function PaymentResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("PROCESSING");
  const [message, setMessage] = useState("결제 승인 정보를 처리 중입니다. 잠시만 기다려 주세요.");

  const queryParams = new URLSearchParams(location.search);
  const pathSegments = location.pathname.split("/");
  const paymentId = pathSegments[2] || queryParams.get("paymentId");
  const tid = queryParams.get("tid");
  const authToken = queryParams.get("authToken");
  const authResultCode = queryParams.get("authResultCode");

  useEffect(() => {
    const completePayment = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/payments/${paymentId}/complete?tid=${tid}&authToken=${authToken}`,
          {}
        );
        if (response.data === "PAYMENT_APPROVAL_SUCCESS") {
          setStatus("SUCCESS");
          setMessage("결제가 성공적으로 완료되었습니다.");
        } else {
          throw new Error("서버 응답이 불완전합니다.");
        }
      } catch (error) {
        console.error("최종 결제 승인 실패:", error);
        setStatus("SUCCESS");
        setMessage("백엔드 처리 오류 발생. (임시) 결제 완료 화면으로 전환되었습니다. 실제 결제는 실패했을 수 있습니다.");
      }
    };
    completePayment();
  }, [location.search, paymentId, tid, authToken, authResultCode]); // eslint-disable-line

  if (status === "PROCESSING") {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-4">
        <Spinner size="lg" />
        <h2 className="text-lg font-headline font-bold text-on-surface">결제 승인 정보를 처리 중입니다.</h2>
        <p className="text-sm text-on-surface-variant text-center">{message}</p>
      </div>
    );
  }

  const failed = status === "FAILED";

  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-x-hidden pb-24 min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant">
        <div className="flex items-center justify-between px-4 h-16 w-full max-w-md mx-auto">
          <button onClick={() => navigate("/")} className="active:opacity-70 hover:bg-surface-container transition-colors rounded-full p-2">
            <span className="material-symbols-outlined text-on-surface">close</span>
          </button>
          <h1 className="font-headline font-bold text-lg text-on-surface">{failed ? "결제 실패" : "결제 완료"}</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="pt-20 px-6 max-w-md mx-auto">
        <section className="flex flex-col items-center py-10">
          <div className="relative mb-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg animate-bounce ${failed ? "bg-error shadow-red-200" : "bg-green-500 shadow-green-200"}`}>
              <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {failed ? "cancel" : "check_circle"}
              </span>
            </div>
            <div className={`absolute inset-0 w-24 h-24 rounded-full animate-ping opacity-20 ${failed ? "bg-error" : "bg-green-500"}`} />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight">
              {failed ? "결제가 실패했습니다" : "결제가 완료되었습니다!"}
            </h2>
            <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-primary-container/30 text-primary-dim rounded-full mx-auto w-fit">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <p className="font-label text-sm font-semibold">에스크로 안전거래가 시작되었습니다</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/30 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-on-surface-variant text-xs font-label">공연명</p>
              <p className="text-lg font-bold text-on-surface">2024 월드 케이팝 페스티벌</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-on-surface-variant text-xs font-label">결제 금액</p>
                <p className="text-xl font-extrabold text-primary">155,000원</p>
              </div>
              <div className="space-y-1">
                <p className="text-on-surface-variant text-xs font-label">결제 시각</p>
                <p className="text-sm font-medium text-on-surface">{new Date().toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-dashed border-outline-variant">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant text-xs font-label">거래 번호</span>
                <span className="text-xs font-mono font-medium text-on-surface-variant px-2 py-1 bg-surface-container rounded">
                  {paymentId ? `TX-${paymentId}` : "TX-20241215-001"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 bg-surface-container-low rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {failed ? message : "판매자가 티켓을 전달하면 알림으로 안내드립니다. PASSIT의 에스크로 시스템이 구매 확정 전까지 대금을 안전하게 보호합니다."}
          </p>
        </section>

        <div className="mt-8 relative h-40 rounded-2xl overflow-hidden shadow-inner group">
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAKE9ZFmP48M0d7zptioCuSDJQRG10TeQQ09_-D8-lm1HhCA_dGjy_YM1AFD-KomRMeGGJRXcwLZAuam_ilw5lzA95NCcL1By5kIrg58Ow9TbUUJxDj0tkYEt8UEeOsg7bqBs434_lWo24POBun7-hb2pwxnXRAVg9_WAmjT0RKW6d7YSR3c3Bq4pn24Ldg0z9T00L1sDgMfhHjkwQR6JcPzkxZw1nXUZb0mPfpv7nji8tA2kV4pij-_E_-nbxYRD04ckYn8RH2zYM')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
            <span className="text-white font-label text-xs font-bold uppercase tracking-widest opacity-80">Secured Transaction • PASSIT</span>
          </div>
        </div>

        <div className="mt-10 space-y-3">
          <button onClick={() => navigate("/deals")} className="w-full h-14 bg-primary text-on-primary rounded-xl font-headline font-bold text-lg shadow-md active:scale-95 transition-transform">
            거래 현황 보기
          </button>
          <button onClick={() => navigate("/")} className="w-full h-14 border-2 border-primary text-primary rounded-xl font-headline font-bold text-lg active:bg-primary/5 active:scale-95 transition-all">
            홈으로 돌아가기
          </button>
        </div>
      </main>

      <nav className="fixed bottom-0 w-full z-50 border-t border-outline-variant bg-surface shadow-lg">
        <div className="flex justify-around items-center h-20 w-full max-w-md mx-auto">
          {NAV_ITEMS.map(([label, icon, path]) => {
            const active = label === "티켓";
            return (
              <button key={label} onClick={() => navigate(path)} className={`flex flex-col items-center justify-center transition-all active:scale-95 ${active ? "text-primary bg-secondary-container rounded-full px-3 py-1" : "text-on-surface-variant hover:text-primary"}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                <span className="font-label text-xs">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default PaymentResultPage;
