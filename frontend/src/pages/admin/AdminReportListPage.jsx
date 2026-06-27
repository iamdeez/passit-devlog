import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { Spinner } from "../../components/common";
import reportService from "../../services/reportService";

const STATUS_MAP = {
  PENDING:   { label: "접수됨",  cls: "bg-amber-100 text-amber-700",  icon: "inbox",        filter: "처리대기" },
  IN_REVIEW: { label: "처리중",  cls: "bg-primary-container text-primary",    icon: "manage_search", filter: "처리대기" },
  RESOLVED:  { label: "완료",    cls: "bg-green-100 text-green-700",  icon: "check_circle",  filter: "처리완료" },
  DISMISSED: { label: "기각",    cls: "bg-surface-container text-on-surface-variant", icon: "cancel", filter: "처리완료" },
};

const TARGET_CONFIG = {
  TICKET: { icon: "confirmation_number", color: "bg-primary-container text-primary",   label: "티켓" },
  USER:   { icon: "person",              color: "bg-purple-100 text-purple-600", label: "회원" },
  TRADE:  { icon: "swap_horiz",          color: "bg-green-100 text-green-600",  label: "거래" },
  CHAT:   { icon: "chat_bubble",         color: "bg-violet-100 text-violet-600", label: "채팅" },
};

const FILTER_TABS = [
  { value: "",          label: "전체" },
  { value: "PENDING",   label: "처리대기" },
  { value: "RESOLVED",  label: "처리완료" },
];

const relativeTime = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR");
};

const AdminReportListPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const load = async () => {
    setLoading(true);
    try {
      const res = await reportService.getAdminReports({ status: statusFilter || undefined });
      setReports(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]); // eslint-disable-line

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((r) => r.status === "PENDING" || r.status === "IN_REVIEW").length,
    resolved: reports.filter((r) => r.status === "RESOLVED" || r.status === "DISMISSED").length,
  }), [reports]);

  const filtered = statusFilter === "PENDING"
    ? reports.filter((r) => r.status === "PENDING" || r.status === "IN_REVIEW")
    : statusFilter === "RESOLVED"
    ? reports.filter((r) => r.status === "RESOLVED" || r.status === "DISMISSED")
    : reports;

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-on-surface">신고 관리</h1>
          <p className="text-sm text-on-surface-variant mt-1">사용자 신고를 검토하고 처리합니다.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "전체 신고",  value: stats.total,    icon: "flag",         color: "text-primary",   bg: "bg-primary/10" },
            { label: "처리 대기",  value: stats.pending,  icon: "pending",      color: "text-amber-600", bg: "bg-amber-100" },
            { label: "처리 완료",  value: stats.resolved, icon: "task_alt",     color: "text-green-600", bg: "bg-green-100" },
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

        {/* 탭 필터 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-4 mb-4">
          <div className="flex gap-1 p-1 bg-surface-container rounded-xl w-fit">
            {FILTER_TABS.map(({ value, label }) => (
              <button key={value}
                onClick={() => { setStatusFilter(value); setPage(0); }}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                  statusFilter === value ? "bg-white text-on-surface shadow-sm" : "text-on-surface-variant"
                }`}>
                {label}
                {value === "PENDING" && stats.pending > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">{stats.pending}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 카드 목록 */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-outline-variant/30">
              <Spinner size="lg" />
            </div>
          ) : paged.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-outline-variant/30">
              <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl text-secondary">flag</span>
              </div>
              <p className="text-sm text-on-surface-variant">신고가 없습니다</p>
            </div>
          ) : paged.map((r) => {
            const id = r.id;
            const statusInfo = STATUS_MAP[r.status] ?? STATUS_MAP.PENDING;
            const targetCfg = TARGET_CONFIG[r.target_type] ?? { icon: "warning", color: "bg-amber-100 text-amber-600", label: r.target_type };

            return (
              <div key={id}
                onClick={() => navigate(`/admin/reports/${id}`)}
                className="rounded-2xl border border-outline-variant/30 bg-white p-5 hover:shadow-sm hover:border-outline-variant/40 transition-all cursor-pointer">
                <div className="flex items-start gap-4">
                  {/* 타입 아이콘 */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${targetCfg.color}`}>
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{targetCfg.icon}</span>
                  </div>

                  {/* 본문 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${targetCfg.color}`}>
                          {targetCfg.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusInfo.cls}`}>
                          <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>{statusInfo.icon}</span>
                          {statusInfo.label}
                        </span>
                      </div>
                      <span className="text-xs text-on-surface-variant flex-shrink-0">{relativeTime(r.created_at)}</span>
                    </div>

                    <p className="text-sm font-semibold text-on-surface mb-2 line-clamp-2">{r.reason}</p>

                    <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">person</span>
                        신고자: {r.profiles?.name ?? r.user_id ?? "-"}
                      </span>
                      {r.reported_user && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">person_off</span>
                          피신고자: {r.reported_user}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 처리 버튼 */}
                  <div className="flex-shrink-0 flex flex-col gap-1.5">
                    {(r.status === "PENDING" || r.status === "IN_REVIEW") && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/reports/${id}`); }}
                        className="px-3 py-1.5 bg-primary text-on-primary text-xs font-semibold rounded-xl hover:bg-primary/90 transition-all">
                        처리하기
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/reports/${id}`); }}
                      className="px-3 py-1.5 border border-outline-variant/40 text-on-surface-variant text-xs font-semibold rounded-xl hover:bg-surface-container transition-all">
                      내역보기
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 페이지네이션 */}
        {filtered.length > rowsPerPage && (
          <div className="flex items-center justify-between mt-4 text-sm text-on-surface-variant">
            <span>{page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, filtered.length)} / {filtered.length}개</span>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-xl border border-outline-variant/30 disabled:opacity-40 hover:bg-white transition-colors text-xs font-semibold">이전</button>
              <button disabled={(page + 1) * rowsPerPage >= filtered.length} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-xl border border-outline-variant/30 disabled:opacity-40 hover:bg-white transition-colors text-xs font-semibold">다음</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReportListPage;
