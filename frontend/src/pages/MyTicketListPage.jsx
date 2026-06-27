import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ticketService from "../api/services/ticketService";

const STATUS_LABEL = {
  AVAILABLE: "판매중",
  RESERVED: "예약됨",
  SOLD: "매진",
  EXPIRED: "만료",
  DELETED: "삭제됨",
};

const CATEGORIES = ["전체 티켓", "공연", "스포츠", "뮤지컬"];

const FALLBACK_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDNNeN0Xor8VyiRE0foOOlRTzaYJ0yySTFtdx6Zpcl7va-U1oWj0yIlgfAoiLlIDs7NTzqswT4XYM_FiIwmkdV3cVzK03vA1Xg1W8qS4SpywfviKn24Nlrf6LxS9xH2WvLJZAc-SgV0I3pW-_7b8FrmjnmYLjUKMphyTLWVAUpVrlKHmw9e5JWnoXXd7BD5oD_srzKaTjXfuWa0fdk-1W2K6IbWJeHXAofL37kaE6ARoiH1GbRAhWHjqONVc065p-C6SEupkv62WHk",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA2yhrmQLZZIwPNBmXepNF9MrtwZmhd3UkU9DMhRJDYePjR5NH7NFqDrOOGIV6cuuB6qkKtqeQ2Be6jUyZ9ZHL_ugF3rkKBLhG-M_HKN20My97BW00ARKnkktgXJNX8naXhvnIrJk1NMz1XxU1czEjMLBVXAeyTBAgC2lx-v7qH3osOxpfmwq9sza8HHEqrAIiFGgp1KEp5CyzBEdslCUUnDFx1Ba32iodqXNk4yPGjA3TOtYJ0E8W9Gjwj1c3--N1XYh78cN0BTu4",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBLG7tm55YUFxdXLiSY4UIjMFMig32Bm7DMGoD3b3NW0A2N6wI5ww4u_H5rguj638hsEa03mngyNWf0EFbdi7-ndojefIgMDrtJOrhtXP73Z0L2YwkKAR3Eoh8M5U6HbH8xYGOp9kUNe-DyCq_iG1XJ8Wg3HIyMxmUC47NW1UufvmCSX-nrqIpyrR-tPyEpd5NlCH-aNjZW0Gh4jQVdsAmHhpoonL7HY97llKnRHC9cZ8NqRUZY0BfdbH--zo2t8smKzWThgS_0-HI",
];

const fmtDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\. /g, ".").replace(/\.$/, "");
};

const sampleTickets = [
  { ticketId: "sample-1", eventName: "BTS 월드투어 서울", eventDate: "2025-03-15", sellingPrice: 380000, ticketStatus: "AVAILABLE", categoryName: "SALE" },
  { ticketId: "sample-2", eventName: "뮤지컬 레미제라블", eventDate: "2025-02-20", sellingPrice: 95000, ticketStatus: "AVAILABLE", categoryName: "MUSICAL" },
  { ticketId: "sample-3", eventName: "손흥민 팬미팅", eventDate: "2025-01-30", sellingPrice: 150000, ticketStatus: "SOLD", categoryName: "EVENT" },
];

const MyTicketListPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);

  useEffect(() => {
    const fetch = async () => {
      try {
        setError("");
        const response = await ticketService.getMyTickets();
        const data = response?.data;
        setTickets(Array.isArray(data) ? data : (data?.content ?? []));
      } catch (err) {
        console.error("My 티켓 조회 실패:", err);
        setError("서버와 통신할 수 없습니다.");
      }
    };
    fetch();
  }, []);

  const visibleTickets = tickets.length > 0 ? tickets : sampleTickets;

  return (
    <div className="bg-surface text-on-surface max-w-md mx-auto min-h-screen relative pb-24">
      <header className="fixed md:sticky top-0 w-full md:w-auto z-50 bg-surface flex items-center justify-between px-4 h-16 max-w-md mx-auto">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          <h1 className="font-headline font-bold text-lg text-on-surface">찜 목록</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/mypage/profile")} className="p-2 hover:bg-surface-container-low transition-colors rounded-full active:opacity-80">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          </button>
          <button onClick={() => navigate("/notifications")} className="p-2 hover:bg-surface-container-low transition-colors rounded-full active:opacity-80">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          </button>
        </div>
      </header>

      <main className="pt-20 md:pt-4 px-4 space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full font-label text-sm whitespace-nowrap ${activeCategory === category ? "bg-primary text-on-primary font-semibold" : "bg-surface-container-high text-on-surface-variant"}`}
            >
              {category}
            </button>
          ))}
        </div>

        {error && <div className="rounded-xl bg-error-container/40 px-4 py-3 text-sm text-error">{error}</div>}

        <div className="grid grid-cols-1 gap-4">
          {visibleTickets.map((ticket, index) => {
            const sold = ticket.ticketStatus === "SOLD";
            return (
              <article
                key={ticket.ticketId}
                onClick={() => ticket.ticketId.toString().startsWith("sample") ? null : navigate(`/mypage/my-tickets/${ticket.ticketId}/edit`)}
                className={`relative flex bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/20 active:scale-[0.97] transition-transform ${sold ? "opacity-75 grayscale-[0.3]" : ""}`}
              >
                <div className="w-32 h-40 flex-shrink-0 relative">
                  {sold && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                      <span className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full">SOLD OUT</span>
                    </div>
                  )}
                  <img className="w-full h-full object-cover" alt="" src={ticket.image1 || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]} />
                </div>
                <div className="p-4 flex flex-col justify-between flex-grow min-w-0">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-0.5 font-bold text-[10px] rounded uppercase tracking-wider ${sold ? "bg-surface-variant text-on-surface-variant" : "bg-secondary-container text-primary"}`}>
                        {ticket.categoryName || "SALE"}
                      </span>
                      <button className="text-error active:scale-125 transition-transform" onClick={(event) => event.stopPropagation()}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      </button>
                    </div>
                    <h3 className="font-headline font-bold text-on-surface mt-2 text-lg leading-tight line-clamp-2">{ticket.eventName}</h3>
                    <div className="flex items-center gap-1 mt-1 text-on-surface-variant text-xs">
                      <span className="material-symbols-outlined text-xs">calendar_today</span>
                      {fmtDate(ticket.eventDate)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 gap-2">
                    <span className={`font-bold text-lg whitespace-nowrap ${sold ? "text-on-surface-variant" : "text-primary"}`}>
                      {Number(ticket.sellingPrice || 0).toLocaleString()}원
                    </span>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${sold ? "bg-surface-dim text-on-surface-variant" : "bg-primary/10 text-primary"}`}>
                      {STATUS_LABEL[ticket.ticketStatus] || ticket.ticketStatus || "판매중"}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default MyTicketListPage;
