export function Input({ label, error, hint, className = "", ...rest }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-on-surface">{label}</label>}
      <input className={`input-base ${error ? "border-error focus:ring-error/20 focus:border-error" : ""} ${className}`} {...rest} />
      {error && <p className="text-xs text-error">{error}</p>}
      {!error && hint && <p className="text-xs text-on-surface-variant">{hint}</p>}
    </div>
  );
}

export function Textarea({ label, error, hint, className = "", ...rest }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-on-surface">{label}</label>}
      <textarea className={`input-base resize-y min-h-[100px] ${error ? "border-error focus:ring-error/20 focus:border-error" : ""} ${className}`} {...rest} />
      {error && <p className="text-xs text-error">{error}</p>}
      {!error && hint && <p className="text-xs text-on-surface-variant">{hint}</p>}
    </div>
  );
}

export function Select({ label, error, hint, children, className = "", ...rest }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-on-surface">{label}</label>}
      <select className={`input-base ${error ? "border-error focus:ring-error/20 focus:border-error" : ""} ${className}`} {...rest}>
        {children}
      </select>
      {error && <p className="text-xs text-error">{error}</p>}
      {!error && hint && <p className="text-xs text-on-surface-variant">{hint}</p>}
    </div>
  );
}
