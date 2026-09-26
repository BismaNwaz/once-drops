/** Edition meter: sold (ink), on hold (hatched), remaining (empty). */
export function StockBar({
  sold, held, editionSize, compact = false,
}: { sold: number; held: number; editionSize: number; compact?: boolean }) {
  const soldPct = (sold / editionSize) * 100;
  const heldPct = (Math.min(held, editionSize - sold) / editionSize) * 100;
  const left = Math.max(editionSize - sold - held, 0);
  return (
    <div>
      <div className={`relative w-full overflow-hidden rounded-full bg-paper-2 ${compact ? "h-1" : "h-1.5"}`}>
        <div className="absolute inset-y-0 left-0 bg-ink transition-all duration-700" style={{ width: `${soldPct}%` }} />
        <div
          className="absolute inset-y-0 transition-all duration-700"
          style={{
            left: `${soldPct}%`,
            width: `${heldPct}%`,
            background: "repeating-linear-gradient(45deg,#8a2e1c 0 3px,#d9a597 3px 6px)",
          }}
        />
      </div>
      {!compact && (
        <div className="mt-2.5 flex justify-between text-[13px] text-muted tabular">
          <span>
            <span className="font-medium text-ink">{left}</span> of {editionSize} remain
          </span>
          {held > 0 && <span className="text-accent">{held} on hold right now</span>}
        </div>
      )}
    </div>
  );
}
