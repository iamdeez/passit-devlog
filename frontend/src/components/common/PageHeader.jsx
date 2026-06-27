export default function PageHeader({ icon, title, subtitle, action }) {
  return (
    <div className="mt-16 bg-primary">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
          )}
          <div>
            <h1 className="text-base md:text-lg font-display font-bold text-on-primary leading-tight">{title}</h1>
            {subtitle && <p className="text-xs md:text-sm text-on-primary/70 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
