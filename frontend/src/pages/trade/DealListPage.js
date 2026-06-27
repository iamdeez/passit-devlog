import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../components/common";
import useTrade from "../../hooks/useTrade";
import { useAuth } from "../../contexts/AuthContext";

const STATUS_MAP = {
  REQUESTED: { label: "에스크로 보호 중", icon: "verified_user", cls: "bg-primary-container text-on-primary-container", muted: false },
  ACCEPTED: { label: "에스크로 보호 중", icon: "verified_user", cls: "bg-primary-container text-on-primary-container", muted: false },
  PAID: { label: "에스크로 보호 중", icon: "verified_user", cls: "bg-primary-container text-on-primary-container", muted: false },
  COMPLETED: { label: "거래 완료", icon: null, cls: "bg-surface-variant text-on-surface-variant", muted: true },
  CONFIRMED: { label: "거래 완료", icon: null, cls: "bg-surface-variant text-on-surface-variant", muted: true },
  CANCELLED: { label: "거래 취소", icon: null, cls: "bg-error-container/20 text-error", muted: true },
  REJECTED: { label: "거래 취소", icon: null, cls: "bg-error-container/20 text-error", muted: true },
};

function DealCard({ deal, isBuyer, onClick }) {
  const status = STATUS_MAP[deal.status] || STATUS_MAP.REQUESTED;
  const image = deal.ticketImage || deal.image1 || deal.ticket?.image1;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-surface-container-lowest border border-outline-variant/40 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group ${
        status.muted ? "opacity-80" : ""
      }`}
    >
      <div className="p-4 flex gap-4">
        <div className={`w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-surface-variant ${status.muted ? "grayscale" : ""}`}>
          {image ? (
            <img alt={deal.ticketTitle || "티켓"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={image} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-outline">confirmation_number</span>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
          <div>
            <h3 className={`font-bold leading-tight text-lg line-clamp-2 ${status.muted ? "text-on-surface-variant" : "text-on-surface"}`}>
              {deal.ticketTitle || "티켓 정보 없음"}
            </h3>
            <p className="text-on-surface-variant text-sm mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">person</span>
              {isBuyer ? deal.sellerName : deal.buyerName}
            </p>
          </div>
          <div className="flex items-end justify-between">
            <span className={`font-headline font-extrabold text-xl ${status.muted ? "text-on-surface-variant" : "text-primary"}`}>
              {deal.price?.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 flex items-center justify-between border-t border-outline-variant/20 pt-4 mt-1">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.cls}`}>
          {status.icon && (
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              {status.icon}
            </span>
          )}
          {status.label}
        </span>
        {deal.status !== "CANCELLED" && deal.status !== "REJECTED" && (
          <span className={`flex items-center gap-1 font-bold text-sm px-4 py-2 rounded-lg transition-all ${
            status.muted
              ? "text-on-surface-variant bg-surface-variant/30"
              : "text-primary bg-primary/5"
          }`}>
            <span className="material-symbols-outlined text-lg">chat_bubble</span>
            {status.muted ? "대화 내역" : "채팅하기"}
          </span>
        )}
      </div>
    </button>
  );
}

const DealListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [activeFilter, setActiveFilter] = useState("전체");
  const { deals, loading, error, fetchPurchaseHistory, fetchSalesHistory } = useTrade();

  useEffect(() => {
    if (activeTab === 0) fetchPurchaseHistory();
    else fetchSalesHistory();
  }, [activeTab, fetchPurchaseHistory, fetchSalesHistory]);

  if (loading && deals.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24">
      <header className="bg-surface border-b border-outline-variant sticky top-0 z-50 flex items-center justify-between px-4 py-2 w-full h-14">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-surface-container transition-colors active:scale-95 duration-100 rounded-full"
            aria-label="뒤로가기"
          >
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <h1 className="font-headline text-lg font-bold text-primary">내 거래</h1>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="p-2 hover:bg-surface-container transition-colors rounded-full" aria-label="검색">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
          </button>
          <button type="button" className="p-2 hover:bg-surface-container transition-colors rounded-full" aria-label="더보기">
            <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
          </button>
        </div>
      </header>

      <main className="min-h-screen pb-24">
        <div className="bg-surface sticky top-14 z-40 border-b border-outline-variant/30">
          <div className="flex">
            {["구매", "판매"].map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setActiveTab(index)}
                className={`flex-1 py-4 text-center relative font-bold ${
                  activeTab === index
                    ? "text-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-primary after:rounded-t"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-4 overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar">
          {["전체", "1개월", "3개월", "6개월"].map((filter) => {
            const active = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full font-label text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <div className="px-4 flex flex-col gap-4">
          {error && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

          {deals.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-lowest rounded-xl border border-outline-variant/40">
              <span className="material-symbols-outlined text-5xl text-outline mb-3 block">swap_horiz</span>
              <p className="text-on-surface-variant">{activeTab === 0 ? "구매 내역이 없습니다." : "판매 내역이 없습니다."}</p>
            </div>
          ) : (
            deals.map((deal) => {
              const isBuyer = deal.buyerId === user?.userId;
              return (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  isBuyer={isBuyer}
                  onClick={() => navigate(`/deals/${deal.id}/detail`)}
                />
              );
            })
          )}

          <div className="mt-4 p-4 rounded-xl bg-secondary-container/30 border border-secondary-container flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield_with_heart
            </span>
            <div className="flex-1">
              <h4 className="font-bold text-on-secondary-container text-sm">안전 거래 보호 시스템</h4>
              <p className="text-xs text-on-secondary-container/80 mt-1">
                거래가 완료될 때까지 PASSIT이 결제 대금을 안전하게 보관합니다. 사기 걱정 없이 거래하세요.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DealListPage;
