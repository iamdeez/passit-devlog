import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../components/common";
import { useAuth } from "../../contexts/AuthContext";
import userService from "../../services/userService";

const statItems = [
  { label: "판매 완료", value: "152" },
  { label: "구매 완료", value: "45" },
  { label: "후기", value: "28" },
];

const menuGroups = [
  [
    { text: "내가 등록한 티켓", icon: "confirmation_number", path: "/mypage/my-tickets" },
    { text: "구매 내역", icon: "receipt_long", path: "/mypage/activities" },
    { text: "찜 목록", icon: "favorite", path: "/mypage/my-tickets" },
    { text: "받은 후기", icon: "rate_review", path: "/mypage/activities" },
  ],
  [
    { text: "1:1 문의", icon: "help_outline", path: "/cs/inquiries" },
    { text: "공지사항", icon: "notifications_none", path: "/cs/notices" },
  ],
];

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border border-outline-variant text-on-surface bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: currentUser, updateUser, logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", nickname: "", phone: "" });
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoadingUserInfo(true);
        const response = await userService.getMe();
        const info = response.data;
        setUserInfo(info);
        setProfileData({ name: info.name || "", nickname: info.nickname || "", phone: info.phone || "" });
      } catch {
        const fallback = currentUser || {};
        setProfileData({ name: fallback.name || "", nickname: fallback.nickname || "", phone: fallback.phone || "" });
      } finally {
        setLoadingUserInfo(false);
      }
    };
    fetchUserInfo();
  }, [currentUser]);

  const displayUser = userInfo || currentUser || {};
  const isSocialUser = userInfo?.provider != null || currentUser?.provider != null;

  const handleProfileSubmit = async () => {
    setProfileError("");
    setProfileSuccess("");
    setLoading(true);
    try {
      const response = await userService.updateMe(profileData);
      updateUser(response.data);
      setUserInfo(response.data);
      setProfileSuccess("프로필이 성공적으로 업데이트되었습니다");
      setTimeout(() => {
        setProfileDialogOpen(false);
        setProfileSuccess("");
      }, 1200);
    } catch (err) {
      setProfileError(err.message || "프로필 업데이트에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("새 비밀번호가 일치하지 않습니다");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError("비밀번호는 최소 8자 이상이어야 합니다");
      return;
    }
    setLoading(true);
    try {
      if (isSocialUser) await userService.setPassword({ newPassword: passwordData.newPassword });
      else await userService.changePassword({ oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword });
      setPasswordSuccess(isSocialUser ? "비밀번호가 성공적으로 설정되었습니다" : "비밀번호가 성공적으로 변경되었습니다");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
        setPasswordDialogOpen(false);
        setPasswordSuccess("");
      }, 1200);
    } catch (err) {
      setPasswordError(err.message || "비밀번호 변경에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "탈퇴하기") {
      setDeleteError("탈퇴 확인 문구를 정확히 입력해주세요");
      return;
    }
    setLoading(true);
    try {
      await userService.deleteAccount();
      logout();
      navigate("/");
    } catch (err) {
      setDeleteError(err.message || "계정 삭제에 실패했습니다");
      setLoading(false);
    }
  };

  const closePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordError("");
    setPasswordSuccess("");
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteConfirmText("");
    setDeleteError("");
  };

  if (loadingUserInfo) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen pb-24 -mx-4 sm:-mx-6 md:mx-0">
      <header className="md:hidden fixed top-0 inset-x-0 mx-auto max-w-md z-50 bg-surface flex items-center justify-between px-4 h-16">
        <button
          type="button"
          onClick={() => setProfileDialogOpen(true)}
          className="material-symbols-outlined text-primary hover:bg-surface-container-low transition-colors p-2 rounded-full active:opacity-80"
          aria-label="설정"
        >
          settings
        </button>
        <h1 className="font-headline text-lg font-bold text-primary">마이페이지</h1>
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="material-symbols-outlined text-primary hover:bg-surface-container-low transition-colors p-2 rounded-full active:opacity-80"
          aria-label="알림"
        >
          notifications
        </button>
      </header>

      <main className="pt-20 md:pt-0 px-4 max-w-md mx-auto space-y-6">
        <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full ring-4 ring-primary-container bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  person
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary p-1 rounded-full border-2 border-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-headline font-bold text-xl text-on-surface truncate">
                  {displayUser.nickname || displayUser.name || "티켓마스터"}
                </span>
                <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight">
                  인증된 셀러
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant text-sm mb-1">
                <span className="material-symbols-outlined text-sm text-[#FBBF24]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className="font-semibold text-on-surface">4.9</span>
                <span className="text-xs">/ 5.0</span>
              </div>
              <p className="text-xs text-outline font-label truncate">{displayUser.email || "passit@example.com"}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="bg-surface-container rounded-xl p-4 flex flex-col items-center justify-center border border-outline-variant/20 hover:bg-surface-container-high transition-colors cursor-pointer group"
            >
              <span className="text-primary font-headline text-2xl font-bold group-hover:scale-110 transition-transform">
                {item.value}
              </span>
              <span className="text-on-surface-variant text-[11px] font-medium mt-1">{item.label}</span>
            </div>
          ))}
        </section>

        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield_lock
          </span>
          <div>
            <p className="text-sm font-bold text-primary">에스크로 안전 거래 보호 중</p>
            <p className="text-[11px] text-on-primary-fixed-variant">결제 대금은 구매 확정 후 판매자에게 전달됩니다.</p>
          </div>
        </div>

        {menuGroups.map((group, groupIndex) => (
          <nav key={groupIndex} className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30">
            <ul className="divide-y divide-outline-variant/20">
              {group.map((item) => (
                <li key={item.text}>
                  <button
                    type="button"
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low active:bg-surface-container transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">{item.icon}</span>
                      <span className="text-on-surface text-sm font-medium">{item.text}</span>
                    </div>
                    <span className="material-symbols-outlined text-outline text-lg">chevron_right</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <nav className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30">
          <button
            type="button"
            onClick={() => setProfileDialogOpen(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low active:bg-surface-container transition-colors group border-b border-outline-variant/20"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">manage_accounts</span>
              <span className="text-on-surface text-sm font-medium">프로필 설정</span>
            </div>
            <span className="material-symbols-outlined text-outline text-lg">chevron_right</span>
          </button>
          <button
            type="button"
            onClick={() => setPasswordDialogOpen(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low active:bg-surface-container transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">lock</span>
              <span className="text-on-surface text-sm font-medium">비밀번호 변경</span>
            </div>
            <span className="material-symbols-outlined text-outline text-lg">chevron_right</span>
          </button>
        </nav>

        <button
          type="button"
          onClick={logout}
          className="w-full bg-surface-container-lowest border border-outline-variant/30 p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-error-container/10 transition-colors active:scale-95 group"
        >
          <span className="material-symbols-outlined text-outline group-hover:text-error transition-colors">logout</span>
          <span className="text-outline text-sm font-medium group-hover:text-error transition-colors">로그아웃</span>
        </button>
      </main>

      <Modal isOpen={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} title="프로필 설정">
        <div className="space-y-3">
          {profileError && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{profileError}</div>}
          {profileSuccess && <div className="px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm">{profileSuccess}</div>}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">이름</label>
            <input className={inputCls} value={profileData.name} onChange={(e) => setProfileData((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">닉네임</label>
            <input className={inputCls} value={profileData.nickname} onChange={(e) => setProfileData((p) => ({ ...p, nickname: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">전화번호</label>
            <input className={inputCls} value={profileData.phone} onChange={(e) => setProfileData((p) => ({ ...p, phone: e.target.value }))} placeholder="010-0000-0000" />
          </div>
          <div className="flex justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              className="px-4 py-2 border border-red-300 rounded-xl text-red-600 font-semibold text-sm hover:bg-red-50"
            >
              계정 탈퇴
            </button>
            <button
              type="button"
              onClick={handleProfileSubmit}
              disabled={loading}
              className="btn-primary btn-sm disabled:opacity-60"
            >
              저장하기
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={passwordDialogOpen} onClose={closePasswordDialog} title={isSocialUser ? "비밀번호 설정" : "비밀번호 변경"}>
        <div className="space-y-3">
          {passwordError && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{passwordError}</div>}
          {passwordSuccess && <div className="px-4 py-3 rounded-xl bg-green-50 text-green-700 text-sm">{passwordSuccess}</div>}
          {!isSocialUser && (
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1.5">현재 비밀번호</label>
              <input type="password" className={inputCls} value={passwordData.oldPassword} onChange={(e) => setPasswordData((p) => ({ ...p, oldPassword: e.target.value }))} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">새 비밀번호</label>
            <input type="password" className={inputCls} value={passwordData.newPassword} onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">새 비밀번호 확인</label>
            <input type="password" className={inputCls} value={passwordData.confirmPassword} onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closePasswordDialog} disabled={loading} className="btn-outlined btn-sm disabled:opacity-60">취소</button>
            <button type="button" onClick={handlePasswordSubmit} disabled={loading} className="btn-primary btn-sm disabled:opacity-60">변경하기</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={deleteDialogOpen} onClose={closeDeleteDialog} title="계정 탈퇴">
        <div className="space-y-3">
          {deleteError && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{deleteError}</div>}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="font-semibold text-amber-800 text-sm mb-1">주의: 이 작업은 되돌릴 수 없습니다</p>
            <ul className="text-sm text-amber-700 space-y-0.5 list-disc list-inside">
              <li>모든 개인 정보가 삭제됩니다</li>
              <li>거래 내역이 삭제됩니다</li>
              <li>등록한 티켓이 삭제됩니다</li>
            </ul>
          </div>
          <p className="text-sm text-on-surface-variant">
            계속하려면 아래에 <strong className="text-on-surface">"탈퇴하기"</strong>를 입력하세요
          </p>
          <input className={inputCls} value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="탈퇴하기" />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeDeleteDialog} disabled={loading} className="btn-outlined btn-sm disabled:opacity-60">취소</button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={loading || deleteConfirmText !== "탈퇴하기"}
              className="px-5 py-2 bg-red-600 text-white font-display font-bold rounded-xl hover:bg-red-700 text-sm disabled:opacity-50 transition-all"
            >
              탈퇴하기
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
