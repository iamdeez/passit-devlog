import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { Spinner } from "../../components/common";
import { getAdminNotices, deleteAdminNotice } from "../../services/noticeService";

const AdminNoticeListPage = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(15);
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAdminNotices({ page, size: rowsPerPage });
      setNotices(res.content ?? res.data ?? []);
      setTotal(res.totalElements ?? res.total ?? 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]); // eslint-disable-line

  const handleDelete = async (id) => {
    if (!window.confirm("공지사항을 삭제하시겠습니까?")) return;
    await deleteAdminNotice(id);
    load();
  };

  const pinned = notices.filter((n) => n.is_pinned);
  const regular = notices.filter((n) => !n.is_pinned);

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-on-surface">공지사항 관리</h1>
            <p className="text-sm text-on-surface-variant mt-1">공지사항을 등록하고 관리합니다.</p>
          </div>
          <button onClick={() => navigate("/admin/notices/new")}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-sm transition-colors">
            <span className="material-symbols-outlined text-base">add</span>
            공지 작성
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* 고정 공지 섹션 */}
            {pinned.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span>
                  <h2 className="text-sm font-bold text-on-surface">고정 공지</h2>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden">
                  <div className="divide-y divide-primary/10">
                    {pinned.map((n) => (
                      <div key={n.notice_id} className="flex items-center gap-4 px-5 py-4">
                        <span className="material-symbols-outlined text-primary text-sm flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">필독</span>
                            <p className="text-sm font-semibold text-on-surface truncate">{n.title}</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                            <span className="flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-xs">calendar_today</span>
                              {new Date(n.created_at).toLocaleDateString("ko-KR")}
                            </span>
                            {n.view_count != null && (
                              <span className="flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-xs">visibility</span>
                                {n.view_count.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/admin/notices/${n.notice_id}/edit`)}
                            className="p-1.5 rounded-lg hover:bg-white/60 text-on-surface-variant transition-colors">
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button onClick={() => handleDelete(n.notice_id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 전체 공지 */}
            <div className="rounded-2xl border border-outline-variant/30 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-base">article</span>
                  <span className="text-sm font-semibold text-on-surface">전체 공지</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-xs font-semibold text-on-surface-variant">총 {total}건</span>
                </div>
              </div>

              {regular.length === 0 && notices.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-2xl text-secondary">article</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">공지사항이 없습니다</p>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/20">
                  {regular.map((n) => (
                    <div key={n.notice_id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-container-low/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate mb-0.5">{n.title}</p>
                        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                          <span className="flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">calendar_today</span>
                            {new Date(n.created_at).toLocaleDateString("ko-KR")}
                          </span>
                          {n.view_count != null && (
                            <span className="flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-xs">visibility</span>
                              {n.view_count.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                          n.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-surface-container text-on-surface-variant"
                        }`}>
                          {n.status === "PUBLISHED" ? "노출" : "비공개"}
                        </span>
                        <button onClick={() => navigate(`/admin/notices/${n.notice_id}/edit`)}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button onClick={() => handleDelete(n.notice_id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {total > rowsPerPage && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-outline-variant/20 text-sm text-on-surface-variant">
                  <span>{page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, total)} / {total}개</span>
                  <div className="flex gap-1">
                    <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                      className="p-1.5 rounded-xl border border-outline-variant/30 disabled:opacity-40 hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                    <button disabled={(page + 1) * rowsPerPage >= total} onClick={() => setPage(p => p + 1)}
                      className="p-1.5 rounded-xl border border-outline-variant/30 disabled:opacity-40 hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNoticeListPage;
