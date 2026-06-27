import React, { useState, useMemo } from "react";
import AdminLayout from "../../components/admin/AdminLayout";

const STATUS_CONFIG = {
  PENDING:    { label: "거래 요청",  bg: "bg-primary-container",  fg: "text-primary",  icon: "hourglass_empty" },
  IN_PROGRESS:{ label: "진행중",    bg: "bg-amber-100", fg: "text-amber-700", icon: "sync" },
  COMPLETED:  { label: "완료",      bg: "bg-green-100", fg: "text-green-700", icon: "check_circle" },
  CANCELLED:  { label: "취소",      bg: "bg-surface-container", fg: "text-on-surface-variant", icon: "cancel" },
  DISPUTED:   { label: "분쟁",      bg: "bg-red-100",   fg: "text-red-600",   icon: "flag" },
};

const FILTER_TABS = [
  { key: "ALL",         label: "전체" },
  { key: "IN_PROGRESS", label: "진행중" },
  { key: "COMPLETED",   label: "완료" },
  { key: "CANCELLED",   label: "취소" },
];

const DEMO_DEALS = [
  {
    id: "TX-2840",
    ticketTitle: "BTS World Tour 2025 - 서울 공연",
    sellerName: "김민준",
    buyerName: "이서연",
    amount: 180000,
    status: "COMPLETED",
    escrow: true,
    createdAt: "2025-06-20T09:00:00Z",
  },
  {
    id: "TX-2839",
    ticketTitle: "IU 팔레트 콘서트 VIP석",
    sellerName: "박지훈",
    buyerName: "최유진",
    amount: 250000,
    status: "IN_PROGRESS",
    escrow: true,
    createdAt: "2025-06-21T14:30:00Z",
  },
  {
    id: "TX-2838",
    ticketTitle: "세계탁구선수권대회 준결승",
    sellerName: "정수아",
    buyerName: "한동욱",
    amount: 95000,
    status: "COMPLETED",
    escrow: false,
    createdAt: "2025-06-19T11:00:00Z",
  },
  {
    id: "TX-2837",
    ticketTitle: "NCT Dream 팬미팅 - 광주",
    sellerName: "오세진",
    buyerName: "윤하영",
    amount: 130000,
    status: "CANCELLED",
    escrow: true,
    createdAt: "2025-06-18T16:20:00Z",
  },
  {
    id: "TX-2836",
    ticketTitle: "뮤지컬 레미제라블 S석",
    sellerName: "임채원",
    buyerName: "강민호",
    amount: 170000,
    status: "DISPUTED",
    escrow: true,
    createdAt: "2025-06-17T10:00:00Z",
  },
  {
    id: "TX-2835",
    ticketTitle: "손흥민 은퇴 특별 경기 - VIP",
    sellerName: "배수지",
    buyerName: "조현우",
    amount: 320000,
    status: "IN_PROGRESS",
    escrow: true,
    createdAt: "2025-06-22T08:45:00Z",
  },
  {
    id: "TX-2834",
    ticketTitle: "아이유 단독 콘서트 R석",
    sellerName: "신동현",
    buyerName: "권나라",
    amount: 198000,
    status: "COMPLETED",
    escrow: false,
    createdAt: "2025-06-16T13:00:00Z",
  },
  {
    id: "TX-2833",
    ticketTitle: "야구 한국시리즈 1차전",
    sellerName: "류승기",
    buyerName: "문소희",
    amount: 78000,
    status: "PENDING",
    escrow: true,
    createdAt: "2025-06-23T07:30:00Z",
  },
];

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("ko-KR", { year: "2-digit", month: "2-digit", day: "2-digit" });

const fmtAmount = (n) => n.toLocaleString("ko-KR") + "원";

const PAGE_SIZE = 5;

function DetailModal({ deal, onClose }) {
  if (!deal) return null;
  const cfg = STATUS_CONFIG[deal.status] ?? STATUS_CONFIG.PENDING;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="px-6 pt-6 pb-4 border-b border-outline-variant/20 flex items-start justify-between">
          <div>
            <p className="text-xs text-on-surface-variant font-mono mb-1">#{deal.id}</p>
            <h2 className="font-display font-bold text-on-surface text-lg leading-snug">{deal.ticketTitle}</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-all flex-shrink-0 ml-3 mt-0.5">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* 상태 + 에스크로 */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.fg}`}>
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
              {cfg.label}
            </span>
            {deal.escrow && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                에스크로 보호
              </span>
            )}
          </div>

          {/* 거래 정보 */}
          <div className="rounded-2xl bg-surface-container-low p-4 space-y-3">
            {[
              { label: "거래 번호",  value: `#${deal.id}` },
              { label: "거래 금액",  value: fmtAmount(deal.amount) },
              { label: "판매자",     value: deal.sellerName },
              { label: "구매자",     value: deal.buyerName },
              { label: "거래 요청일", value: fmtDate(deal.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">{label}</span>
                <span className="font-semibold text-on-surface">{value}</span>
              </div>
            ))}
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2 pt-1">
            {deal.status === "DISPUTED" && (
              <button className="flex-1 py-2.5 bg-red-50 border border-red-200 text-red-600 font-semibold text-sm rounded-xl hover:bg-red-100 transition-all">
                분쟁 해결 처리
              </button>
            )}
            {(deal.status === "IN_PROGRESS" || deal.status === "PENDING") && (
              <button className="flex-1 py-2.5 border border-outline-variant/40 text-on-surface-variant font-semibold text-sm rounded-xl hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all">
                강제 취소
              </button>
            )}
            <button onClick={onClose}
              className="flex-1 py-2.5 bg-primary text-on-primary font-semibold text-sm rounded-xl hover:bg-primary/90 transition-all">
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminTradeManagementPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [page, setPage] = useState(0);
  const [selectedDeal, setSelectedDeal] = useState(null);

  const filtered = useMemo(() => {
    return DEMO_DEALS.filter((d) => {
      const matchTab = activeTab === "ALL" || d.status === activeTab;
      const q = search.trim().toLowerCase();
      const matchSearch = !q || d.ticketTitle.toLowerCase().includes(q)
        || d.sellerName.includes(q) || d.buyerName.includes(q) || d.id.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [search, activeTab]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(0);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const stats = {
    total: DEMO_DEALS.length,
    inProgress: DEMO_DEALS.filter((d) => d.status === "IN_PROGRESS" || d.status === "PENDING").length,
    completed: DEMO_DEALS.filter((d) => d.status === "COMPLETED").length,
    disputed: DEMO_DEALS.filter((d) => d.status === "DISPUTED" || d.status === "CANCELLED").length,
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* 제목 */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-on-surface">거래 관리</h1>
          <p className="text-sm text-on-surface-variant mt-1">플랫폼 내 모든 거래를 조회하고 관리합니다.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "전체 거래",    value: stats.total,      icon: "receipt_long",  color: "text-primary", bg: "bg-primary/10" },
            { label: "진행중",       value: stats.inProgress, icon: "sync",          color: "text-amber-600", bg: "bg-amber-100" },
            { label: "완료",         value: stats.completed,  icon: "check_circle",  color: "text-green-600", bg: "bg-green-100" },
            { label: "분쟁·취소",   value: stats.disputed,   icon: "flag",          color: "text-red-500",   bg: "bg-red-100" },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="rounded-2xl border border-outline-variant/30 bg-white p-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <span className={`material-symbols-outlined text-xl ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              </div>
              <p className="text-2xl font-display font-bold text-on-surface">{value.toLocaleString()}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* 검색 + 필터 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-4 mb-4">
          {/* 검색 */}
          <div className="relative mb-4">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-lg text-on-surface-variant">search</span>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="거래 ID, 티켓명, 판매자, 구매자 검색..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>

          {/* 탭 필터 */}
          <div className="flex gap-1 p-1 bg-surface-container rounded-xl w-fit">
            {FILTER_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === key ? "bg-white text-on-surface shadow-sm" : "text-on-surface-variant"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 테이블 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white overflow-hidden">
          {/* 헤더 */}
          <div className="hidden md:grid grid-cols-[90px_1fr_180px_120px_80px_100px] gap-3 px-5 py-3 bg-surface-container-low border-b border-outline-variant/20 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
            <span>거래 ID</span>
            <span>티켓</span>
            <span>판매자 / 구매자</span>
            <span>금액</span>
            <span>상태</span>
            <span className="text-right">상세</span>
          </div>

          {paged.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-secondary">receipt_long</span>
              </div>
              <p className="text-on-surface-variant text-sm">검색 결과가 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {paged.map((deal) => {
                const cfg = STATUS_CONFIG[deal.status] ?? STATUS_CONFIG.PENDING;
                return (
                  <div key={deal.id}
                    className="grid grid-cols-1 md:grid-cols-[90px_1fr_180px_120px_80px_100px] gap-3 px-5 py-4 hover:bg-surface-container-low/30 transition-colors items-center">
                    {/* 거래 ID */}
                    <span className="font-mono text-xs text-on-surface-variant">#{deal.id}</span>

                    {/* 티켓 정보 */}
                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{deal.ticketTitle}</p>
                      {deal.escrow && (
                        <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary">
                          <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                          에스크로 보호
                        </span>
                      )}
                      <p className="text-xs text-on-surface-variant md:hidden">
                        {deal.sellerName} → {deal.buyerName} | {fmtAmount(deal.amount)}
                      </p>
                    </div>

                    {/* 판매자/구매자 */}
                    <div className="hidden md:flex flex-col gap-1 text-sm">
                      <span className="flex items-center gap-1.5 text-on-surface">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">sell</span>
                        {deal.sellerName}
                      </span>
                      <span className="flex items-center gap-1.5 text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">shopping_cart</span>
                        {deal.buyerName}
                      </span>
                    </div>

                    {/* 금액 */}
                    <p className="hidden md:block text-sm font-semibold text-on-surface">
                      {fmtAmount(deal.amount)}
                    </p>

                    {/* 상태 */}
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.fg}`}>
                        <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                        {cfg.label}
                      </span>
                    </div>

                    {/* 상세보기 */}
                    <div className="md:text-right">
                      <button
                        onClick={() => setSelectedDeal(deal)}
                        className="text-xs font-semibold text-primary hover:text-primary/70 transition-colors"
                      >
                        상세보기
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 px-5 py-4 border-t border-outline-variant/20">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container disabled:opacity-30 transition-all"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                    page === i
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container disabled:opacity-30 transition-all"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 상세 모달 */}
      <DetailModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} />
    </AdminLayout>
  );
}
