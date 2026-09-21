export function TokenBadge({
  amount,
  size = "md",
}: {
  amount: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-base px-3 py-1",
    md: "text-xl px-4 py-1.5",
    lg: "text-3xl px-6 py-2.5",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full bg-coin-soft font-display font-bold text-amber-700 shadow-sm ${sizes[size]}`}
    >
      <span aria-hidden>🪙</span>
      <span className="tabular-nums">{amount}</span>
    </span>
  );
}
