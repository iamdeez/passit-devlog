import { Button } from "./Button";

export function EmptyState({ icon = "inbox", title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      {title && <p className="text-base font-display font-semibold text-on-surface">{title}</p>}
      {description && <p className="text-sm text-on-surface-variant max-w-xs">{description}</p>}
      {action && (
        <Button variant="outlined" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
