import React, { useEffect, useRef } from "react";
import MessageBubble from "../MessageBubble";

const fmtDate = (d) => {
  const date = new Date(d);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "오늘";
  if (date.toDateString() === yesterday.toDateString()) return "어제";
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
};

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
};

const ChatRoom = ({ messages, currentUserId, chatroomId, roomInfo }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const filtered = messages.filter((m) => m.sentAt || m.tempId);

  const isFirstInGroup = (idx) => {
    if (idx === 0) return true;
    const prev = filtered[idx - 1];
    return prev.senderId !== filtered[idx].senderId || prev.type !== "TEXT" || filtered[idx].type !== "TEXT";
  };

  const isLastInGroup = (idx) => {
    if (idx === filtered.length - 1) return true;
    const next = filtered[idx + 1];
    return next.senderId !== filtered[idx].senderId || next.type !== "TEXT" || filtered[idx].type !== "TEXT";
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4 flex flex-col">
      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400">
          <span className="text-4xl">💬</span>
          <p className="text-sm">메시지를 입력하여 대화를 시작해보세요</p>
        </div>
      ) : (
        filtered.map((msg, idx) => {
          const prev = idx > 0 ? filtered[idx - 1] : null;
          const showDateDivider = !isSameDay(msg.sentAt, prev?.sentAt);

          return (
            <React.Fragment key={msg.messageId || msg.tempId || idx}>
              {showDateDivider && msg.sentAt && (
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium px-1 whitespace-nowrap">
                    {fmtDate(msg.sentAt)}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              )}
              <MessageBubble
                message={msg}
                userId={currentUserId}
                chatroomId={chatroomId}
                roomInfo={roomInfo}
                isFirstInGroup={isFirstInGroup(idx)}
                isLastInGroup={isLastInGroup(idx)}
              />
            </React.Fragment>
          );
        })
      )}
    </div>
  );
};

export default ChatRoom;
