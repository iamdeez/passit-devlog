import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { Spinner } from "../../components/common";
import { getAdminInquiries } from "../../api/services/inquiryService";

const STATUS_MAP = {
  PENDING:  { label: "미답변",   cls: "bg-amber-100 text-amber-700",  icon: "hourglass_empty" },
  ANSWERED: { label: "답변 완료", cls: "bg-green-100 text-green-700",  icon: "check_circle" },
  CLOSED:   { label: "종료",     cls: "bg-surface-container text-on-surface-variant", icon: "block" },
};

const CATEGORY_COLORS = {
  결제: "bg-primary-container text-primary",
  계정: "bg-purple-100 text-purple-700",
  티켓: "bg-green-100 text-green-700",
  기타: "bg-surface-container text-on-surface-variant",
};

const FILTER_TABS = [
  { value: "",         label: "전체" },
  { value: "PENDING",  label: "미답변" },
  { value: "ANSWERED", label: "답변 완료" },
];

const AdminInquiryListPage = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 15;

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAdminInquiries({ status: statusFilter || undefined });
      setInquiries(Array.isArray(data) ? data : (data?.data ?? []));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]); // eslint-disable-line

  const stats = useMemo(() => ({
    total: inquiries.length,
    pending: inquiries.filter((i) => !i.answer_content).length,
  }), [inquiries]);

  const paged = inquiries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-on-surface">문의 관리</h1>
          <p className="text-sm text-on-surface-variant mt-1">사용자 문의를 확인하고 답변합니다.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-outline-variant/30 bg-white p-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
            </div>
            <p className="text-2xl font-display font-bold text-on-surface">{stats.total.toLocaleString()}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">전체 문의</p>
          </div>
          <div className="rounded-2xl border border-outline-variant/30 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>hourglass_empty</span>
              </div>
              {stats.pending > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">URGENT</span>
              )}
            </div>
            <p className="text-2xl font-display font-bold text-on-surface">{stats.pending.toLocaleString()}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">미답변 문의</p>
          </div>
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

        {/* 목록 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white overflow-hidden">
          {/* 테이블 헤더 */}
          <div className="hidden md:grid grid-cols-[60px_1fr_120px_100px_110px_90px] gap-3 px-5 py-3 bg-surface-container-low border-b border-outline-variant/20 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
            <span>카테고리</span>
            <span>제목</span>
            <span>작성자</span>
            <span>상태</span>
            <span>등록일</span>
            <span className="text-right">답변</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
          ) : paged.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl text-secondary">inbox</span>
              </div>
              <p className="text-sm text-on-surface-variant">문의가 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {paged.map((inq) => {
                const id = inq.id;
                const status = inq.answer_content ? "ANSWERED" : "PENDING";
                const statusInfo = STATUS_MAP[status] ?? STATUS_MAP.PENDING;
                const category = inq.category ?? "기타";
                const catCls = CATEGORY_COLORS[category] ?? CATEGORY_COLORS["기타"];

                return (
                  <div key={id}
                    onClick={() => navigate(`/admin/inquiries/${id}`)}
                    className="grid grid-cols-1 md:grid-cols-[60px_1fr_120px_100px_110px_90px] gap-3 px-5 py-4 hover:bg-surface-container-low/30 transition-colors cursor-pointer items-center">
                    {/* 카테고리 */}
                    <div>
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${catCls}`}>[{category}]</span>
                    </div>
                    {/* 제목 */}
                    <p className="font-semibold text-sm text-on-surface truncate">{inq.title}</p>
                    {/* 작성자 */}
                    <p className="text-sm text-on-surface-variant truncate">{inq.user?.nickname ?? inq.user_id ?? "-"}</p>
                    {/* 상태 */}
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.cls}`}>
                        <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>{statusInfo.icon}</span>
                        {statusInfo.label}
                      </span>
                    </div>
                    {/* 등록일 */}
                    <p className="text-xs text-on-surface-variant">{new Date(inq.created_at).toLocaleDateString("ko-KR")}</p>
                    {/* 답변 버튼 */}
                    <div className="md:text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/inquiries/${id}`); }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/70 transition-colors">
                        <span className="material-symbols-outlined text-sm">edit_note</span>
                        답변하기
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {inquiries.length > rowsPerPage && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-outline-variant/20 text-sm text-on-surface-variant">
              <span>{page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, inquiries.length)} / {inquiries.length}개</span>
              <div className="flex gap-1">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 rounded-xl border border-outline-variant/30 disabled:opacity-40 hover:bg-surface-container transition-colors text-xs font-semibold">이전</button>
                <button disabled={(page + 1) * rowsPerPage >= inquiries.length} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 rounded-xl border border-outline-variant/30 disabled:opacity-40 hover:bg-surface-container transition-colors text-xs font-semibold">다음</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInquiryListPage;
