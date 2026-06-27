import React from "react";

const fmt = (d) =>
  d ? new Date(d).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: true }) : "";

const initial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

const COLORS = [
  "bg-violet-200 text-violet-700",
  "bg-pink-200 text-pink-700",
  "bg-emerald-200 text-emerald-700",
  "bg-orange-200 text-orange-700",
  "bg-primary-container text-primary",
  "bg-amber-200 text-amber-700",
];
const avatarColor = (id) => COLORS[(String(id || "").charCodeAt(0) || 0) % COLORS.length];

const TextMessage = ({ message, isMine, isFirstInGroup, isLastInGroup }) => {
  const time = fmt(message.sentAt);
  const senderName = message.sender?.nickname ?? message.senderId ?? "";
  const senderId = message.senderId ?? "";

  const bubbleCls = isMine
    ? `bg-primary text-on-primary ${isLastInGroup ? "rounded-2xl rounded-br-sm" : "rounded-2xl"}`
    : `bg-white border border-slate-200 text-slate-900 ${isLastInGroup ? "rounded-2xl rounded-bl-sm" : "rounded-2xl"}`;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-3" : "mt-0.5"} px-1`}>
      <div className={`flex items-end gap-2 max-w-[75%] ${isMine ? "flex-row-reverse" : "flex-row"}`}>

        {/* 수신 메시지 아바타 */}
        {!isMine && (
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold self-end mb-0.5 ${isLastInGroup ? avatarColor(senderId) : "invisible bg-transparent"}`}>
            {isLastInGroup ? initial(senderName) : ""}
          </div>
        )}

        <div className="flex flex-col items-start gap-0.5">
          {/* 발신자 이름 (첫 번째 메시지에만) */}
          {!isMine && isFirstInGroup && senderName && (
            <span className="text-xs text-slate-500 font-medium ml-1 mb-0.5">{senderName}</span>
          )}

          <div className={`flex items-end gap-1.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`px-3.5 py-2 text-sm leading-relaxed shadow-sm ${bubbleCls}`}>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
            {isLastInGroup && time && (
              <span className="text-[10px] text-slate-400 flex-shrink-0 pb-1 whitespace-nowrap">{time}</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TextMessage;
