import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const fmtDate = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now - date) / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}hour 전`;
  if (diffHour < 48) return "어제";
  return date.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
};

const TYPE_STYLE = {
  DEAL_REQUEST: { icon: "swap_horiz", bg: "bg-primary", fg: "text-on-primary", title: "text-primary", label: "거래 성사 안내" },
  DEAL_ACCEPTED: { icon: "swap_horiz", bg: "bg-primary", fg: "text-on-primary", title: "text-primary", label: "거래 성사 안내" },
  PAYMENT: { icon: "payments", bg: "bg-primary/10", fg: "text-primary", title: "text-primary", label: "입금 완료" },
  CHAT: { icon: "chat", bg: "bg-[#22C55E]", fg: "text-white", title: "text-[#22C55E]", label: "새로운 채팅 메시지" },
  NOTICE: { icon: "notifications", bg: "bg-surface-container-highest", fg: "text-on-surface-variant", title: "text-on-surface-variant", label: "공지사항 알림" },
  SYSTEM: { icon: "security", bg: "bg-surface-container-highest", fg: "text-on-surface-variant", title: "text-on-surface-variant", label: "로그인 보안 안내" },
};

const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    type: "DEAL_ACCEPTED",
    title: "BTS 월드투어 티켓 거래가 성사되었습니다. 상세 내용을 확인하세요.",
    link: "/deals",
    read: false,
    createdAt: new Date(Date.now() - 1 * 60000).toISOString(),
  },
  {
    id: 2,
    type: "CHAT",
    title: "티켓마스터님: 실례지만 티켓 인증 사진 좀 더 볼 수 있을까요?",
    link: "/chat",
    read: false,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 3,
    type: "NOTICE",
    title: "에스크로 안전거래 이용 안내 지침이 업데이트 되었습니다.",
    link: "/cs/notices",
    read: true,
    createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: 4,
    type: "PAYMENT",
    title: "임영웅 콘서트 티켓 대금 입금이 완료되었습니다.",
    link: "/deals",
    read: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: 5,
    type: "SYSTEM",
    title: "새로운 기기에서 로그인 시도가 감지되었습니다.",
    link: "/mypage/profile",
    read: true,
    createdAt: new Date(Date.now() - 28 * 3600000).toISOString(),
  },
];

function NotificationCard({ notification, onClick }) {
  const type = TYPE_STYLE[notification.type] || TYPE_STYLE.SYSTEM;
  const unread = !notification.read;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full text-left rounded-xl p-4 flex gap-4 transition-all cursor-pointer active:scale-[0.99] ${
        unread
          ? "bg-primary-container/20 hover:shadow-md"
          : "bg-surface-container-lowest border border-outline-variant/30 hover:shadow-sm"
      }`}
    >
      <div className={`flex-shrink-0 w-12 h-12 ${type.bg} rounded-full flex items-center justify-center ${type.fg} shadow-sm`}>
        <span className="material-symbols-outlined">{type.icon}</span>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <span className={`text-xs font-bold tracking-tight ${unread ? type.title : "text-on-surface-variant"}`}>
            {type.label}
          </span>
          <span className="text-[10px] text-on-surface-variant">{fmtDate(notification.createdAt)}</span>
        </div>
        <p className={`text-sm leading-relaxed ${unread ? "text-on-surface font-medium" : "text-on-surface-variant"}`}>
          {notification.title}
        </p>
      </div>
      {unread && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />}
    </button>
  );
}

export default function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const handleClick = (notification) => {
    setNotifications((prev) => prev.map((item) => (item.id === notification.id ? { ...item, read: true } : item)));
    if (notification.link) navigate(notification.link);
  };

  const today = notifications.slice(0, 3);
  const yesterday = notifications.slice(3);

  return (
    <div className="bg-background text-on-background min-h-screen pb-20">
      <nav className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant flex justify-between items-center px-4 h-16">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-surface-container-low transition-colors rounded-full active:scale-95"
            aria-label="뒤로가기"
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </button>
          <h1 className="font-headline text-on-surface font-bold text-lg">알림</h1>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          className="text-primary font-bold text-sm px-3 py-2 hover:bg-surface-container-low transition-colors rounded-lg active:scale-95"
        >
          전체 읽음
        </button>
      </nav>

      <main className="pt-20 px-4 max-w-2xl mx-auto">
        <section className="mb-6">
          <h2 className="text-sm font-bold text-on-surface-variant mb-3 px-1">오늘</h2>
          <div className="space-y-3">
            {today.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} onClick={() => handleClick(notification)} />
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-sm font-bold text-on-surface-variant mb-3 px-1">어제</h2>
          <div className="space-y-3">
            {yesterday.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} onClick={() => handleClick(notification)} />
            ))}
          </div>
        </section>

        <div className="flex flex-col items-center justify-center pt-8 pb-12 opacity-40">
          <span className="material-symbols-outlined text-6xl mb-2">history</span>
          <p className="text-sm">최근 30일간의 알림만 표시됩니다.</p>
        </div>
      </main>
    </div>
  );
}
