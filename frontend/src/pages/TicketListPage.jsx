import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Alert, EmptyState } from "../components/common";
import { useTickets } from "../hooks/useTickets";

const CATEGORIES = ["전체", "콘서트", "스포츠", "전시", "기타"];

const STATUS_LABEL = {
  AVAILABLE: "판매중",
  RESERVED: "예약중",
  SOLD: "거래완료",
  EXPIRED: "만료",
};

const STATUS_CLASS = {
  AVAILABLE: "bg-primary/10 text-primary",
  RESERVED: "bg-secondary-container text-on-secondary-container",
  SOLD: "bg-outline-variant/30 text-on-surface-variant",
  EXPIRED: "bg-error/10 text-error",
};

const ticketTitle = (ticket) => ticket.eventName || ticket.title || "티켓";
const ticketPrice = (ticket) => (ticket.sellingPrice || ticket.price || 0).toLocaleString();
const ticketDate = (ticket) => {
  if (!ticket.eventDate) return "날짜 미정";
  const date = new Date(ticket.eventDate);
  if (Number.isNaN(date.getTime())) return ticket.eventDate;
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
};
const ticketSeat = (ticket) => ticket.seatInfo || ticket.seat || ticket.eventLocation || "좌석 정보 미정";

function TicketThumb({ ticket }) {
  const image = ticket.image1 || ticket.imageUrl || ticket.thumbnailUrl;
  if (!image) {
    return (
      <div className="w-full h-full bg-surface-container flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-outline">confirmation_number</span>
      </div>
    );
  }

  return (
    <img
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      src={image}
      alt={ticketTitle(ticket)}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

function TicketRow({ ticket, onClick }) {
  const status = ticket.ticketStatus || ticket.status || "AVAILABLE";
  const sold = status === "SOLD";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-surface-container hover:shadow-md transition-shadow cursor-pointer group text-left ${
        sold ? "grayscale-[0.3]" : ""
      }`}
    >
      <div className={`flex gap-4 ${sold ? "opacity-70" : ""}`}>
        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-surface-container">
          <TicketThumb ticket={ticket} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-on-surface truncate pr-2">{ticketTitle(ticket)}</h3>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase shrink-0 ${STATUS_CLASS[status] || STATUS_CLASS.AVAILABLE}`}>
              {STATUS_LABEL[status] || status}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 mb-2">
            <div className="flex items-center gap-1 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              <span>{ticketDate(ticket)}</span>
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-[14px]">event_seat</span>
              <span className="truncate">{ticketSeat(ticket)}</span>
            </div>
          </div>
          <p className={`text-lg font-black ${sold ? "text-on-surface-variant" : "text-primary"}`}>
            {ticketPrice(ticket)}원
          </p>
        </div>
      </div>
    </button>
  );
}

export default function TicketListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get("keyword") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "전체");

  const { tickets, loading, error, updateKeyword, updateFilters } = useTickets({
    status: "AVAILABLE",
    keyword: searchParams.get("keyword") || "",
    category: searchParams.get("category") || "",
    sortBy: "eventDate",
    sortDirection: "ASC",
  });

  useEffect(() => {
    const keyword = searchParams.get("keyword");
    const category = searchParams.get("category");
    if (keyword) {
      setSearchKeyword(keyword);
      updateKeyword(keyword);
    }
    if (category) {
      setActiveCategory(category);
      updateFilters({ category });
    }
  }, [searchParams, updateKeyword, updateFilters]);

  const handleSearch = (event) => {
    event.preventDefault();
    updateKeyword(searchKeyword);
  };

  const selectCategory = (category) => {
    setActiveCategory(category);
    updateFilters({ category: category === "전체" ? "" : category });
  };

  return (
    <div className="min-h-screen bg-background font-body text-on-surface pb-24">
      <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant shadow-sm flex items-center justify-between px-4 h-16">
        <button type="button" onClick={() => navigate("/")} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            confirmation_number
          </span>
          <h1 className="text-2xl font-black tracking-tighter text-primary">PASSIT</h1>
        </button>
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="p-2 hover:bg-surface-container-high transition-colors active:scale-95 duration-150 rounded-full"
          aria-label="알림"
        >
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        </button>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto">
        <form className="mb-6" onSubmit={handleSearch}>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              className="w-full h-14 pl-12 pr-4 bg-surface-container border-none rounded-full focus:ring-2 focus:ring-primary-container transition-all text-on-surface-variant placeholder:text-outline-variant font-medium"
              placeholder="공연, 스포츠, 뮤지컬 검색"
              type="text"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
            />
          </div>
        </form>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-6">
          {CATEGORIES.map((category) => {
            const active = activeCategory === category || (!activeCategory && category === "전체");
            return (
              <button
                key={category}
                type="button"
                onClick={() => selectCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="mb-8 p-4 bg-primary-container/30 border border-primary-container rounded-2xl flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified_user
          </span>
          <div>
            <p className="text-sm font-bold text-on-primary-container">에스크로 안전거래 보호 중</p>
            <p className="text-xs text-on-primary-container/80">
              거래가 완료될 때까지 결제 대금을 안전하게 보호합니다.
            </p>
          </div>
        </div>

        {error && <Alert type="error" message={error} />}

        <div className="space-y-4">
          {loading && tickets.length === 0 ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-surface-container-lowest rounded-3xl p-4 shadow-sm border border-surface-container animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-surface-container shrink-0" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-surface-container rounded-full w-3/4" />
                    <div className="h-3 bg-surface-container rounded-full w-1/2" />
                    <div className="h-5 bg-surface-container rounded-full w-1/3" />
                  </div>
                </div>
              </div>
            ))
          ) : tickets.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-3xl border border-surface-container">
              <EmptyState
                icon="confirmation_number"
                title="검색 결과가 없습니다"
                description="다른 검색어로 시도해보세요"
                action={{ label: "티켓 판매하기", onClick: () => navigate("/sell") }}
              />
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketRow
                key={ticket.ticketId || ticket.id}
                ticket={ticket}
                onClick={() => navigate(`/tickets/${ticket.ticketId || ticket.id}/detail`)}
              />
            ))
          )}
        </div>
      </main>

      <button
        type="button"
        onClick={() => navigate("/sell")}
        className="fixed right-6 bottom-24 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform duration-200 z-40"
        aria-label="티켓 등록"
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'wght' 600" }}>
          add
        </span>
      </button>
    </div>
  );
}
