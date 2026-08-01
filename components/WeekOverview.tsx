"use client";

import { State } from "@/lib/store";
import { activeDays, dayLetters, milestoneFor, startsPerDay } from "@/lib/history";

/**
 * The week at a glance. This exists because everything else in the app resets
 * at midnight — without it there's no evidence you've been doing this longer
 * than today.
 */
export default function WeekOverview({ state }: { state: State }) {
  const days = startsPerDay(state.receipts, 7);
  const letters = dayLetters(days.map((d) => d.day));
  const max = Math.max(1, ...days.map((d) => d.count));
  const active = activeDays(state.receipts, 7);
  const weekTotal = days.reduce((a, d) => a + d.count, 0);
  const { hit, next } = milestoneFor(state.started);

  return (
    <div className="panel">
      <h2 className="h">your week</h2>
      <p className="sub">
        {weekTotal === 0
          ? "nothing logged in the last 7 days. today's a good day to change that."
          : `${weekTotal} starts across ${active} of the last 7 days.`}
      </p>

      <div className="weekchart">
        {days.map((d, i) => (
          <div key={d.day} className="wcol">
            <div className="wbar-track">
              <div
                className={"wbar" + (i === days.length - 1 ? " now" : "")}
                style={{ height: d.count === 0 ? "2px" : `${Math.max(14, (d.count / max) * 100)}%` }}
                title={`${d.day}: ${d.count}`}
              />
            </div>
            <span className="wnum">{d.count > 0 ? d.count : ""}</span>
            <span className="wl">{letters[i]}</span>
          </div>
        ))}
      </div>

      <div className="milestone">
        {hit > 0 ? (
          <span className="ms-hit">{hit}+ starts so far</span>
        ) : (
          <span className="ms-hit">just getting going</span>
        )}
        {next ? (
          <span className="ms-next">
            {next - state.started} more to {next}
          </span>
        ) : null}
      </div>
      {next ? (
        <div className="ms-track" aria-hidden="true">
          <div
            className="ms-fill"
            style={{
              width: `${Math.min(100, ((state.started - hit) / (next - hit)) * 100)}%`,
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
