import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const [csOpen, setCsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (
    location.pathname.startsWith("/admin") ||
    location.pathname === "/auth" ||
    location.pathname.startsWith("/tickets") ||
    location.pathname.startsWith("/mypage") ||
    location.pathname.startsWith("/chat")
  ) return null;

  const go = (path) => {
    navigate(path);
    setCsOpen(false);
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate("/auth");
    setMobileOpen(false);
  };

  const avatarLabel = user
    ? (user.name || user.nickname || user.email || "?").charAt(0).toUpperCase()
    : "?";

  const navLinks = [
    { label: "티켓검색", path: "/tickets" },
    { label: "판매등록", path: "/sell" },
  ];

  const linkCls = (path) =>
    `relative px-1 py-1 text-sm font-semibold transition-colors duration-150 h-full flex items-center
     after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:rounded-full
     after:transition-transform after:duration-200 ${
      isActive(path)
        ? "text-primary after:bg-primary after:scale-x-100"
        : "text-on-surface-variant after:bg-primary after:scale-x-0 hover:text-primary hover:after:scale-x-100"
    }`;

  return (
    <>
      {/* AppBar — Stitch 스타일: backdrop-blur + surface/80 */}
      <header className="fixed top-0 inset-x-0 mx-auto max-w-md z-[1000] h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="w-full h-full px-4 flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-primary hover:opacity-80 active:scale-[0.97] transition-all duration-150"
          >
            <span className="material-symbols-outlined text-[24px]">security</span>
            <span className="text-2xl font-display font-black tracking-tight">PASSIT</span>
          </button>

          {/* Desktop Nav — 앱 모드에서는 숨김 (드로어로 대체) */}
          <nav className="hidden items-center gap-8 h-full flex-1 ml-10">
            {navLinks.map((item) => (
              <button key={item.label} onClick={() => navigate(item.path)} className={linkCls(item.path)}>
                {item.label}
              </button>
            ))}

            {/* 고객센터 드롭다운 */}
            <div className="relative h-full flex items-center">
              <button
                onClick={() => setCsOpen((v) => !v)}
                className={linkCls("/cs")}
              >
                고객센터
                <span className={`material-symbols-outlined ml-0.5 text-xs transition-transform duration-150 ${csOpen ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </button>
              {csOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCsOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 w-36 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-lg z-20 overflow-hidden animate-slide-down">
                    {[
                      { label: "공지사항", path: "/cs/notices" },
                      { label: "문의",     path: "/cs/inquiries" },
                      { label: "FAQ",      path: "/cs/faqs" },
                    ].map((item) => (
                      <button
                        key={item.path}
                        onClick={() => go(item.path)}
                        className="w-full text-left px-4 py-2.5 text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors duration-150"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button onClick={() => navigate("/mypage")} className={linkCls("/mypage")}>
              마이페이지
            </button>
          </nav>

          {/* Desktop Right — 앱 모드에서는 숨김 */}
          <div className="hidden items-center gap-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/chat")}
                  className={`p-2 rounded-full transition-all duration-150 active:scale-90 ${
                    isActive("/chat")
                      ? "text-primary bg-surface-container"
                      : "text-on-surface-variant hover:text-primary hover:bg-surface-container"
                  }`}
                  title="채팅"
                >
                  <span className="material-symbols-outlined text-xl">chat</span>
                </button>

                <button
                  onClick={() => navigate("/mypage")}
                  title={user?.name || user?.email}
                  className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden flex items-center justify-center text-sm font-bold text-primary transition-all duration-150 active:scale-90 hover:ring-2 hover:ring-primary/30"
                >
                  {avatarLabel}
                </button>

                <button
                  onClick={handleLogout}
                  className="text-sm text-on-surface-variant hover:text-error active:scale-[0.97] transition-all duration-150"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/auth")}
                  className="text-sm font-semibold text-on-surface-variant hover:text-primary active:scale-[0.97] transition-all duration-150 px-2"
                >
                  로그인
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="px-5 py-2 bg-primary text-on-primary text-sm font-display font-bold rounded-xl hover:bg-primary-dim active:scale-[0.96] transition-all duration-150 shadow-sm"
                >
                  시작하기
                </button>
              </>
            )}
          </div>

          {/* App Action — 알림 + 메뉴(드로어) */}
          <div className="flex items-center gap-0.5">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container active:scale-95 transition-all duration-150"
              onClick={() => navigate("/notifications")}
              aria-label="알림"
            >
              <span className="material-symbols-outlined text-[24px]">notifications</span>
            </button>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container active:scale-95 transition-all duration-150"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="메뉴"
            >
              <span className="material-symbols-outlined text-[24px]">{mobileOpen ? "close" : "menu"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[999] animate-fade-in">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 inset-x-0 mx-auto max-w-md bg-surface-container-lowest border-b border-outline-variant/30 animate-slide-down">
            {isAuthenticated && user && (
              <div className="px-5 py-3.5 border-b border-outline-variant/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {avatarLabel}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{user.name || user.nickname}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                </div>
              </div>
            )}

            <nav className="py-2">
              {[
                ...navLinks,
                { label: "공지사항", path: "/cs/notices" },
                { label: "문의",     path: "/cs/inquiries" },
                { label: "FAQ",      path: "/cs/faqs" },
                ...(isAuthenticated ? [{ label: "채팅", path: "/chat" }, { label: "마이페이지", path: "/mypage" }] : []),
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className={`w-full text-left px-5 py-3 text-sm transition-all duration-150 active:scale-[0.99] ${
                    isActive(item.path)
                      ? "text-primary font-semibold bg-surface-container-low"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="px-5 pt-3 pb-3 border-t border-outline-variant/20 mt-1">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 text-sm font-semibold text-error border border-error-container rounded-xl hover:bg-error-container/20 active:scale-[0.98] transition-all duration-150"
                  >
                    로그아웃
                  </button>
                ) : (
                  <button
                    onClick={() => go("/auth")}
                    className="w-full py-2.5 text-sm font-display font-bold text-on-primary bg-primary rounded-xl hover:bg-primary-dim active:scale-[0.98] transition-all duration-150"
                  >
                    로그인 / 시작하기
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
