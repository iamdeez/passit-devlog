import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Modal } from "../components/common";
import tradeService from "../services/tradeService";
import { isDemoMode } from "../demo/demoConfig";

const money = (value) => (value || 0).toLocaleString();
const titleOf = (ticket, deal) => ticket?.eventName ?? deal?.ticketTitle ?? "티켓";
const dateOf = (ticket) => {
  if (!ticket?.eventDate) return "일정 미정";
  const date = new Date(ticket.eventDate);
  if (Number.isNaN(date.getTime())) return ticket.eventDate;
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const BuyerPaymentPage = () => {
  const { payment_id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paidMsg, setPaidMsg] = useState(null);
  const [method, setMethod] = useState("kakao");

  const fetchData = useCallback(async () => {
    if (!payment_id) {
      setError("결제 ID가 유효하지 않습니다.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await tradeService.getPaymentDetail(payment_id);
      if (res.success && res.data) setData(res.data);
      else setError(res.error || "결제 정보를 불러올 수 없습니다.");
    } catch {
      setError("결제 정보를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [payment_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDemoPayment = async () => {
    setPayModalOpen(false);
    setPaying(true);
    try {
      const res = await tradeService.completePayment({ paymentId: payment_id });
      if (res.success) {
        setPaidMsg("데모 결제가 완료되었습니다.");
        fetchData();
      } else {
        setError(res.error || "결제 처리 중 오류가 발생했습니다.");
      }
    } catch {
      setError("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface pt-20 px-4">
        <div className="max-w-sm mx-auto">
          <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm mb-4">{error}</div>
          <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant text-sm">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { payments, deal, ticket } = data;
  const isPending = payments?.paymentStatus === "PENDING";
  const isPaid = payments?.paymentStatus === "PAID";
  const totalPrice = ticket?.sellingPrice && deal?.quantity
    ? ticket.sellingPrice * deal.quantity
    : payments?.amount ?? deal?.price ?? 0;
  const image = ticket?.image1 || ticket?.imageUrl || ticket?.thumbnailUrl;

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <header className="fixed top-0 inset-x-0 mx-auto w-full max-w-md z-50 flex items-center justify-between px-4 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="material-symbols-outlined text-primary hover:bg-surface-container-high transition-colors p-2 rounded-full active:scale-95"
            aria-label="뒤로가기"
          >
            arrow_back
          </button>
          <h1 className="font-headline text-lg font-bold text-on-surface">결제하기</h1>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto space-y-6">
        {paidMsg && (
          <section className="bg-[#E6F4EA] border border-[#34A853]/20 rounded-xl p-4 text-sm text-[#185E30]">
            {paidMsg}
          </section>
        )}

        <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/30 transition-all hover:shadow-md">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 aspect-[1.75] md:aspect-square overflow-hidden bg-surface-container">
              {image ? (
                <img alt={titleOf(ticket, deal)} className="w-full h-full object-cover" src={image} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-5xl text-outline">confirmation_number</span>
                </div>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    TICKET
                  </span>
                </div>
                <h2 className="font-display text-lg font-extrabold text-on-surface leading-tight mb-2">
                  {titleOf(ticket, deal)}
                </h2>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span>{dateOf(ticket)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span>{ticket?.seatInfo || ticket?.eventLocation || "좌석 정보 미정"}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-outline-variant/20 flex justify-between items-end">
                <span className="text-on-surface-variant text-xs font-medium">티켓 금액</span>
                <span className="text-primary font-bold text-xl">{money(totalPrice)}원</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#E6F4EA] border border-[#34A853]/20 rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#34A853] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
          <div>
            <p className="text-sm font-semibold text-[#185E30]">안전하게 보호받는 거래입니다.</p>
            <p className="text-xs text-[#185E30]/80 mt-0.5">
              결제 대금은 구매 확정 후 판매자에게 전달되어 먹튀 걱정 없이 안전하게 거래할 수 있습니다.
            </p>
          </div>
        </section>

        {isDemoMode() && (
          <section className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <span className="material-symbols-outlined text-amber-500 text-lg flex-shrink-0">info</span>
            이 결제는 포트폴리오 데모용 시뮬레이션이며 실제 결제가 발생하지 않습니다.
          </section>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-base font-bold text-on-surface">결제 수단 선택</h3>
          </div>
          <div className="grid gap-3">
            {[
              { id: "kakao", title: "카카오페이", subtitle: "빠르고 간편한 결제", icon: "PAY", recommended: true },
              { id: "card", title: "신용/체크카드", iconName: "credit_card" },
              { id: "bank", title: "무통장입금", iconName: "account_balance" },
            ].map((item) => {
              const active = method === item.id;
              return (
                <label
                  key={item.id}
                  className={`relative flex items-center p-4 rounded-xl cursor-pointer transition-all ${
                    active
                      ? "bg-primary/5 border-2 border-primary"
                      : "bg-surface-container-lowest border border-outline-variant/30 hover:bg-surface-container-low"
                  }`}
                >
                  <input className="hidden" name="payment" type="radio" checked={active} onChange={() => setMethod(item.id)} />
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.id === "kakao" ? "bg-[#FFEB00]" : "bg-surface-container"}`}>
                        {item.iconName ? (
                          <span className="material-symbols-outlined text-on-surface-variant">{item.iconName}</span>
                        ) : (
                          <span className="font-black text-[10px] text-black">{item.icon}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-on-surface">{item.title}</span>
                          {item.recommended && (
                            <span className="bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded-full font-medium">추천</span>
                          )}
                        </div>
                        {item.subtitle && <p className="text-xs text-on-surface-variant mt-0.5">{item.subtitle}</p>}
                      </div>
                    </div>
                    <span
                      className={`material-symbols-outlined ${active ? "text-primary" : "text-outline-variant"}`}
                      style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {active ? "radio_button_checked" : "radio_button_unchecked"}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        <section className="bg-surface-container rounded-xl p-5 space-y-4">
          <h3 className="font-headline text-base font-bold text-on-surface">결제 금액 상세</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="text-sm">티켓 가격</span>
              <span className="text-sm font-medium">{money(totalPrice)}원</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-on-surface-variant">수수료</span>
                <span className="bg-secondary-container text-on-secondary-container text-[10px] px-2 py-0.5 rounded-full font-bold">
                  EVENT
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-primary">0원</span>
                <p className="text-[10px] text-on-surface-variant">안전거래 수수료 무료 이벤트 적용</p>
              </div>
            </div>
            <div className="pt-4 border-t border-outline-variant flex justify-between items-center">
              <span className="text-base font-bold text-on-surface">총 결제 금액</span>
              <span className="text-2xl font-black text-primary">{money(totalPrice)}원</span>
            </div>
          </div>
        </section>

        <div className="px-2">
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            결제 시 서비스 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주합니다. 티켓 거래의 특성상 판매자의 개인 사정에 따른 환불은 어려울 수 있으니 신중히 결정해 주세요.
          </p>
        </div>
      </main>

      <footer className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-md bg-surface-container-lowest border-t border-outline-variant p-4 z-50">
        <div className="max-w-2xl mx-auto">
          {paying ? (
            <div className="h-14 flex items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : isPending ? (
            <button
              type="button"
              onClick={() => setPayModalOpen(true)}
              className="w-full h-14 bg-primary text-on-primary rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/20"
            >
              <span>{money(totalPrice)}원 결제하기</span>
              <span className="material-symbols-outlined">payments</span>
            </button>
          ) : isPaid ? (
            <button
              type="button"
              onClick={() => navigate(`/deals/${payments?.dealId ?? deal?.dealId}/detail`)}
              className="w-full h-14 bg-primary text-on-primary rounded-xl font-bold text-lg"
            >
              거래 상세 보기
            </button>
          ) : null}
        </div>
      </footer>

      <Modal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} title="데모 결제 확인" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            <strong className="text-on-surface">{money(totalPrice)}원</strong>의 데모 결제를 진행하시겠습니까?
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setPayModalOpen(false)} className="btn-outlined btn-sm">취소</button>
            <button type="button" onClick={handleDemoPayment} className="btn-primary btn-sm">데모 결제 완료</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BuyerPaymentPage;
