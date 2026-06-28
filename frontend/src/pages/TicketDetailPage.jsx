import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "../components/common";
import { ticketService } from "../api/services/ticketService";
import { useAuth } from "../contexts/AuthContext";
import tradeService from "../services/tradeService";
import { createChatRoom } from "../api/services/chat/chat.api";
import DealRequestModal from "../components/Ticket/DealRequestModal";
import LoadingModal from "../components/Ticket/LoadingModal";
import RequestSuccessModal from "../components/Ticket/RequestSuccessModal";

const CATEGORY_LABEL = {
  1: "MUSICAL",
  2: "PLAY",
  3: "CONCERT",
  4: "SPORTS",
  5: "EXHIBITION",
  6: "CLASSIC",
};

const formatDateTime = (value) => {
  if (!value) return "날짜 미정";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const price = (value) => (value || 0).toLocaleString();

function IconInfo({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-on-surface-variant font-medium">{label}</span>
        <span className="text-[15px] font-semibold text-on-surface">{value}</span>
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  const { ticket_id } = useParams();
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  const currentUserId = authUser?.userId ?? authUser?.id;

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDealRequestModalOpen, setIsDealRequestModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdDealId, setCreatedDealId] = useState(null);

  useEffect(() => {
    if (!ticket_id) {
      setError("티켓 ID가 유효하지 않습니다.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const response = await ticketService.getTicketDetail(ticket_id);
        if (response.success && response.data) setTicket(response.data);
        else throw new Error("티켓 정보를 불러올 수 없습니다.");
      } catch (err) {
        setError(
          err.response?.status === 404
            ? `티켓 ID ${ticket_id}번을 찾을 수 없습니다.`
            : "티켓 정보를 불러오는 데 실패했습니다.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [ticket_id]);

  useEffect(() => {
    if (!isAuthenticated || !ticket_id) return;
    (async () => {
      try {
        const response = await ticketService.checkFavorite(ticket_id);
        if (response.success) setIsFavorite(response.data);
      } catch {}
    })();
  }, [isAuthenticated, ticket_id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      setSubmitError("찜하기 기능은 로그인이 필요합니다.");
      return;
    }
    try {
      const response = await ticketService.toggleFavorite(ticket_id);
      if (response.success) setIsFavorite(response.data);
    } catch {
      setSubmitError("찜하기 처리 중 오류가 발생했습니다.");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: ticket?.eventName || "티켓", url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("링크가 복사되었습니다.");
    }
  };

  const handlePurchaseClick = () => {
    if (!isAuthenticated || !currentUserId) {
      setSubmitError("로그인이 필요합니다.");
      return;
    }
    if (ticket.ownerId === currentUserId) {
      setSubmitError("자신의 티켓은 구매할 수 없습니다.");
      return;
    }
    if (ticket.ticketStatus !== "AVAILABLE") {
      setSubmitError("현재 판매 중인 티켓이 아닙니다.");
      return;
    }
    setSubmitError(null);
    setIsDealRequestModalOpen(true);
  };

  const handleConfirmPurchase = async (ticketId) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const room = await createChatRoom({ ticketId });
      if (!room?.chatroom_id) throw new Error("채팅방 생성에 실패했습니다.");
      const deal = await tradeService.createDeal(ticketId, room.chatroom_id);
      setCreatedDealId(deal?.deal_id ?? null);
      setIsDealRequestModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      setSubmitError(err.message || "요청 처리 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessConfirm = () => {
    setIsSuccessModalOpen(false);
    if (createdDealId) navigate(`/deals/${createdDealId}/detail`);
    else navigate("/deals");
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
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl text-error">error</span>
        </div>
        <h2 className="text-xl font-display font-bold text-on-surface mb-2 text-center">{error}</h2>
        <button
          type="button"
          onClick={() => navigate("/tickets")}
          className="mt-4 px-6 py-2.5 bg-primary text-on-primary font-display font-bold rounded-xl active:scale-[0.97] transition-all"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  if (!ticket) return null;

  const image = ticket.image1 || ticket.imageUrl || ticket.thumbnailUrl;
  const title = ticket.eventName || ticket.title || "티켓";
  const category = ticket.category?.name || CATEGORY_LABEL[ticket.rootCategoryId] || "CONCERT";
  const location = ticket.eventLocation || ticket.eventVenue || ticket.location || "장소 미정";
  const seat = ticket.seatInfo || ticket.seat || "좌석 정보 미정";
  const sellingPrice = ticket.sellingPrice || ticket.price || 0;
  const originalPrice = ticket.originalPrice || Math.round(sellingPrice * 1.06);
  const sellerName = ticket.ownerNickname || ticket.sellerName || ticket.ownerName || "티켓마스터";

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary-container">
      <header className="fixed top-0 inset-x-0 mx-auto w-full max-w-md z-50 flex items-center justify-between px-4 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-95"
            aria-label="뒤로가기"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          <h1 className="font-headline text-lg font-bold text-on-surface">티켓 상세</h1>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-95"
            aria-label="공유"
          >
            <span className="material-symbols-outlined text-on-surface-variant">share</span>
          </button>
          <button
            type="button"
            onClick={handleToggleFavorite}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors active:scale-95"
            aria-label="찜"
          >
            <span
              className={`material-symbols-outlined ${isFavorite ? "text-error" : "text-on-surface-variant"}`}
              style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>
        </div>
      </header>

      <main className="pt-16 pb-32 max-w-2xl mx-auto">
        <section className="relative w-full aspect-video overflow-hidden bg-surface-container">
          {image ? (
            <img
              alt={title}
              className="w-full h-full object-cover"
              src={image}
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-outline">confirmation_number</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </section>

        <div className="px-5 py-6 flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-primary font-bold text-sm tracking-wide uppercase">{category}</span>
              <h2 className="text-2xl font-extrabold font-headline leading-tight tracking-tight text-on-surface">
                {title}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
              <IconInfo icon="calendar_today" label="일시" value={formatDateTime(ticket.eventDate)} />
              <IconInfo icon="location_on" label="장소" value={location} />
              <IconInfo icon="event_seat" label="좌석 정보" value={seat} />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <div className="flex flex-col">
                {originalPrice > sellingPrice && (
                  <span className="text-on-surface-variant text-sm line-through">{price(originalPrice)}원</span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-extrabold text-primary font-display">{price(sellingPrice)}원</span>
                  {originalPrice > sellingPrice && (
                    <span className="bg-error/10 text-error text-xs font-bold px-2 py-0.5 rounded-full">
                      {Math.round((1 - sellingPrice / originalPrice) * 100)}% SALE
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-primary-container/20 p-4 rounded-xl border border-primary/10">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-on-primary-container">에스크로 보호 거래 대상</span>
                <p className="text-xs text-on-primary-fixed-variant leading-relaxed">
                  구매 확정 전까지 결제 대금이 안전하게 보관됩니다.
                </p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-on-surface-variant">판매자 정보</h3>
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      person
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white p-0.5 rounded-full border-2 border-white">
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-on-surface">{sellerName}</span>
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                      인증됨
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                    <span>거래 {ticket.ownerDealCount || 0}회</span>
                    <span className="w-0.5 h-0.5 bg-outline-variant rounded-full" />
                    <div className="flex items-center gap-0.5 text-primary">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      <span>{ticket.ownerRating || "4.9"}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button type="button" className="text-primary text-xs font-bold hover:underline">
                프로필 보기
              </button>
            </div>
          </section>

          <section className="border-y border-outline-variant/30">
            <details className="group py-4" open>
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-bold text-on-surface">공연 및 좌석 상세 설명</span>
                <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-on-surface-variant">
                  expand_more
                </span>
              </summary>
              <div className="pt-4 pb-2 text-on-surface-variant text-sm leading-relaxed space-y-3">
                <p>{ticket.description || "상세 설명이 등록되지 않았습니다."}</p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>배송 방법: {ticket.tradeType === "DELIVERY" ? "배송 거래" : "모바일 티켓 전송"}</li>
                  <li>취소 규정: 판매자와 채팅으로 확인하세요</li>
                  <li>암표 방지를 위한 현장 본인 확인이 있을 수 있음</li>
                </ul>
              </div>
            </details>
          </section>

          {submitError && (
            <div className="px-4 py-3 rounded-xl bg-error-container text-on-error-container text-sm">
              {submitError}
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-16 left-0 w-full bg-surface-container border-t border-outline-variant/20 p-4 z-40 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-bold">합계 금액</span>
            <span className="text-xl font-extrabold text-on-surface">{price(sellingPrice)}원</span>
          </div>
          <button
            type="button"
            onClick={handlePurchaseClick}
            className="flex-1 bg-primary text-on-primary h-14 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-50"
            disabled={ticket.ticketStatus !== "AVAILABLE"}
          >
            안전하게 구매하기
          </button>
        </div>
      </div>

      <DealRequestModal
        isOpen={isDealRequestModalOpen}
        onClose={() => setIsDealRequestModalOpen(false)}
        onConfirm={handleConfirmPurchase}
        ticket={ticket}
      />
      <LoadingModal isOpen={isSubmitting} message="거래 요청을 처리하는 중입니다..." />
      <RequestSuccessModal
        isOpen={isSuccessModalOpen}
        onConfirm={handleSuccessConfirm}
        title="거래 요청 완료"
        message="거래 요청이 완료되었습니다."
      />
    </div>
  );
}
