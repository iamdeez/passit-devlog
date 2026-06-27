export function Button({ variant = "filled", size = "md", children, className = "", ...rest }) {
  const base = "font-display font-bold rounded-xl transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5";
  const variants = {
    filled:   "bg-primary text-on-primary hover:bg-primary-dim",
    outlined: "border border-primary text-primary hover:bg-primary/10",
    ghost:    "text-primary hover:bg-primary/10",
  };
  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
