import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../api/services/adminService";
import AdminLayout from "../../components/admin/AdminLayout";
import { Spinner } from "../../components/common";

const STATUS_CONFIG = {
  ACTIVE:    { label: "활성",   bg: "bg-green-100",  fg: "text-green-700"  },
  SUSPENDED: { label: "정지",   bg: "bg-amber-100",  fg: "text-amber-700"  },
  DELETED:   { label: "탈퇴",   bg: "bg-red-100",    fg: "text-red-600"    },
};

const ROLE_LABEL = { admin: "관리자", ADMIN: "관리자", user: "일반 회원", USER: "일반 회원" };

const Toast = ({ msg, type, onClose }) => (
  msg ? (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold
      ${type === "success" ? "bg-green-50 border-green-300 text-green-800" : "bg-red-50 border-red-300 text-red-800"}`}>
      <span className="material-symbols-outlined text-base">{type === "success" ? "check_circle" : "error"}</span>
      {msg}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  ) : null
);

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: "bg-surface-container", fg: "text-on-surface-variant" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.fg}`}>
      {cfg.label}
    </span>
  );
};

const AdminUserManagementPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 15;
  const [total, setTotal] = useState(0);

  const [drawer, setDrawer] = useState(null);
  const [editData, setEditData] = useState({ nickname: "", name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(null);

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), type === "success" ? 3000 : 5000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.searchUsers({
        keyword: keyword || undefined,
        status: statusFilter || undefined,
        page, size: rowsPerPage,
      });
      if (res.success) {
        setUsers(res.data.content);
        setTotal(res.data.totalElements);
      }
    } catch (err) {
      showToast(err.message || "회원 목록을 불러오는데 실패했습니다", "error");
    } finally { setLoading(false); }
  }, [keyword, statusFilter, page]); // eslint-disable-line

  useEffect(() => { fetchUsers(); }, [page, statusFilter]); // eslint-disable-line

  const openDrawer = (user) => {
    setDrawer(user);
    setEditData({ nickname: user.nickname ?? "", name: user.name ?? "", phone: user.phone ?? "" });
    setConfirming(null);
  };
  const closeDrawer = () => { setDrawer(null); setConfirming(null); };
  const handleSearch = () => { setPage(0); fetchUsers(); };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateUser(drawer.userId, editData);
      showToast("회원 정보가 수정되었습니다");
      closeDrawer(); fetchUsers();
    } catch (err) {
      showToast(err.message || "수정에 실패했습니다", "error");
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (action) => {
    setSaving(true);
    try {
      if (action === "suspend") await adminService.suspendUser(drawer.userId);
      else if (action === "activate") await adminService.activateUser(drawer.userId);
      else if (action === "delete") await adminService.deleteUser(drawer.userId);
      showToast(action === "suspend" ? "정지 처리되었습니다" : action === "activate" ? "활성화되었습니다" : "탈퇴 처리되었습니다");
      closeDrawer(); fetchUsers();
    } catch (err) {
      showToast(err.message || "처리에 실패했습니다", "error");
    } finally { setSaving(false); setConfirming(null); }
  };

  const totalPages = Math.ceil(total / rowsPerPage);
  const rowOffset = page * rowsPerPage;

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-display font-extrabold text-on-surface">회원 관리</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">
              전체 회원 정보를 조회하고 관리합니다.
              {total > 0 && <span className="ml-1.5 text-primary font-semibold">({total.toLocaleString()}명)</span>}
            </p>
          </div>
        </div>

        {/* 검색 + 탭 필터 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-4 mb-4 space-y-3">
          {/* 검색 */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-base text-on-surface-variant pointer-events-none">search</span>
              <input type="text" placeholder="이름, 이메일, 닉네임 검색"
                value={keyword} onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-outline-variant/40 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary bg-surface-container-low transition-all" />
            </div>
            <button onClick={handleSearch}
              className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-sm transition-colors">
              검색
            </button>
          </div>
          {/* 상태 탭 */}
          <div className="flex gap-1 p-1 bg-surface-container rounded-xl w-fit">
            {[{ value: "", label: "전체" }, ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))].map(({ value, label }) => (
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20">
                  {["#", "회원", "역할", "상태", "가입일", ""].map((h, i) => (
                    <th key={i} className={`px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wide ${i === 5 ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <Spinner size="lg" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-on-surface-variant">
                      검색 결과가 없습니다
                    </td>
                  </tr>
                ) : users.map((user, idx) => (
                  <tr key={user.userId} className="border-b border-outline-variant/15 hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3 text-xs text-on-surface-variant w-10">{rowOffset + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high text-primary-dim text-sm font-bold flex items-center justify-center flex-shrink-0">
                          {(user.nickname ?? user.email ?? "?")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-on-surface truncate max-w-[180px]">
                            {user.nickname ?? "(닉네임 없음)"}
                          </p>
                          <p className="text-xs text-on-surface-variant truncate max-w-[180px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${user.role === "admin" || user.role === "ADMIN" ? "text-primary" : "text-on-surface-variant"}`}>
                        {ROLE_LABEL[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">
                      {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => navigate(`/admin/users/${user.userId}`)}
                          className="px-3 py-1.5 rounded-lg bg-primary/5 text-xs text-primary hover:bg-primary/10 transition-all font-medium">
                          상세
                        </button>
                        <button onClick={() => openDrawer(user)}
                          className="px-3 py-1.5 rounded-lg border border-outline-variant/40 text-xs text-on-surface-variant hover:border-primary hover:text-primary hover:bg-surface-container-high transition-all font-medium">
                          수정
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/20">
              <span className="text-xs text-on-surface-variant">
                총 {total.toLocaleString()}명 · {page + 1} / {totalPages} 페이지
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(0)} disabled={page === 0}
                  className="p-1.5 rounded-lg hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">first_page</span>
                </button>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                  className="p-1.5 rounded-lg hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">chevron_left</span>
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all
                        ${p === page ? "bg-primary text-white" : "hover:bg-surface-container text-on-surface-variant"}`}>
                      {p + 1}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">chevron_right</span>
                </button>
                <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">last_page</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 상세/수정 패널 (오버레이) */}
      {drawer && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={closeDrawer} />
          <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl">
            {/* 패널 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20 flex-shrink-0">
              <span className="font-bold text-base text-on-surface">회원 정보</span>
              <button onClick={closeDrawer} className="p-1 rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-lg text-on-surface-variant">close</span>
              </button>
            </div>

            {/* 스크롤 본문 */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* 프로필 */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-surface-container-high text-primary-dim text-xl font-bold flex items-center justify-center flex-shrink-0">
                  {(drawer.nickname ?? drawer.email ?? "?")[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-base text-on-surface">{drawer.nickname ?? "(닉네임 없음)"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={drawer.status} />
                    <span className="text-xs text-on-surface-variant">{ROLE_LABEL[drawer.role] ?? drawer.role}</span>
                  </div>
                </div>
              </div>

              {/* 읽기 전용 정보 */}
              <div className="rounded-xl border border-outline-variant/20 divide-y divide-outline-variant/15 overflow-hidden">
                {[
                  ["이메일", drawer.email],
                  ["가입일", new Date(drawer.createdAt).toLocaleString("ko-KR")],
                  ["최종 수정", new Date(drawer.updatedAt).toLocaleString("ko-KR")],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start gap-4 px-4 py-3">
                    <span className="text-xs font-semibold text-on-surface-variant min-w-[64px] mt-0.5">{label}</span>
                    <span className="text-sm text-on-surface break-all">{value ?? "—"}</span>
                  </div>
                ))}
              </div>

              {/* 정보 수정 */}
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">정보 수정</p>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-on-surface">닉네임</label>
                    <input className="input-base" value={editData.nickname}
                      onChange={(e) => setEditData({ ...editData, nickname: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-on-surface">이름</label>
                    <input className="input-base" value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-on-surface">전화번호</label>
                    <input className="input-base" value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* 계정 상태 관리 */}
              {drawer.status !== "DELETED" && (
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">계정 상태 관리</p>
                  {confirming ? (
                    <div className="p-4 rounded-xl border border-red-200 bg-red-50">
                      <p className="text-sm font-semibold text-red-700 mb-3">
                        {confirming === "suspend" && "이 회원을 정지하시겠습니까?"}
                        {confirming === "delete" && "이 회원을 탈퇴 처리하시겠습니까?"}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => handleStatusChange(confirming)} disabled={saving}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                          {saving ? "처리 중..." : "확인"}
                        </button>
                        <button onClick={() => setConfirming(null)}
                          className="px-4 py-2 text-sm text-on-surface-variant hover:bg-red-100 rounded-lg transition-colors">
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {drawer.status === "ACTIVE" && (
                        <button onClick={() => setConfirming("suspend")}
                          className="px-4 py-2 rounded-lg border border-amber-400 text-amber-600 text-sm font-semibold hover:bg-amber-50 transition-colors">
                          계정 정지
                        </button>
                      )}
                      {drawer.status === "SUSPENDED" && (
                        <button onClick={() => handleStatusChange("activate")} disabled={saving}
                          className="px-4 py-2 rounded-lg border border-green-400 text-green-600 text-sm font-semibold hover:bg-green-50 transition-colors disabled:opacity-50">
                          정지 해제
                        </button>
                      )}
                      <button onClick={() => setConfirming("delete")}
                        className="px-4 py-2 rounded-lg border border-red-400 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
                        탈퇴 처리
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 패널 하단 */}
            <div className="flex gap-3 px-5 py-4 border-t border-outline-variant/20 flex-shrink-0">
              <button onClick={closeDrawer}
                className="flex-1 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface-variant text-sm font-semibold hover:bg-surface-container transition-colors">
                닫기
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-dim text-white text-sm font-semibold transition-colors disabled:opacity-50">
                {saving ? "저장 중..." : "변경사항 저장"}
              </button>
            </div>
          </div>
        </>
      )}

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </AdminLayout>
  );
};

export default AdminUserManagementPage;
