import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const NAV_ITEMS = [
  { label: "홈",  icon: "home",                path: "/" },
  { label: "티켓", icon: "confirmation_number", path: "/tickets" },
  { label: "거래", icon: "swap_horizontal_circle", path: "/deals" },
  { label: "채팅", icon: "chat",                   path: "/chat" },
  { label: "마이", icon: "person",              path: "/mypage" },
];

const AUTH_REQUIRED = new Set(["/deals", "/chat", "/mypage"]);

export default function BottomNav() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isAuthenticated } = useAuth();

  const hide =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/auth" ||
    location.pathname.startsWith("/auth/") ||
    location.pathname === "/reset-password" ||
    /^\/chat\/.+/.test(location.pathname);

  if (hide) return null;

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleNav = (item) => {
    if (AUTH_REQUIRED.has(item.path) && !isAuthenticated) {
      navigate("/auth");
      return;
    }
    navigate(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] md:hidden bg-surface border-t border-outline-variant shadow-lg rounded-t-xl">
      <div className="flex items-center justify-around px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-150 active:scale-90 ${
                active ? "text-primary bg-primary-container font-bold" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-label text-xs font-medium leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
