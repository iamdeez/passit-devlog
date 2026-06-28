import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "../../components/common";
import useSupabaseChat from "../../hooks/chat/useSupabaseChat";
import { getMessages, sendMessage, getChatRoomDetail } from "../../api/services/chat/chat.api";
import { useAuth } from "../../contexts/AuthContext";

const mapMsg = (m) => ({
  ...m,
  messageId: m.message_id ?? m.messageId,
  chatroomId: m.chatroom_id ?? m.chatroomId,
  senderId: m.sender_id ?? m.senderId,
  sentAt: m.sent_at ?? m.sentAt,
});

const timeLabel = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
};

const FALLBACK_POSTER = "https://lh3.googleusercontent.com/aida-public/AB6AXuD64nxfNIW_W17JxTtl6lBYXsyMJRe7pqRx2__DBIXqU5qHFqZ7DY6NH0qzeOP3Rkykpp6zC6fEvqzSL2BeIK1YEM3HM3-PyERieFcbSu0iE6zq1IvbN-B9A6LmKVgbJtzkyEnCdjs-2ilSOaJw9E4EqZeCSnFy7w-DCLB5ITd1IcFQcBcyjev5bleDbVWrQID4A_0RiDGTpSurFoTTsMwC4el0Poc-JXyhO0Xox2G8ktNhyP5x7CZdyqrlMnNIm4J4d2eWA4dRDDw";
const FALLBACK_AVATAR = "https://lh3.googleusercontent.com/aida-public/AB6AXuCP3TMPcnFCH87S3ngoIz6L7AnzK6Sxk6lbUg9z4kogYf9Atr75ePlXhR3I_hEBF10Xd0jrF_mwn8WGMrBbraqdGgO2iu3dkfdCf-s-rcLUSeuv2XWk9HHrdvPlp94dL4IT3_Q4EHGsbbKXfUTxtyBozlHQIjJ1CuUcmb6rtJTYONI1IxhmGo4GKPPgD3K0pBux2SrUrihQfl-VVXvdcruGNwH7XvGcD1Ahj3GTC6CyY74qYS9x_DWpDSgTJL-U11GGWyxHCpyIfzY";

export default function ChatRoomPage() {
  const { chatroomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);

  const currentUserId = user?.id ?? user?.userId;
  const ticketTitle = roomInfo?.ticket?.event_name || location.state?.ticketTitle || "BTS World Tour 2025";
  const otherUser = roomInfo
    ? (roomInfo.buyer_id === currentUserId ? roomInfo.seller : roomInfo.buyer)
    : null;
  const partnerName = otherUser?.nickname || location.state?.sellerName || "거래왕김민준";
  const ticketInfo = location.state?.ticketInfo || (roomInfo?.ticket ? {
    ticketId: roomInfo.ticket.ticket_id,
    eventName: roomInfo.ticket.event_name,
    price: roomInfo.ticket.selling_price,
    image: roomInfo.ticket.image1,
  } : null);

  useSupabaseChat({
    chatroomId,
    onMessage: (newMsg) => {
      setMessages((prev) => {
        const mapped = mapMsg(newMsg);
        if (prev.some((m) => (m.messageId || m.message_id) === mapped.messageId)) return prev;
        return [...prev, mapped];
      });
    },
  });

  useEffect(() => {
    if (!chatroomId || !currentUserId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const [room, msgs] = await Promise.all([
          getChatRoomDetail(chatroomId).catch(() => null),
          getMessages(chatroomId),
        ]);
        if (room) setRoomInfo(room);
        setMessages(msgs.map(mapMsg));
      } catch {
        setError("메시지를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [chatroomId, currentUserId]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !currentUserId) return;
    setDraft("");
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      messageId: tempId,
      chatroomId,
      senderId: currentUserId,
      content: text,
      type: "TEXT",
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const sent = await sendMessage(chatroomId, text, "TEXT");
      setMessages((prev) => prev.map((m) => m.messageId === tempId ? mapMsg(sent) : m));
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.messageId !== tempId));
      setError(err.message || "메시지 전송에 실패했습니다.");
    }
  };

  const visibleMessages = messages.length > 0 ? messages : [
    { messageId: "sample-1", senderId: "partner", content: "안녕하세요! 티켓 상태 궁금하신가요?", sentAt: "2025-01-01T10:20:00" },
    { messageId: "sample-2", senderId: currentUserId, content: "네, 티켓 실물 사진 보내주실 수 있나요?", sentAt: "2025-01-01T10:21:00" },
    { messageId: "system-1", type: "SYSTEM", content: "에스크로 입금이 완료되었습니다. 판매자에게 알림이 전송되었습니다." },
    { messageId: "sample-3", senderId: currentUserId, content: "입금 완료했습니다. 확인 부탁드려요!", sentAt: "2025-01-01T10:25:00" },
  ];

  return (
    <div className="bg-surface-container-low text-on-surface min-h-screen max-w-md mx-auto">
      <header className="fixed top-0 inset-x-0 mx-auto max-w-md z-50 bg-surface border-b border-outline-variant flex justify-between items-center px-4 h-16 max-w-md mx-auto">
        <button onClick={() => navigate("/chat")} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors rounded-full active:scale-95">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
            <img className="w-full h-full object-cover" alt="" src={FALLBACK_AVATAR} />
          </div>
          <h1 className="font-headline font-bold text-base text-on-surface">{partnerName}</h1>
        </div>
        <button className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high transition-colors rounded-full active:scale-95">
          <span className="material-symbols-outlined text-on-surface">more_vert</span>
        </button>
      </header>

      <main className="pt-16 pb-36">
        <div className="sticky top-16 z-40 bg-surface-container-lowest p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden shadow-inner shrink-0">
              <img className="w-full h-full object-cover" alt="" src={ticketInfo?.image || FALLBACK_POSTER} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h2 className="font-headline font-bold text-on-surface truncate">{ticketInfo?.eventName || ticketTitle}</h2>
                <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
                  보호중
                </span>
              </div>
              <p className="text-primary font-bold text-lg">₩{Number(ticketInfo?.price || 150000).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] px-2">
            {[
              ["request_quote", "구매 요청", false],
              ["verified_user", "판매자 확인", true],
              ["account_balance_wallet", "에스크로 입금", false],
              ["check_circle", "거래 완료", false],
            ].map(([icon, label, active], index) => (
              <React.Fragment key={label}>
                {index > 0 && <div className={`h-px flex-1 bg-outline-variant mx-2 -mt-4 ${active ? "" : "opacity-30"}`} />}
                <div className={`flex flex-col items-center gap-1.5 ${active ? "text-primary font-bold relative after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-current" : "text-on-surface-variant opacity-60"}`}>
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                  <span>{label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {loading && messages.length === 0 ? (
          <div className="h-[50vh] flex items-center justify-center"><Spinner size="lg" /></div>
        ) : error && messages.length === 0 ? (
          <div className="h-[50vh] flex flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">warning</span>
            <p className="text-sm text-on-surface-variant">{error}</p>
          </div>
        ) : (
          <div className="px-4 py-6 flex flex-col gap-4 min-h-[calc(100vh-16rem)]">
            {visibleMessages.map((message) => {
              if (message.type === "SYSTEM") {
                return (
                  <div key={message.messageId} className="flex justify-center my-4">
                    <div className="bg-surface-container text-on-surface-variant px-4 py-1.5 rounded-full text-[11px] font-medium flex items-center gap-2 border border-outline-variant/30">
                      <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
                      {message.content}
                    </div>
                  </div>
                );
              }
              const mine = String(message.senderId) === String(currentUserId);
              return (
                <div key={message.messageId} className={`flex items-end gap-2 max-w-[85%] ${mine ? "self-end flex-row-reverse" : ""}`}>
                  {!mine && (
                    <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-outline-variant">
                      <img className="w-full h-full object-cover" alt="" src={FALLBACK_AVATAR} />
                    </div>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${mine ? "bg-primary text-on-primary rounded-br-none" : "bg-surface-container-highest text-on-surface rounded-bl-none"}`}>
                    {message.content}
                  </div>
                  <span className="text-[10px] text-on-surface-variant shrink-0 mb-1">{timeLabel(message.sentAt)}</span>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <div className="fixed bottom-[72px] left-0 right-0 mx-auto max-w-md bg-surface-container-lowest px-4 py-3 flex items-center gap-3 border-t border-outline-variant/30 z-40">
        <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-full">
          <span className="material-symbols-outlined">add_photo_alternate</span>
        </button>
        <div className="flex-1 bg-surface-container rounded-full px-4 py-2.5">
          <input
            className="bg-transparent border-none focus:ring-0 text-sm w-full p-0 text-on-surface placeholder:text-on-surface-variant/60"
            placeholder="메시지 입력..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter") handleSend(); }}
            type="text"
          />
        </div>
        <button onClick={handleSend} className="w-10 h-10 bg-primary text-on-primary flex items-center justify-center rounded-full shadow-md active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
        </button>
      </div>

      <nav className="fixed bottom-0 inset-x-0 mx-auto max-w-md mx-auto max-w-md z-50 flex justify-around items-center px-2 py-3 bg-surface border-t border-outline-variant shadow-lg rounded-t-xl">
        {[
          ["홈", "home", "/"],
          ["티켓", "confirmation_number", "/tickets"],
          ["거래", "swap_horizontal_circle", "/deals"],
          ["채팅", "chat", "/chat"],
          ["마이", "person", "/mypage"],
        ].map(([label, icon, path]) => {
          const active = label === "채팅";
          return (
            <button key={label} onClick={() => navigate(path)} className={`flex flex-col items-center justify-center px-3 py-1 transition-colors ${active ? "text-primary font-bold bg-primary-container rounded-xl active:scale-90" : "text-on-surface-variant hover:text-primary"}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
              <span className="font-label text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
