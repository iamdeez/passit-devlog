export function Pagination({ totalPages, currentPage, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  const left = Math.max(1, currentPage - delta);
  const right = Math.min(totalPages, currentPage + delta);

  for (let i = left; i <= right; i++) pages.push(i);

  const btnBase = "w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all";
  const activeBtn = `${btnBase} bg-primary text-on-primary`;
  const inactiveBtn = `${btnBase} text-on-surface-variant hover:bg-surface-container`;
  const arrowBtn = `${btnBase} text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed`;

  return (
    <div className="flex items-center justify-center gap-1">
      <button className={arrowBtn} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="이전">
        <span className="material-symbols-outlined text-base">chevron_left</span>
      </button>

      {left > 1 && (
        <>
          <button className={inactiveBtn} onClick={() => onPageChange(1)}>1</button>
          {left > 2 && <span className="w-9 h-9 flex items-center justify-center text-on-surface-variant text-sm">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button key={p} className={p === currentPage ? activeBtn : inactiveBtn} onClick={() => onPageChange(p)}>
          {p}
        </button>
      ))}

      {right < totalPages && (
        <>
          {right < totalPages - 1 && <span className="w-9 h-9 flex items-center justify-center text-on-surface-variant text-sm">…</span>}
          <button className={inactiveBtn} onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}

      <button className={arrowBtn} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label="다음">
        <span className="material-symbols-outlined text-base">chevron_right</span>
      </button>
    </div>
  );
}
