import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Modal } from "../components/common";
import tradeService from "../services/tradeService";
import { useAuth } from "../contexts/AuthContext";

const STEPS = [
  { status: "REQUESTED", label: "구매요청", icon: "check" },
  { status: "PAID", label: "결제완료", icon: "payments" },
  { status: "DELIVERED", label: "티켓전달", icon: "confirmation_number" },
  { status: "CONFIRMED", label: "수령확인", icon: "verified" },
  { status: "COMPLETED", label: "거래완료", icon: "handshake" },
];

const DEAL_STATUS_LABELS = {
  REQUESTED: "구매요청",
  ACCEPTED: "승인됨",
  PAID: "결제완료",
  COMPLETED: "거래완료",
  REJECTED: "거절됨",
  CANCELLED: "취소됨",
};

const statusIndex = (status) => {
  if (status === "REQUESTED") return 0;
  if (status === "ACCEPTED" || status === "PAID") return 1;
  if (status === "DELIVERED") return 2;
  if (status === "CONFIRMED") return 3;
  if (status === "COMPLETED") return 4;
  return 0;
};

const money = (value) => (value || 0).toLocaleString();

const DealAcceptPage = () => {
  const { deal_id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const currentUserId = authUser?.userId ?? authUser?.id;

  const mapDeal = (raw) => ({
    ...raw,
    dealId: raw.deal_id,
    dealStatus: raw.deal_status,
    ticketId: raw.ticket_id,
    chatroomId: raw.chatroom_id,
    buyerId: raw.buyer_id ?? raw.buyer?.id,
    sellerId: raw.seller_id ?? raw.seller?.id,
    buyerName: raw.buyer?.nickname ?? raw.buyer_id,
    sellerName: raw.seller?.nickname ?? raw.seller_id,
    price: raw.price ?? raw.ticket?.selling_price,
    quantity: raw.quantity ?? 1,
    createdAt: raw.deal_at ?? raw.created_at,
    ticket: raw.ticket
      ? {
          ...raw.ticket,
          eventName: raw.ticket.event_name,
          sellingPrice: raw.ticket.selling_price,
          image1: raw.ticket.image1 || raw.ticket.image_url,
          seatInfo: raw.ticket.seat_info,
        }
      : null,
  });

  const fetchDeal = useCallback(async () => {
    if (!deal_id) {
      setError("거래 ID가 유효하지 않습니다.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const raw = await tradeService.getDealDetail(deal_id);
      if (raw) setDeal(mapDeal(raw));
      else setError("거래 정보를 불러올 수 없습니다.");
    } catch {
      setError("거래 정보를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [deal_id]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  const dealStatus = deal?.dealStatus ?? deal?.status;
  const isSeller = deal && currentUserId && String(currentUserId) === String(deal.sellerId);
  const isBuyer = deal && currentUserId && String(currentUserId) === String(deal.buyerId);
  const activeStep = statusIndex(dealStatus);

  const handleAccept = async () => {
    setProcessing(true);
    setActionMsg(null);
    try {
      await tradeService.acceptDeal(deal_id, deal.chatroomId);
      setActionMsg({ type: "success", text: "양도 요청을 수락했습니다. 구매자에게 결제 안내가 전송됩니다." });
      fetchDeal();
    } catch {
      setActionMsg({ type: "error", text: "수락 처리 중 오류가 발생했습니다." });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setRejectDialogOpen(false);
    setProcessing(true);
    setActionMsg(null);
    try {
      await tradeService.rejectDeal(deal_id, deal.chatroomId, rejectReason);
      setActionMsg({ type: "info", text: "양도 요청을 거절했습니다." });
      fetchDeal();
    } catch {
      setActionMsg({ type: "error", text: "거절 처리 중 오류가 발생했습니다." });
    } finally {
      setProcessing(false);
      setRejectReason("");
    }
  };

  const handleCancel = async () => {
    setCancelDialogOpen(false);
    setProcessing(true);
    setActionMsg(null);
    try {
      await tradeService.cancelDeal(deal_id);
      setActionMsg({ type: "info", text: "거래 요청을 취소했습니다." });
      fetchDeal();
    } catch {
      setActionMsg({ type: "error", text: "취소 처리 중 오류가 발생했습니다." });
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = async () => {
    setConfirmDialogOpen(false);
    setProcessing(true);
    setActionMsg(null);
    try {
      await tradeService.confirmDeal(deal_id);
      setActionMsg({ type: "success", text: "거래가 완료되었습니다." });
      fetchDeal();
    } catch {
      setActionMsg({ type: "error", text: "거래 확정 처리 중 오류가 발생했습니다." });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
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

  if (!deal) return null;

  const ticket = deal.ticket || {};
  const image = ticket.image1 || ticket.imageUrl || ticket.thumbnailUrl;
  const msgCls = {
    success: "bg-green-50 text-green-700 border-green-200",
    error: "bg-red-50 text-red-600 border-red-200",
    info: "bg-secondary-container text-secondary border-outline-variant/30",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div className="bg-background text-on-background min-h-screen pb-32">
      <header className="fixed top-0 w-full z-50 flex items-center px-4 h-16 bg-surface border-b border-outline-variant transition-colors duration-200">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="material-symbols-outlined text-primary active:scale-95 transition-transform"
          aria-label="뒤로가기"
        >
          arrow_back
        </button>
        <h1 className="flex-1 text-center font-headline font-bold text-on-surface text-lg">거래 진행 상황</h1>
        <span className="material-symbols-outlined text-primary">security</span>
      </header>

      <main className="pt-20 px-4 space-y-6 max-w-md mx-auto">
        {actionMsg && (
          <section className={`px-4 py-3 rounded-xl border text-sm ${msgCls[actionMsg.type]}`}>
            {actionMsg.text}
          </section>
        )}

        <section className="bg-surface-container-low p-4 rounded-xl">
          <div className="flex justify-between items-start relative">
            <div className="absolute top-4 left-0 w-full h-[2px] bg-outline-variant z-0" />
            <div
              className="absolute top-4 left-0 h-[2px] bg-primary z-0 transition-all duration-500"
              style={{ width: `${Math.max(0, activeStep) * 25}%` }}
            />
            {STEPS.map((step, index) => {
              const done = index < activeStep;
              const active = index === activeStep;
              return (
                <div key={step.status} className="relative z-10 flex flex-col items-center gap-2 group">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      done || active
                        ? `bg-primary text-on-primary shadow-md ${active ? "ring-4 ring-primary-container scale-110" : ""}`
                        : "bg-surface-container-highest border border-outline-variant text-outline"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: done || active ? "'FILL' 1" : "'FILL' 0" }}>
                      {done ? "check" : step.icon}
                    </span>
                  </div>
                  <span className={`text-[10px] font-label ${active ? "font-bold text-primary" : "font-medium text-on-surface-variant"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-surface-container-high">
          <div className="relative h-48 w-full overflow-hidden bg-surface-container">
            {image ? (
              <img className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" src={image} alt={ticket.eventName || "티켓"} />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-outline">confirmation_number</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="px-2 py-1 bg-primary-container text-on-primary-container text-[10px] font-bold rounded uppercase tracking-wider">
                Ticket Confirmed
              </span>
              <h2 className="text-white font-headline font-bold text-xl mt-1 leading-tight">
                {ticket.eventName ?? deal.ticketTitle ?? "티켓"}
              </h2>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">event_seat</span>
                <span className="text-on-surface-variant text-sm font-medium">{ticket.seatInfo || "좌석 정보 미정"}</span>
              </div>
              <span className="text-primary font-bold text-lg">{money(deal.price)}원</span>
            </div>
            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 p-3 bg-surface-container-low rounded-xl">
                <p className="text-[10px] text-on-surface-variant uppercase font-label">판매자</p>
                <p className="font-bold text-sm">{deal.sellerName}</p>
              </div>
              <div className="flex-1 p-3 bg-surface-container-low rounded-xl">
                <p className="text-[10px] text-on-surface-variant uppercase font-label">구매자</p>
                <p className="font-bold text-sm">{deal.buyerName}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-secondary-container/50 border border-secondary-container p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              gpp_good
            </span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-on-secondary-container">에스크로 안전 거래 보호 중</h3>
            <p className="text-xs text-on-secondary-container opacity-80">티켓 수령 전까지 결제 대금이 안전하게 보관됩니다.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-headline font-bold text-on-surface px-1">진행 타임라인</h3>
          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant">
            <div className="relative">
              <div className="absolute -left-[20px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm">{DEAL_STATUS_LABELS[dealStatus] || dealStatus}</p>
                  <p className="text-xs text-on-surface-variant mt-1">거래 상태가 업데이트되었습니다.</p>
                </div>
                <span className="text-[10px] font-medium text-outline">현재</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -left-[20px] top-1 w-3 h-3 rounded-full bg-outline-variant ring-4 ring-background" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm text-on-surface-variant">구매 요청 완료</p>
                  <p className="text-xs text-on-surface-variant/70 mt-1">안전거래 구매 요청이 접수되었습니다.</p>
                </div>
                <span className="text-[10px] font-medium text-outline">
                  {deal.createdAt ? new Date(deal.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) : "-"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {processing ? (
          <div className="flex justify-center py-4">
            <Spinner size="md" />
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-3 py-4">
            {isSeller && dealStatus === "REQUESTED" && (
              <>
                <button type="button" onClick={handleAccept} className="w-full h-14 bg-primary text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                  <span className="material-symbols-outlined">check_circle</span>
                  요청 수락하기
                </button>
                <button type="button" onClick={() => setRejectDialogOpen(true)} className="w-full h-14 bg-background border-2 border-error text-error font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                  <span className="material-symbols-outlined">cancel</span>
                  거절하기
                </button>
              </>
            )}
            {isBuyer && dealStatus === "REQUESTED" && (
              <button type="button" onClick={() => setCancelDialogOpen(true)} className="w-full h-14 bg-background border-2 border-primary text-primary font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <span className="material-symbols-outlined">cancel</span>
                요청 취소하기
              </button>
            )}
            {isBuyer && dealStatus === "ACCEPTED" && deal.paymentId && (
              <button type="button" onClick={() => navigate(`/payments/${deal.paymentId}/detail`)} className="w-full h-14 bg-primary text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <span className="material-symbols-outlined">payments</span>
                결제하기
              </button>
            )}
            {isBuyer && dealStatus === "PAID" && (
              <button type="button" onClick={() => setConfirmDialogOpen(true)} className="w-full h-14 bg-background border-2 border-primary text-primary font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <span className="material-symbols-outlined">check_circle</span>
                수령 확인하기
              </button>
            )}
            <button type="button" onClick={() => navigate("/chat")} className="w-full h-14 bg-background border-2 border-primary text-primary font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <span className="material-symbols-outlined">chat</span>
              판매자에게 문의하기
            </button>
          </section>
        )}
      </main>

      <Modal isOpen={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} title="거절 사유 입력" size="sm">
        <div className="space-y-3">
          <textarea className="input-base resize-none min-h-[80px]" placeholder="거절 사유 (선택)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRejectDialogOpen(false)} className="btn-outlined btn-sm">취소</button>
            <button type="button" onClick={handleReject} className="px-4 py-1.5 bg-error text-on-error font-semibold rounded-xl text-sm">거절 확인</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} title="거래 요청 취소" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">거래 요청을 취소하시겠습니까?</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setCancelDialogOpen(false)} className="btn-outlined btn-sm">아니오</button>
            <button type="button" onClick={handleCancel} className="px-4 py-1.5 bg-amber-500 text-white font-semibold rounded-xl text-sm">취소 확인</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} title="거래 완료 확정" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">티켓을 정상적으로 수령했습니까? 확정 후에는 되돌릴 수 없습니다.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setConfirmDialogOpen(false)} className="btn-outlined btn-sm">취소</button>
            <button type="button" onClick={handleConfirm} className="px-4 py-1.5 bg-green-600 text-white font-semibold rounded-xl text-sm">완료 확정</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DealAcceptPage;
