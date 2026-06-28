import React from "react";
import { Outlet, useMatch } from "react-router-dom";
import ChatListPage from "../pages/chat/ChatListPage";

export default function ChatLayout() {
  const roomMatch = useMatch("/chat/:chatroomId");
  const hasRoom = !!roomMatch;

  return (
    <div className="h-[calc(100vh-64px)] mt-16 flex bg-background overflow-hidden">
      {/* List panel */}
      <div
        className={`flex-col flex-shrink-0 border-r border-outline-variant/30 bg-surface-container-lowest overflow-hidden
          ${hasRoom ? "hidden" : "flex w-full"}`}
      >
        <ChatListPage embedded />
      </div>

      {/* Room panel */}
      <div
        className={`flex-1 overflow-hidden flex-col
          ${hasRoom ? "flex" : "hidden"}`}
      >
        {hasRoom ? (
          <Outlet />
        ) : (
          <div className="flex-1 h-full flex flex-col items-center justify-center gap-4 bg-surface-container-low p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-secondary">chat</span>
            </div>
            <div>
              <p className="font-display font-semibold text-on-surface mb-1">채팅방을 선택하세요</p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                왼쪽 목록에서 대화할 채팅방을<br />선택해주세요
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
