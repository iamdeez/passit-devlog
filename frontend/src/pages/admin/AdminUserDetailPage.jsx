import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { Spinner, Modal } from "../../components/common";
import { adminService } from "../../api/services/adminService";

const STATUS_CONFIG = {
  ACTIVE:    { label: "활성",   bg: "bg-green-100",  fg: "text-green-700",  icon: "check_circle" },
  SUSPENDED: { label: "정지",   bg: "bg-amber-100",  fg: "text-amber-700",  icon: "block" },
  DELETED:   { label: "탈퇴",   bg: "bg-red-100",    fg: "text-red-600",    icon: "delete" },
};

const ROLE_LABEL = { admin: "관리자", ADMIN: "관리자", user: "일반 회원", USER: "일반 회원" };

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) : "-";

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-4 py-3 border-b border-outline-variant/20 last:border-0">
    <span className="w-24 flex-shrink-0 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{label}</span>
    <span className="flex-1 text-sm text-on-surface">{value ?? "-"}</span>
  </div>
);

export default function AdminUserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getUserById(userId);
      setUser(res.data ?? res);
    } catch {
      setError("회원 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleAction = async (action) => {
    setConfirmModal(null);
    setActionLoading(true);
    try {
      if (action === "suspend")   await adminService.suspendUser(userId);
      if (action === "activate")  await adminService.activateUser(userId);
      if (action === "delete") {  await adminService.deleteUser(userId); navigate("/admin/users"); return; }
      showToast(action === "suspend" ? "계정이 정지되었습니다." : "계정이 활성화되었습니다.");
      fetchUser();
    } catch {
      showToast("처리 중 오류가 발생했습니다.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const status = user?.status ?? user?.accountStatus;
  const statusCfg = STATUS_CONFIG[status] ?? { label: status, bg: "bg-surface-container", fg: "text-on-surface-variant", icon: "person" };

  return (
    <AdminLayout>
      {/* 토스트 */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold
          ${toast.type === "success" ? "bg-green-50 border-green-300 text-green-800" : "bg-red-50 border-red-300 text-red-800"}`}>
          <span className="material-symbols-outlined text-base">{toast.type === "success" ? "check_circle" : "error"}</span>
          {toast.msg}
        </div>
      )}

      <div className="p-6">
        <button onClick={() => navigate("/admin/users")}
          className="flex items-center gap-2 text-on-surface-variant text-sm hover:text-on-surface mb-5 transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          회원 목록으로
        </button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-on-surface">회원 상세</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
        ) : user ? (
          <div className="grid md:grid-cols-3 gap-5">
            {/* 프로필 카드 */}
            <div className="md:col-span-1">
              <div className="rounded-2xl border border-outline-variant/30 bg-white p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
                <p className="font-display font-bold text-on-surface text-lg">{user.nickname ?? user.name ?? "사용자"}</p>
                <p className="text-sm text-on-surface-variant mt-0.5 mb-3">{user.email}</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusCfg.bg} ${statusCfg.fg}`}>
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>{statusCfg.icon}</span>
                  {statusCfg.label}
                </span>
                <div className="mt-3">
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant">
                    {ROLE_LABEL[user.role] ?? user.role ?? "일반 회원"}
                  </span>
                </div>
              </div>

              {/* 액션 버튼 */}
              {actionLoading ? (
                <div className="flex justify-center py-4"><Spinner size="sm" /></div>
              ) : (
                <div className="flex flex-col gap-2 mt-4">
                  {status === "ACTIVE" && (
                    <button
                      onClick={() => setConfirmModal("suspend")}
                      className="w-full py-2.5 border border-amber-300 text-amber-700 font-semibold text-sm rounded-xl hover:bg-amber-50 transition-all">
                      계정 정지
                    </button>
                  )}
                  {status === "SUSPENDED" && (
                    <button
                      onClick={() => setConfirmModal("activate")}
                      className="w-full py-2.5 bg-primary text-on-primary font-semibold text-sm rounded-xl hover:bg-primary/90 transition-all">
                      계정 활성화
                    </button>
                  )}
                  {status !== "DELETED" && (
                    <button
                      onClick={() => setConfirmModal("delete")}
                      className="w-full py-2.5 border border-red-300 text-red-600 font-semibold text-sm rounded-xl hover:bg-red-50 transition-all">
                      계정 삭제
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 상세 정보 */}
            <div className="md:col-span-2">
              <div className="rounded-2xl border border-outline-variant/30 bg-white p-5 mb-4">
                <h2 className="font-display font-semibold text-on-surface mb-3">기본 정보</h2>
                <InfoRow label="회원 ID"  value={`#${user.userId ?? user.id}`} />
                <InfoRow label="이름"     value={user.name} />
                <InfoRow label="닉네임"   value={user.nickname} />
                <InfoRow label="이메일"   value={user.email} />
                <InfoRow label="전화번호" value={user.phone} />
                <InfoRow label="역할"     value={ROLE_LABEL[user.role] ?? user.role} />
                <InfoRow label="가입일"   value={fmtDate(user.createdAt ?? user.joinedAt)} />
                <InfoRow label="최근 로그인" value={fmtDate(user.lastLoginAt)} />
              </div>

              <div className="rounded-2xl border border-outline-variant/30 bg-white p-5">
                <h2 className="font-display font-semibold text-on-surface mb-3">거래 통계</h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "구매",  value: user.purchaseCount ?? 0,  icon: "shopping_cart", color: "text-primary" },
                    { label: "판매",  value: user.saleCount ?? 0,       icon: "sell",          color: "text-green-600" },
                    { label: "신고",  value: user.reportCount ?? 0,     icon: "flag",          color: "text-red-500" },
                  ].map(({ label, value, icon, color }) => (
                    <div key={label} className="text-center p-4 rounded-xl bg-surface-container-low">
                      <span className={`material-symbols-outlined text-2xl ${color} mb-1 block`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                      <p className="text-2xl font-display font-bold text-on-surface">{value}</p>
                      <p className="text-xs text-on-surface-variant">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 확인 모달 */}
      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={confirmModal === "suspend" ? "계정 정지" : confirmModal === "activate" ? "계정 활성화" : "계정 삭제"}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            {confirmModal === "suspend" && "이 회원의 계정을 정지하시겠습니까? 정지된 계정은 서비스를 이용할 수 없습니다."}
            {confirmModal === "activate" && "이 회원의 계정을 활성화하시겠습니까?"}
            {confirmModal === "delete" && "이 회원의 계정을 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."}
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setConfirmModal(null)} className="btn-outlined btn-sm">취소</button>
            <button
              onClick={() => handleAction(confirmModal)}
              className={`px-4 py-1.5 font-semibold rounded-xl text-sm transition-all ${
                confirmModal === "delete" ? "bg-red-600 text-white hover:bg-red-700" :
                confirmModal === "activate" ? "bg-primary text-on-primary hover:bg-primary/90" :
                "bg-amber-500 text-white hover:bg-amber-600"
              }`}
            >
              확인
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
