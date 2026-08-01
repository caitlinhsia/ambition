"use client";

/**
 * A tiny bar chart for a tracker's recent history. Deliberately unlabelled and
 * gridless — it's there to show shape, not to be read precisely, and a chart
 * with no target line can't make a low day look like a failure.
 */
export default function Sparkline({
  series,
  unit,
}: {
  series: { day: string; value: number }[];
  unit: string;
}) {
  const max = Math.max(1, ...series.map((d) => d.value));
  const total = series.reduce((a, d) => a + d.value, 0);
  const best = Math.max(...series.map((d) => d.value));

  return (
    <div className="spark-wrap">
      <div className="spark-bars" role="img" aria-label={`last ${series.length} days`}>
        {series.map((d, i) => (
          <span
            key={d.day}
            className={"sbar" + (i === series.length - 1 ? " now" : "")}
            style={{ height: `${d.value === 0 ? 3 : Math.max(12, (d.value / max) * 100)}%` }}
            title={`${d.day}: ${d.value} ${unit}`}
          />
        ))}
      </div>
      <div className="spark-meta">
        <span>
          {total} {unit} over {series.length} days
        </span>
        {best > 0 ? <span>best {best}</span> : null}
      </div>
    </div>
  );
}
