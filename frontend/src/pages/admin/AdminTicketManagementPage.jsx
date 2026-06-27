import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { Spinner } from "../../components/common";
import supabase from "../../config/supabaseClient";

const STATUS_MAP = {
  AVAILABLE: { label: "판매 중",   cls: "bg-green-100 text-green-700",   icon: "sell" },
  RESERVED:  { label: "예약됨",   cls: "bg-amber-100 text-amber-700",   icon: "schedule" },
  SOLD:      { label: "판매 완료", cls: "bg-surface-container text-on-surface-variant", icon: "check_circle" },
  CLOSED:    { label: "마감",     cls: "bg-red-100 text-red-600",        icon: "block" },
};

const FILTER_TABS = [
  { value: "",           label: "전체" },
  { value: "AVAILABLE",  label: "판매중" },
  { value: "RESERVED",   label: "예약중" },
  { value: "SOLD",       label: "완료" },
  { value: "CLOSED",     label: "마감" },
];

const AdminTicketManagementPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 15;
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);

  const fetchStats = useCallback(async () => {
    const [all, available, reserved, sold] = await Promise.all([
      supabase.from("tickets").select("*", { count: "exact", head: true }),
      supabase.from("tickets").select("*", { count: "exact", head: true }).eq("ticket_status", "AVAILABLE"),
      supabase.from("tickets").select("*", { count: "exact", head: true }).eq("ticket_status", "RESERVED"),
      supabase.from("tickets").select("*", { count: "exact", head: true }).eq("ticket_status", "SOLD"),
    ]);
    setStats({
      total: all.count ?? 0,
      available: available.count ?? 0,
      reserved: reserved.count ?? 0,
      sold: sold.count ?? 0,
    });
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("tickets")
      .select(
        "ticket_id, event_name, event_date, ticket_status, selling_price, created_at, image1, owner:profiles!owner_id(nickname, email), category:categories(name)",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(page * rowsPerPage, page * rowsPerPage + rowsPerPage - 1);

    if (statusFilter) query = query.eq("ticket_status", statusFilter);
    if (keyword) query = query.ilike("event_name", `%${keyword}%`);

    const { data, error, count } = await query;
    if (!error) { setTickets(data ?? []); setTotal(count ?? 0); }
    setLoading(false);
  }, [page, statusFilter, keyword]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchTickets(); }, [page, statusFilter]); // eslint-disable-line

  const handleSearch = () => { setPage(0); fetchTickets(); };

  const handleDelete = async (ticketId) => {
    if (!window.confirm("이 티켓을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("tickets").delete().eq("ticket_id", ticketId);
    if (!error) { fetchTickets(); fetchStats(); }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-on-surface">티켓 관리</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            전체 티켓 목록을 조회하고 관리합니다.
            {stats && <span className="ml-1.5 text-primary font-semibold">({stats.total.toLocaleString()}개)</span>}
          </p>
        </div>

        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "전체 티켓", value: stats.total,     icon: "confirmation_number", color: "text-primary",    bg: "bg-primary/10" },
              { label: "판매 중",   value: stats.available,  icon: "sell",                color: "text-green-600",  bg: "bg-green-100" },
              { label: "거래 중",   value: stats.reserved,   icon: "schedule",            color: "text-amber-600",  bg: "bg-amber-100" },
              { label: "판매 완료", value: stats.sold,        icon: "check_circle",        color: "text-gray-500",   bg: "bg-surface-container" },
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
        )}

        {/* 검색 + 탭 필터 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-4 mb-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">search</span>
              <input
                type="text"
                placeholder="공연명 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant/30 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <button onClick={handleSearch}
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-sm transition-colors">
              검색
            </button>
          </div>

          {/* 상태 탭 */}
          <div className="flex gap-1 p-1 bg-surface-container rounded-xl w-fit">
            {FILTER_TABS.map(({ value, label }) => (
              <button key={value}
                onClick={() => { setStatusFilter(value); setPage(0); }}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                  statusFilter === value ? "bg-white text-on-surface shadow-sm" : "text-on-surface-variant"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 테이블 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/20">
                    {["공연", "카테고리", "판매자", "공연일", "가격", "상태", "관리"].map((h, i) => (
                      <th key={h} className={`py-3 px-4 text-on-surface-variant font-semibold text-xs uppercase tracking-wide ${i === 6 ? "text-center" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {tickets.length === 0 ? (
                    <tr><td colSpan={7} className="py-16 text-center">
                      <div className="inline-flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl text-secondary">confirmation_number</span>
                        </div>
                        <p className="text-sm text-on-surface-variant">티켓이 없습니다</p>
                      </div>
                    </td></tr>
                  ) : tickets.map((t) => {
                    const st = STATUS_MAP[t.ticket_status] ?? { label: t.ticket_status, cls: "bg-surface-container text-on-surface-variant", icon: "help" };
                    return (
                      <tr key={t.ticket_id} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {t.image1 ? (
                              <img src={t.image1} alt={t.event_name} className="w-12 h-9 object-cover rounded-lg flex-shrink-0" />
                            ) : (
                              <div className="w-12 h-9 bg-surface-container rounded-lg flex-shrink-0" />
                            )}
                            <span className="font-medium text-on-surface max-w-[200px] truncate">{t.event_name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant text-xs">{t.category?.name ?? "-"}</td>
                        <td className="py-3 px-4">
                          <p className="text-sm text-on-surface">{t.owner?.nickname ?? "-"}</p>
                          <p className="text-xs text-on-surface-variant">{t.owner?.email}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-on-surface-variant">
                          {t.event_date ? new Date(t.event_date).toLocaleDateString("ko-KR") : "-"}
                        </td>
                        <td className="py-3 px-4 font-semibold text-sm text-on-surface">{Number(t.selling_price).toLocaleString()}원</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.cls}`}>
                            <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>{st.icon}</span>
                            {st.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => handleDelete(t.ticket_id)}
                            className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors">
                            삭제
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/20 text-sm text-on-surface-variant">
              <span>{page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, total)} / {total}개</span>
              <div className="flex gap-1">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 rounded-xl border border-outline-variant/30 disabled:opacity-40 hover:bg-surface-container transition-colors text-xs font-semibold">이전</button>
                <button disabled={(page + 1) * rowsPerPage >= total} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-xl border border-outline-variant/30 disabled:opacity-40 hover:bg-surface-container transition-colors text-xs font-semibold">다음</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTicketManagementPage;
