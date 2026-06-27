import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const NAV_SECTIONS = [
  {
    label: "메인",
    items: [{ text: "대시보드", icon: "dashboard", path: "/admin" }],
  },
  {
    label: "콘텐츠 관리",
    items: [
      { text: "티켓 관리",  icon: "confirmation_number", path: "/admin/tickets" },
      { text: "거래 관리",  icon: "swap_horiz",          path: "/admin/trades" },
      { text: "공지사항",   icon: "campaign",            path: "/admin/notices" },
      { text: "FAQ",        icon: "quiz",                path: "/admin/faqs" },
    ],
  },
  {
    label: "고객 지원",
    items: [
      { text: "문의 관리", icon: "support_agent", path: "/admin/inquiries" },
      { text: "신고 관리", icon: "flag",           path: "/admin/reports" },
    ],
  },
  {
    label: "사용자 관리",
    items: [
      { text: "회원 관리",    icon: "group",    path: "/admin/users" },
      { text: "카테고리 관리", icon: "category", path: "/admin/categories" },
    ],
  },
];

export default function AdminLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) =>
    path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(path);

  const Sidebar = () => (
    <aside className="w-64 flex-shrink-0 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col h-full">
      {/* 로고 */}
      <div className="px-5 py-4 border-b border-outline-variant/30">
        <span className="text-lg font-display font-bold text-primary">PASSIT Admin</span>
      </div>

      {/* 내비게이션 */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
              {section.label}
            </p>
            {section.items.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                  isActive(item.path)
                    ? "bg-primary text-on-primary"
                    : "text-on-surface hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isActive(item.path) ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                {item.text}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* 사용자 정보 */}
      <div className="px-4 py-3 border-t border-outline-variant/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-sm text-primary">admin_panel_settings</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-on-surface truncate">{user?.email || "관리자"}</p>
            <p className="text-xs text-on-surface-variant">ADMIN</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-error/10 hover:text-error transition-all"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          로그아웃
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* 데스크톱 사이드바 */}
      <div className="hidden lg:flex flex-col">
        <Sidebar />
      </div>

      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 flex flex-col">
            <Sidebar />
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
        <header className="flex-shrink-0 h-14 bg-surface-container-lowest border-b border-outline-variant/30 flex items-center px-4 gap-3">
          <button
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-container text-on-surface-variant"
            onClick={() => setSidebarOpen(true)}
            aria-label="메뉴 열기"
          >
            <span className="material-symbols-outlined text-base">menu</span>
          </button>
          {title && <h1 className="text-base font-display font-bold text-on-surface">{title}</h1>}
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
