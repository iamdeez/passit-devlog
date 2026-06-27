import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ticketService } from "../api/services/ticketService";

const CATEGORIES = [
  { id: null, name: "전체" },
  { id: 3, name: "콘서트" },
  { id: 1, name: "뮤지컬" },
  { id: 4, name: "스포츠" },
  { id: 2, name: "연극" },
  { id: 6, name: "클래식" },
  { id: 5, name: "전시" },
];

const ticketTitle = (ticket) => ticket.eventName || ticket.title || "티켓";
const ticketPrice = (ticket) => (ticket.sellingPrice || ticket.price || 0).toLocaleString();
const ticketStatus = (ticket) => ticket.ticketStatus || ticket.status;
const ticketPlace = (ticket) => ticket.eventVenue || ticket.location || ticket.venue || "장소 추후 공지";

const formatEventDate = (ticket) => {
  if (!ticket.eventDate) return ticketPlace(ticket);
  const date = new Date(ticket.eventDate);
  if (Number.isNaN(date.getTime())) return `${ticket.eventDate} ${ticketPlace(ticket)}`;
  return `${date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })} ${ticketPlace(ticket)}`;
};

function TicketImage({ ticket, className = "" }) {
  const image = ticket.image1 || ticket.imageUrl || ticket.thumbnailUrl;

  if (image) {
    return (
      <img
        src={image}
        alt={ticketTitle(ticket)}
        className={`w-full h-full object-cover ${className}`}
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <div className={`w-full h-full bg-surface-dim flex items-center justify-center ${className}`}>
      <span className="material-symbols-outlined text-4xl text-outline">confirmation_number</span>
    </div>
  );
}

function PopularTicketCard({ ticket, onClick }) {
  const status = ticketStatus(ticket);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-shrink-0 w-72 bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 text-left transition-transform active:scale-[0.98]"
    >
      <div className="h-40 w-full relative bg-surface-dim">
        <TicketImage ticket={ticket} />
        <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
          {status === "AVAILABLE" || !status ? "판매중" : "거래중"}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-3 text-white text-xs font-medium">HOT</div>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-bold text-on-surface line-clamp-1">{ticketTitle(ticket)}</h3>
        <div className="flex items-center text-xs text-on-surface-variant gap-1">
          <span className="material-symbols-outlined text-sm">calendar_today</span>
          <span className="truncate">{formatEventDate(ticket)}</span>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-primary font-bold text-lg">₩{ticketPrice(ticket)}</span>
          <span className="p-1.5 rounded-full bg-primary-container text-primary">
            <span className="material-symbols-outlined text-sm">favorite</span>
          </span>
        </div>
      </div>
    </button>
  );
}

function RecentTicketItem({ ticket, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 bg-surface-container-lowest p-3 rounded-2xl shadow-sm border border-outline-variant/20 text-left active:bg-surface-container-low transition-colors"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface-dim">
        <TicketImage ticket={ticket} />
      </div>
      <div className="flex-grow min-w-0 py-1">
        <h4 className="font-bold text-sm text-on-surface line-clamp-1 truncate">{ticketTitle(ticket)}</h4>
        <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">{formatEventDate(ticket)}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-primary font-bold">₩{ticketPrice(ticket)}</span>
          <div className="flex items-center bg-surface-container-high px-2 py-0.5 rounded-full">
            <span
              className="material-symbols-outlined text-[10px] text-yellow-500"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="text-[10px] font-bold ml-0.5 text-on-surface-variant">4.8</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function LoadingRail() {
  return (
    <div className="flex gap-4 overflow-hidden -mx-4 px-4 pb-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex-shrink-0 w-72 bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 animate-pulse"
        >
          <div className="h-40 bg-surface-container" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-surface-container rounded-full w-3/4" />
            <div className="h-3 bg-surface-container rounded-full w-1/2" />
            <div className="h-5 bg-surface-container rounded-full w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const params = {
          status: "AVAILABLE",
          page: 0,
          size: 8,
          sortBy: "viewCount",
          sortDirection: "DESC",
        };
        if (activeCategory) params.categoryId = activeCategory;

        const [hotRes, recentRes] = await Promise.all([
          ticketService.getTickets(params),
          ticketService.getTickets({
            status: "AVAILABLE",
            page: 0,
            size: 4,
            sortBy: "createdAt",
            sortDirection: "DESC",
          }),
        ]);

        setTickets(hotRes.success && hotRes.data?.content ? hotRes.data.content : []);
        setRecentTickets(recentRes.success && recentRes.data?.content ? recentRes.data.content : []);
      } catch {
        setTickets([]);
        setRecentTickets([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeCategory]);

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) navigate(`/tickets?keyword=${encodeURIComponent(searchQuery.trim())}`);
  };

  const openTicket = (ticket) => navigate(`/tickets/${ticket.ticketId || ticket.id}/detail`);

  return (
    <div className="min-h-screen bg-background text-on-surface pb-24">
      <main className="pt-20 px-4 space-y-6 max-w-3xl mx-auto">
        <section className="relative">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-surface-container rounded-full px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all"
          >
            <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 w-full text-sm font-medium placeholder:text-outline p-0"
              placeholder="공연·스포츠·뮤지컬 검색"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </form>
        </section>

        <section className="bg-primary rounded-xl p-4 flex items-center justify-between shadow-md relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-white/20 p-2 rounded-full">
              <span
                className="material-symbols-outlined text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm leading-tight">에스크로 보호 거래</h3>
              <p className="text-white/80 text-xs">안전하게 사고파세요</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-white/40 text-4xl relative z-10">shield</span>
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        </section>

        <section className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4">
          {CATEGORIES.map((category) => {
            const active = activeCategory === category.id;
            return (
              <button
                key={category.id ?? "all"}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm transition-colors ${
                  active
                    ? "bg-primary text-on-primary font-semibold shadow-sm"
                    : "bg-surface-container-high text-on-surface-variant font-medium hover:bg-secondary-container"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-headline font-bold text-on-surface">인기 티켓</h2>
            <button type="button" onClick={() => navigate("/tickets")} className="text-xs font-semibold text-primary">
              더보기
            </button>
          </div>

          {loading ? (
            <LoadingRail />
          ) : tickets.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2">
              {tickets.slice(0, 8).map((ticket) => (
                <PopularTicketCard
                  key={ticket.ticketId || ticket.id}
                  ticket={ticket}
                  onClick={() => openTicket(ticket)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-14 border border-outline-variant/30 rounded-2xl bg-surface-container-low">
              <span className="material-symbols-outlined text-4xl text-outline-variant block mb-3">
                confirmation_number
              </span>
              <p className="text-sm text-on-surface-variant mb-4">등록된 티켓이 없습니다</p>
              <button type="button" onClick={() => navigate("/sell")} className="text-sm font-bold text-primary">
                첫 티켓 등록하기
              </button>
            </div>
          )}
        </section>

        {recentTickets.length > 0 && (
          <section className="space-y-4 pb-12">
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-headline font-bold text-on-surface">최근 등록된 티켓</h2>
              <button type="button" onClick={() => navigate("/tickets")} className="text-xs font-semibold text-primary">
                전체보기
              </button>
            </div>
            <div className="space-y-3">
              {recentTickets.slice(0, 4).map((ticket) => (
                <RecentTicketItem
                  key={ticket.ticketId || ticket.id}
                  ticket={ticket}
                  onClick={() => openTicket(ticket)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <button
        type="button"
        onClick={() => navigate("/sell")}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-center active:scale-90 transition-transform z-40 md:hidden"
        aria-label="티켓 등록"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
    </div>
  );
}
