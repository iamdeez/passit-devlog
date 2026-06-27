const SIZE_MAP = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };

export function Spinner({ size = "md", className = "" }) {
  return (
    <div
      className={`${SIZE_MAP[size] || SIZE_MAP.md} ${className} animate-spin rounded-full border-2 border-outline-variant border-t-primary`}
      role="status"
      aria-label="로딩 중"
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Spinner size="lg" />
    </div>
  );
}
