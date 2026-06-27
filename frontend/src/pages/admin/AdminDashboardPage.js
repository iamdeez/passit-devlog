import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import supabase from "../../config/supabaseClient";

const relativeTime = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
};

const TARGET_LABEL = { TICKET: "티켓", USER: "회원", TRADE: "거래" };

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-outline-variant/20 rounded-lg ${className}`} />
);

const StatCard = ({ label, value, sub, icon, color, urgent, onClick, loading }) => (
  <button onClick={onClick}
    className="w-full text-left rounded-2xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md border-outline-variant/30"
    style={urgent && value > 0 ? { borderColor: color + "4d", background: color + "08" } : {}}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">{label}</p>
        {loading ? <Skeleton className="h-9 w-14 mb-1" /> : (
          <p className="text-3xl font-black leading-none mb-1 text-on-surface"
            style={urgent && value > 0 ? { color } : {}}>
            {value?.toLocaleString() ?? "—"}
          </p>
        )}
        {sub && !loading && <p className="text-xs text-on-surface-variant">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}
        style={{ background: color + "18", color }}>
        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
    </div>
    {urgent && value > 0 && (
      <div className="mt-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
        <span className="text-xs font-medium" style={{ color }}>즉시 처리 필요</span>
      </div>
    )}
  </button>
);

const SectionHeader = ({ title, badge, badgeColor, onLink }) => (
  <div className="px-5 py-3 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="font-bold text-sm text-on-surface">{title}</span>
      {badge > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: badgeColor + "18", color: badgeColor }}>
          {badge}
        </span>
      )}
    </div>
    {onLink && (
      <button onClick={onLink} className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-on-surface transition-colors">
        전체보기
        <span className="material-symbols-outlined text-sm">chevron_right</span>
      </button>
    )}
  </div>
);

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingInquiries, setPendingInquiries] = useState([]);
  const [pendingReports, setPendingReports] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const [
        users, todayUsers, tickets, availTickets,
        pendingInqCount, pendingRepCount,
        inqList, repList, ticketList, userList,
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("tickets").select("*", { count: "exact", head: true }),
        supabase.from("tickets").select("*", { count: "exact", head: true }).eq("ticket_status", "AVAILABLE"),
        supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "PENDING"),
        supabase.from("inquiries").select("id, title, created_at, user:profiles!user_id(nickname, email)")
          .eq("status", "PENDING").order("created_at", { ascending: false }).limit(5),
        supabase.from("reports").select("id, target_type, reason, created_at, reporter:profiles!user_id(nickname)")
          .eq("status", "PENDING").order("created_at", { ascending: false }).limit(5),
        supabase.from("tickets").select("ticket_id, event_name, selling_price, ticket_status, created_at, image1, category:categories(name)")
          .order("created_at", { ascending: false }).limit(5),
        supabase.from("profiles").select("id, nickname, email, created_at")
          .order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        totalUsers: users.count ?? 0, todayUsers: todayUsers.count ?? 0,
        totalTickets: tickets.count ?? 0, availTickets: availTickets.count ?? 0,
        pendingInquiries: pendingInqCount.count ?? 0, pendingReports: pendingRepCount.count ?? 0,
      });
      setPendingInquiries(inqList.data ?? []);
      setPendingReports(repList.data ?? []);
      setRecentTickets(ticketList.data ?? []);
      setRecentUsers(userList.data ?? []);
      setLastUpdated(new Date());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const ticketStatusCls = (s) => ({
    AVAILABLE: "bg-green-100 text-green-700",
    RESERVED: "bg-amber-100 text-amber-700",
    SOLD: "bg-primary/10 text-primary",
    CLOSED: "bg-surface-container text-on-surface-variant",
  }[s] ?? "bg-surface-container text-on-surface-variant");

  const ticketStatusLabel = (s) => ({ AVAILABLE: "판매중", RESERVED: "예약중", SOLD: "판매완료", CLOSED: "마감" }[s] ?? s);

  const STAT_CARDS = [
    { label: "전체 회원", value: stats?.totalUsers, sub: `오늘 +${stats?.todayUsers ?? 0}명`, icon: "group", color: "#6366f1", path: "/admin/users" },
    { label: "전체 티켓", value: stats?.totalTickets, sub: `판매중 ${stats?.availTickets ?? 0}건`, icon: "confirmation_number", color: "#0ea5e9", path: "/admin/tickets" },
    { label: "미답변 문의", value: stats?.pendingInquiries, sub: "답변 대기 중", icon: "support_agent", color: "#f59e0b", path: "/admin/inquiries", urgent: true },
    { label: "접수 신고", value: stats?.pendingReports, sub: "검토 필요", icon: "flag", color: "#ef4444", path: "/admin/reports", urgent: true },
    { label: "오늘 신규 가입", value: stats?.todayUsers, sub: "신규 회원", icon: "person_add", color: "#10b981", path: "/admin/users" },
  ];

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">

        {/* 헤더 */}
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/70 text-on-primary p-6 mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-semibold opacity-80 mb-1">PASSIT 관리자 대시보드</p>
            <h1 className="text-2xl font-display font-extrabold mb-0.5">관리자님, 반갑습니다 👋</h1>
            <p className="text-sm opacity-75">오늘의 현황을 확인하세요</p>
            {lastUpdated && (
              <p className="text-xs opacity-60 mt-2">마지막 업데이트: {lastUpdated.toLocaleTimeString("ko-KR")}</p>
            )}
          </div>
          <button onClick={fetchAll} disabled={loading}
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-on-primary text-xs font-semibold transition-all disabled:opacity-50">
            <span className={`material-symbols-outlined text-sm ${loading ? "animate-spin" : ""}`}>refresh</span>
            새로고침
          </button>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[120px] opacity-10 select-none" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
        </div>

        {/* 퀵 메뉴 */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "회원 관리", icon: "group",                path: "/admin/users",    color: "#6366f1" },
            { label: "티켓 관리", icon: "confirmation_number",  path: "/admin/tickets",  color: "#0ea5e9" },
            { label: "거래 관리", icon: "swap_horiz",           path: "/admin/trades",   color: "#10b981" },
            { label: "신고 관리", icon: "gavel",                path: "/admin/reports",  color: "#ef4444" },
          ].map(({ label, icon, path, color }) => (
            <button key={label} onClick={() => navigate(path)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-outline-variant/30 bg-white hover:shadow-sm hover:-translate-y-0.5 transition-all">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: color + "18", color }}>
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              </div>
              <span className="text-xs font-semibold text-on-surface text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {STAT_CARDS.map((c) => (
            <StatCard key={c.label} {...c} loading={loading} onClick={() => navigate(c.path)} />
          ))}
        </div>

        {/* 고객 지원 현황 */}
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">고객 지원 현황</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* 미답변 문의 */}
          <div className="rounded-2xl border border-outline-variant/30 bg-white overflow-hidden">
            <SectionHeader title="미답변 문의" badge={stats?.pendingInquiries} badgeColor="#f59e0b"
              onLink={() => navigate("/admin/inquiries")} />
            {loading ? (
              <div className="p-4 flex flex-col gap-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : pendingInquiries.length === 0 ? (
              <div className="py-10 text-center text-sm text-on-surface-variant">미답변 문의가 없습니다 👍</div>
            ) : pendingInquiries.map((inq, idx) => (
              <div key={inq.id}>
                {idx > 0 && <div className="mx-5 border-t border-outline-variant/20" />}
                <button onClick={() => navigate(`/admin/inquiries/${inq.id}`)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-3 hover:bg-amber-50 transition-colors text-left">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-on-surface truncate">{inq.title}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {inq.user?.nickname ?? "알 수 없음"} · {relativeTime(inq.created_at)}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs px-2.5 py-1 rounded-lg border border-amber-300 text-amber-600 font-semibold hover:bg-amber-100 transition-colors">
                    답변
                  </span>
                </button>
              </div>
            ))}
          </div>

          {/* 접수 신고 */}
          <div className="rounded-2xl border border-outline-variant/30 bg-white overflow-hidden">
            <SectionHeader title="접수 신고" badge={stats?.pendingReports} badgeColor="#ef4444"
              onLink={() => navigate("/admin/reports")} />
            {loading ? (
              <div className="p-4 flex flex-col gap-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : pendingReports.length === 0 ? (
              <div className="py-10 text-center text-sm text-on-surface-variant">처리할 신고가 없습니다 👍</div>
            ) : pendingReports.map((rep, idx) => (
              <div key={rep.id}>
                {idx > 0 && <div className="mx-5 border-t border-outline-variant/20" />}
                <button onClick={() => navigate(`/admin/reports/${rep.id}`)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-3 hover:bg-red-50 transition-colors text-left">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">
                        {TARGET_LABEL[rep.target_type] ?? rep.target_type}
                      </span>
                      <p className="text-sm font-semibold text-on-surface truncate">
                        {rep.reason?.length > 28 ? rep.reason.slice(0, 28) + "…" : rep.reason}
                      </p>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                      {rep.reporter?.nickname ?? "알 수 없음"} · {relativeTime(rep.created_at)}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs px-2.5 py-1 rounded-lg border border-red-300 text-red-600 font-semibold hover:bg-red-100 transition-colors">
                    처리
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 활동 */}
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">최근 활동</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* 최근 티켓 */}
          <div className="rounded-2xl border border-outline-variant/30 bg-white overflow-hidden">
            <SectionHeader title="최근 등록 티켓" onLink={() => navigate("/admin/tickets")} />
            {loading ? (
              <div className="p-4 flex flex-col gap-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : recentTickets.length === 0 ? (
              <div className="py-8 text-center text-sm text-on-surface-variant">티켓이 없습니다</div>
            ) : recentTickets.map((t, idx) => (
              <div key={t.ticket_id}>
                {idx > 0 && <div className="mx-5 border-t border-outline-variant/20" />}
                <div className="flex items-center gap-3 px-5 py-3">
                  {t.image1 ? (
                    <img src={t.image1} alt={t.event_name} className="w-12 h-9 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-9 bg-surface-container rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate">{t.event_name}</p>
                    <p className="text-xs text-on-surface-variant">{t.category?.name ?? "—"} · {Number(t.selling_price).toLocaleString()}원</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${ticketStatusCls(t.ticket_status)}`}>
                      {ticketStatusLabel(t.ticket_status)}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">{relativeTime(t.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 최근 가입 회원 */}
          <div className="rounded-2xl border border-outline-variant/30 bg-white overflow-hidden">
            <SectionHeader title="최근 가입 회원" onLink={() => navigate("/admin/users")} />
            {loading ? (
              <div className="p-4 flex flex-col gap-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : recentUsers.map((u, idx) => (
              <div key={u.id}>
                {idx > 0 && <div className="mx-5 border-t border-outline-variant/20" />}
                <div className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary-dim text-sm font-bold flex-shrink-0">
                    {(u.nickname ?? u.email ?? "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface">{u.nickname ?? "(닉네임 없음)"}</p>
                    <p className="text-xs text-on-surface-variant truncate">{u.email}</p>
                  </div>
                  <span className="text-[10px] text-on-surface-variant flex-shrink-0">{relativeTime(u.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
