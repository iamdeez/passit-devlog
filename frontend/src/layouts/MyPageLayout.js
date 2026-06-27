import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const menuItems = [
  { text: "회원정보",  icon: "person",              path: "/mypage/profile" },
  { text: "활동 내역", icon: "history",              path: "/mypage/activities" },
  { text: "My 티켓",   icon: "confirmation_number", path: "/mypage/my-tickets" },
  { text: "내 채팅",   icon: "chat",                path: "/chat" },
];

const CS_ITEMS = [
  { text: "공지사항",   icon: "campaign",        path: "/cs/notices" },
  { text: "FAQ",        icon: "help",            path: "/cs/faqs" },
  { text: "1:1 문의",   icon: "contact_support", path: "/cs/inquiries" },
];

export default function MyPageLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <div className="max-w-[1200px] mx-auto px-0 md:px-6 py-0 md:py-6 mt-0 md:mt-16 flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          {/* 프로필 카드 */}
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden mb-3">
            <div className="px-4 pt-5 pb-4 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              </div>
              <p className="font-display font-bold text-on-surface text-sm">{user?.nickname || user?.name || "사용자"}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{user?.email}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden sticky top-20">
            <div className="px-4 py-2.5 bg-primary/5 border-b border-outline-variant/20">
              <p className="text-xs font-display font-bold text-primary uppercase tracking-wide">마이메뉴</p>
            </div>
            <nav className="p-2">
              {menuItems.map((item) => {
                const active = location.pathname.startsWith(item.path);
                return (
                  <button
                    key={item.text}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium active:scale-[0.98] transition-all duration-150 mb-0.5 ${
                      active
                        ? "bg-primary/5 text-primary font-semibold"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-base transition-colors duration-150 ${active ? "text-primary" : "text-on-surface-variant"}`}
                      style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    {item.text}
                  </button>
                );
              })}
            </nav>

            <div className="mx-3 border-t border-outline-variant/20 my-1" />

            <nav className="p-2">
              {CS_ITEMS.map((item) => {
                const active = location.pathname.startsWith(item.path);
                return (
                  <button
                    key={item.text}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium active:scale-[0.98] transition-all duration-150 mb-0.5 ${
                      active
                        ? "bg-primary/5 text-primary font-semibold"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-base transition-colors duration-150 ${active ? "text-primary" : "text-on-surface-variant"}`}
                      style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    {item.text}
                  </button>
                );
              })}
            </nav>

            <div className="p-2 pb-3">
              <button onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 active:scale-[0.98] transition-all duration-150">
                <span className="material-symbols-outlined text-base">logout</span>
                로그아웃
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
