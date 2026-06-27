import React, { useState, useRef, useCallback } from "react";

const MessageInput = ({ onSend, roomStatus }) => {
  const [text, setText] = useState("");
  const isSubmitting = useRef(false);
  const textareaRef = useRef(null);
  const isLocked = roomStatus === "LOCK";

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const handleChange = (e) => {
    setText(e.target.value);
    autoResize();
  };

  const submit = useCallback(() => {
    if (!text.trim() || isLocked || isSubmitting.current) return;
    isSubmitting.current = true;
    onSend(text);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setTimeout(() => { isSubmitting.current = false; }, 300);
  }, [text, isLocked, onSend]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const canSend = text.trim().length > 0 && !isLocked;

  return (
    <div className="flex-shrink-0 bg-white border-t border-slate-200 px-4 py-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isLocked}
          placeholder={isLocked ? "채팅이 잠겨 있습니다" : "메시지를 입력하세요  (Shift+Enter: 줄바꿈)"}
          className="flex-1 resize-none rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm text-on-surface placeholder:text-outline outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 focus:bg-white transition-all duration-150 leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minHeight: "40px", maxHeight: "120px" }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-150 active:scale-[0.90] ${
            canSend
              ? "bg-primary text-on-primary hover:bg-primary-dim"
              : "bg-slate-100 text-slate-300 cursor-not-allowed"
          }`}
          aria-label="전송"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-px">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
