import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { activityService } from "../../api/services/activityService";
import apiClient from "../../api/client";
import { ENDPOINTS } from "../../api/endpoints";

const TABS = [
  { value: "SALE", label: "판매내역", statKey: "saleCount" },
  { value: "PURCHASE", label: "구매내역", statKey: "purchaseCount" },
];

const STATUS = {
  SALE: { label: "판매중", icon: "sell", cls: "bg-primary/10 text-primary", line: "" },
  PURCHASE: { label: "거래중", icon: "sync", cls: "bg-primary text-white", line: "border-l-4 border-l-primary" },
  REVIEW: { label: "거래완료", icon: "check_circle", cls: "bg-emerald-100 text-emerald-700", line: "" },
  LIKE: { label: "찜", icon: "favorite", cls: "bg-rose-100 text-rose-600", line: "" },
};

const FALLBACK_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAAkKdNBw9FELeIr-nFzV6beH1u8y4bZBf04tAGbY3HZQYRd07mCHzATCqJit5t8ZWfnc5XJyR2fAyYJIOTXIRA9jpxA4rbFUuNhvLIN4u1l5D-ZdvLipmsdRTTdc7MtnPQx4pVpzN6VbejdbfpC033xcGbo66uhktmZxXjFDJhnd1oOjImyoJXeY1E_6o3oorndEg1vK-necJ48hV8VmKmNpytSCqkscdIUHyqEqiXHoWnqXvEhJRVHSTsB_80MZakCqaYDOqwznc",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCCaD1LOyLNT-D6JcRFv82SDTGmOmFC9XHwdMzbDL4cYydfJ2VDbas-mZ2ZesYMh0VlD7bIloJlXz_Y5xp7qwFhPO2wvMszcV7C4F3A6DgEmbOiNC976apNkHxDisFaiJtyDtl4LP5YYY2zAQt3OKUKkehdb8i7MbWh10132PqkmEMuetflbHEYuQYmnQqyCONkqMA6Iz0MCKW_mbxk2W0Se2XzCN28LnS8IsqjeDLuf2zCsSDN53lBgR3lyOXU9sTIFJZIV3L50qs",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDL8jHCKJVopJLt7xZykWrJr2id1SHA8x1J89NHzGLjou8PFXQCTK1McqHB1Z4s8UErA2hvkatLPUV9oL2fhEuKoDooxd9Ejx29jO3HM6T9hhze0REql7exMbZHblaG1LEXTMUFE7kEBDbqgn1mw3E7WGfbrBOee5Hy6mRPPsCxjTIk6HCkJitv21s5SxsUSR29qKqIgLpUaHt4G8rgPz9LO7IQfRtmyOC2GWua3NzuwEzmNTB-UgSfmrkfbbUlu59Fd8g-05DiGaY",
];

const fmtDate = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
};

const ActivityPage = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState("SALE");
  const [ticketInfoMap, setTicketInfoMap] = useState({});

  const totalRevenue = useMemo(() => {
    const count = stats?.saleCount || activities.filter((item) => item.activityType === "SALE").length;
    return Math.max(count, 1) * 150000;
  }, [activities, stats]);

  useEffect(() => {
    const fetchTicketInfo = async (ticketActivities) => {
      const ids = ticketActivities.map((a) => a.relatedUserId).filter((id) => id && !ticketInfoMap[id]);
      if (ids.length === 0) return;
      const nextMap = { ...ticketInfoMap };
      for (const id of ids) {
        try {
          const res = await apiClient.get(ENDPOINTS.TICKETS.DETAIL(id));
          if (res.data) nextMap[id] = res.data;
        } catch {}
      }
      setTicketInfoMap(nextMap);
    };

    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await activityService.getMyActivities({ page: 0, size: 20, type: selectedType });
        if (response.success) {
          const data = response.data.content || [];
          setActivities(data);
          fetchTicketInfo(data.filter((a) => a.relatedUserId));
        }
      } catch (err) {
        setError(err.response?.data?.error || "활동 내역을 불러오는데 실패했습니다");
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await activityService.getActivityStats();
        if (response.success) setStats(response.data);
      } catch {}
    };

    fetchActivities();
    fetchStats();
  }, [selectedType]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleActivities = activities.length > 0 ? activities : [
    { activityId: "sample-1", activityType: "REVIEW", createdAt: "2024-12-15", relatedUserId: "sample-1", comment: "2024 월드 케이팝 페스티벌", price: 155000 },
    { activityId: "sample-2", activityType: "PURCHASE", createdAt: "2024-12-10", relatedUserId: "sample-2", comment: "뮤지컬 시카고", price: 145000 },
    { activityId: "sample-3", activityType: "SALE", createdAt: "2024-11-20", relatedUserId: "sample-3", comment: "팬미팅 스탠딩석", price: 98000 },
  ];

  return (
    <div className="min-h-screen bg-background text-on-background font-body pb-24 md:rounded-2xl md:overflow-hidden">
      <header className="fixed md:sticky top-0 w-full md:w-auto z-50 flex items-center px-4 h-16 bg-surface">
        <button onClick={() => navigate("/mypage/profile")} className="material-symbols-outlined text-on-surface-variant active:scale-95 transition-transform">
          arrow_back
        </button>
        <h1 className="font-headline font-bold text-lg text-on-surface ml-4">활동 내역</h1>
      </header>

      <main className="pt-20 md:pt-4 px-4 max-w-2xl mx-auto">
        <div className="relative overflow-hidden rounded-xl bg-primary p-6 text-on-primary shadow-lg mb-8">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-primary-container/20 rounded-full blur-xl" />
          <div className="relative z-10">
            <span className="font-label text-sm opacity-80">총 수익</span>
            <div className="flex items-end mt-1 gap-1">
              <span className="text-3xl font-extrabold tracking-tight">{totalRevenue.toLocaleString()}</span>
              <span className="text-xl font-bold mb-1">원</span>
            </div>
            <div className="mt-4 flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full border border-white/20">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="text-xs font-medium">안전거래 보호 중</span>
            </div>
          </div>
        </div>

        <nav className="flex border-b border-surface-variant mb-6 sticky top-16 bg-background z-40">
          {TABS.map((tab) => {
            const active = selectedType === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedType(tab.value)}
                className={`flex-1 py-4 text-center relative ${active ? "font-bold text-primary after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[3px] after:bg-primary after:rounded-full" : "font-medium text-on-surface-variant"}`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {error && <div className="mb-4 rounded-xl bg-error-container/40 px-4 py-3 text-sm text-error">{error}</div>}

        <div className="space-y-6 relative">
          <div className="absolute left-6 top-2 bottom-0 w-px bg-outline-variant/30 hidden sm:block" />
          {loading ? (
            <div className="py-16 text-center text-sm text-on-surface-variant">활동 내역을 불러오는 중...</div>
          ) : visibleActivities.map((activity, index) => {
            const info = STATUS[activity.activityType] || STATUS.SALE;
            const ticket = ticketInfoMap[activity.relatedUserId];
            const title = ticket?.eventName || activity.comment || "PASSIT 안전거래 티켓";
            const price = ticket?.sellingPrice || activity.price || 150000;
            const cancelled = activity.activityType === "CANCEL";
            return (
              <div key={activity.activityId} className="relative flex gap-4 items-start">
                <div className="hidden sm:flex z-10 w-12 h-12 rounded-full bg-primary-container text-on-primary-container items-center justify-center border-4 border-background shrink-0">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{info.icon}</span>
                </div>
                <div className={`flex-1 bg-white/80 backdrop-blur border border-white/30 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${info.line} ${cancelled ? "opacity-70 grayscale-[0.5]" : ""}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${info.cls}`}>{info.label}</span>
                    <span className="text-xs text-on-surface-variant font-label">{fmtDate(activity.createdAt)}</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                      <img alt="" className="w-full h-full object-cover" src={ticket?.image1 || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]} />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <h3 className="font-bold text-on-surface leading-tight mb-1 line-clamp-2">{title}</h3>
                      <p className="text-primary font-extrabold text-lg">{Number(price).toLocaleString()}원</p>
                      {activity.activityType === "PURCHASE" && (
                        <div className="mt-2 flex items-center text-[10px] text-on-surface-variant font-medium">
                          <span className="material-symbols-outlined text-[12px] mr-1">local_shipping</span>
                          배송 대기 중
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ActivityPage;
