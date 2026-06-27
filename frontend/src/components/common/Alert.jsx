const TYPE_MAP = {
  success: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", icon: "check_circle" },
  error:   { bg: "bg-red-50 border-red-200",         text: "text-red-800",     icon: "error" },
  warning: { bg: "bg-amber-50 border-amber-200",     text: "text-amber-800",   icon: "warning" },
  info:    { bg: "bg-secondary-container border-outline-variant/30",        text: "text-secondary",    icon: "info" },
};

export function Alert({ type = "info", message, onClose, children }) {
  const { bg, text, icon } = TYPE_MAP[type] || TYPE_MAP.info;
  const content = message || children;
  if (!content) return null;

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${bg}`} role="alert">
      <span className={`material-symbols-outlined text-lg mt-0.5 flex-shrink-0 ${text}`} style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      <p className={`text-sm flex-1 ${text}`}>{content}</p>
      {onClose && (
        <button onClick={onClose} className={`${text} hover:opacity-70 transition-opacity flex-shrink-0`} aria-label="닫기">
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      )}
    </div>
  );
}
