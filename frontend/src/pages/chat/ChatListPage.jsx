import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useMatch } from "react-router-dom";
import { getChatRooms, deleteChatRoom } from "../../api/services/chat/chat.api";
import { useAuth } from "../../contexts/AuthContext";

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-pink-100 text-pink-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-surface-container-high text-primary",
  "bg-amber-100 text-amber-700",
];
const avatarColor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];
const initial = (title) => (title ? title.charAt(0).toUpperCase() : "#");

const fmtTime = (d) => {
  if (!d) return "";
  const date = new Date(d);
  const now = new Date();
  const days = Math.floor((now - date) / 86400000);
  if (days === 0) return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: true });
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
};

const lastMsgPreview = (room) => {
  const type = room.last_message?.type;
  if (type === "SYSTEM_ACTION_MESSAGE" || type === "SYSTEM_INFO_MESSAGE") return "[시스템 메시지]";
  return room.last_message?.content || "메시지를 시작해보세요";
};

export default function ChatListPage({ embedded = false }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const roomMatch = useMatch("/chat/:chatroomId");
  const activeRoomId = roomMatch?.params?.chatroomId;

  const loadRooms = useCallback(async () => {
    if (!user?.id) { setError("로그인이 필요합니다."); setLoading(false); return; }
    try {
      setLoading(true); setError(null);
      const data = await getChatRooms();
      setRooms(data);
    } catch {
      setError("채팅방 목록을 불러오는데 실패했습니다.");
    } finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) loadRooms();
    else setLoading(false);
  }, [isAuthenticated, user?.id, loadRooms]);

  useEffect(() => {
    const onVisible = () => { if (!document.hidden && isAuthenticated) loadRooms(); };
    const onFocus = () => { if (isAuthenticated) loadRooms(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => { document.removeEventListener("visibilitychange", onVisible); window.removeEventListener("focus", onFocus); };
  }, [isAuthenticated, loadRooms]);

  const handleDelete = async (chatroomId, e) => {
    e.stopPropagation();
    if (!window.confirm("채팅방을 나가시겠습니까?")) return;
    try {
      await deleteChatRoom(chatroomId);
      setRooms((p) => p.filter((r) => r.chatroom_id !== chatroomId));
    } catch { alert("채팅방 삭제에 실패했습니다."); }
  };

  if (!isAuthenticated) {
    return (
      <div className={`${embedded ? "h-full" : "mt-16 min-h-[60vh]"} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-3xl text-secondary">lock</span>
          </div>
          <p className="text-on-surface-variant font-medium">로그인이 필요합니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${embedded ? "h-full" : "h-[calc(100vh-64px)] mt-16"} flex flex-col bg-surface-container-lowest`}>
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-outline-variant/30 flex items-center justify-between">
        <h1 className="text-lg font-display font-bold text-on-surface">채팅</h1>
        {rooms.length > 0 && (
          <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
            {rooms.length}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-surface-container flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-surface-container rounded w-2/5" />
                  <div className="h-3 bg-surface-container rounded w-3/5" />
                </div>
                <div className="h-3 bg-surface-container rounded w-10" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">warning</span>
            <p className="text-sm text-on-surface-variant text-center">{error}</p>
            <button
              onClick={loadRooms}
              className="px-4 py-2 text-sm font-semibold text-primary border border-primary/30 rounded-xl hover:bg-surface-container transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-secondary">chat</span>
            </div>
            <div>
              <p className="font-display font-semibold text-on-surface mb-1">아직 채팅이 없어요</p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                티켓 상세 페이지에서 채팅하기를 눌러<br />대화를 시작해보세요
              </p>
            </div>
            <button
              onClick={() => navigate("/tickets")}
              className="px-5 py-2.5 bg-primary text-on-primary text-sm font-display font-bold rounded-xl hover:bg-primary-dim active:scale-[0.97] transition-all"
            >
              티켓 둘러보기
            </button>
          </div>
        ) : (
          <ul>
            {rooms.map((room, i) => (
              <li key={room.chatroom_id}>
                <button
                  className={`group w-full flex items-center gap-3 px-5 py-3.5 transition-colors duration-100 text-left ${
                    activeRoomId === String(room.chatroom_id)
                      ? "bg-surface-container"
                      : "hover:bg-surface-container-low active:bg-surface-container"
                  }`}
                  onClick={() => navigate(`/chat/${room.chatroom_id}`, {
                    state: { ticketTitle: room.ticket?.event_name, sellerName: room.seller?.nickname }
                  })}
                >
                  <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-base font-bold ${avatarColor(room.chatroom_id)}`}>
                    {initial(room.ticket?.event_name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="font-semibold text-sm text-on-surface truncate">
                        {room.ticket?.event_name || "티켓 채팅"}
                      </p>
                      <span className="text-[11px] text-on-surface-variant flex-shrink-0">
                        {fmtTime(room.last_message?.sent_at)}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant truncate">
                      {lastMsgPreview(room)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDelete(room.chatroom_id, e)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-on-surface-variant/30 hover:text-error hover:bg-error-container/30 transition-all duration-150"
                    aria-label="채팅방 나가기"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </button>
                {i < rooms.length - 1 && <div className="mx-5 h-px bg-outline-variant/20" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
