export function CategoryPill({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-sm transition-colors whitespace-nowrap ${
        active
          ? "bg-primary text-primary-foreground shadow-[0_0_0_1px_hsla(0,0%,100%,0.08)_inset]"
          : "bg-card/40 text-muted-foreground hover:text-foreground hover:bg-card"
      }`}
    >
      {label} {count !== undefined && <span className="opacity-60">({count})</span>}
    </button>
  );
}