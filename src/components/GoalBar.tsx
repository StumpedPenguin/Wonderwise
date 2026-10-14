// A kid's savings-goal progress bar: how close their balance is to a prize.
export function GoalBar({
  emoji,
  name,
  cost,
  balance,
}: {
  emoji: string;
  name: string;
  cost: number;
  balance: number;
}) {
  const pct = cost > 0 ? Math.min(100, Math.round((balance / cost) * 100)) : 0;
  const toGo = Math.max(0, cost - balance);
  const reached = toGo === 0;

  return (
    <div className="rounded-4xl bg-white p-4 shadow-md ring-2 ring-amber-100">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-bold text-slate-700">
            Saving for {name}
          </p>
          <p className="text-xs font-semibold text-slate-400">
            {reached ? "You have enough! 🎉" : `${toGo} to go`}
          </p>
        </div>
        <span className="font-display font-bold tabular-nums text-amber-600">
          {balance}/{cost} 🪙
        </span>
      </div>
      <div className="mt-2 h-4 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${
            reached
              ? "bg-gradient-to-r from-emerald-400 to-teal-400"
              : "bg-gradient-to-r from-amber-400 to-orange-400"
          }`}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
    </div>
  );
}
