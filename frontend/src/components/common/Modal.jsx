import { useEffect } from "react";

export function Modal({ isOpen, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widths[size] || widths.md} bg-surface-container-lowest rounded-2xl shadow-xl animate-fade-in`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
            <h2 className="text-lg font-display font-bold text-on-surface">{title}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors" aria-label="닫기">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
