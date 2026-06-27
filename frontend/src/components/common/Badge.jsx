const COLOR_MAP = {
  primary:   "bg-primary/10 text-primary",
  secondary: "bg-secondary-container text-on-secondary-container",
  tertiary:  "bg-tertiary-container text-on-tertiary-container",
  success:   "bg-emerald-100 text-emerald-700",
  warning:   "bg-amber-100 text-amber-700",
  error:     "bg-error-container/30 text-error",
  surface:   "bg-surface-container text-on-surface-variant",
};

const TICKET_STATUS = {
  AVAILABLE: { label: "판매중",   color: "success" },
  RESERVED:  { label: "예약중",   color: "warning" },
  SOLD:      { label: "판매완료", color: "surface" },
  EXPIRED:   { label: "만료",     color: "error" },
};

const DEAL_STATUS = {
  PENDING:   { label: "대기중",   color: "warning" },
  ACCEPTED:  { label: "수락됨",   color: "primary" },
  REJECTED:  { label: "거절됨",   color: "error" },
  COMPLETED: { label: "완료",     color: "success" },
  CANCELLED: { label: "취소됨",   color: "surface" },
};

export function Badge({ color = "surface", children, className = "" }) {
  const cls = COLOR_MAP[color] || COLOR_MAP.surface;
  return <span className={`badge ${cls} ${className}`}>{children}</span>;
}

export function TicketStatusBadge({ status }) {
  const { label, color } = TICKET_STATUS[status] || { label: status, color: "surface" };
  return <Badge color={color}>{label}</Badge>;
}

export function DealStatusBadge({ status }) {
  const { label, color } = DEAL_STATUS[status] || { label: status, color: "surface" };
  return <Badge color={color}>{label}</Badge>;
}
