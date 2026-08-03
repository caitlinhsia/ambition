"use client";

import { Receipt, State, streakOf, today } from "@/lib/store";
import { cloudEnabled } from "@/lib/cloud";
import WeekOverview from "./WeekOverview";

/**
 * Everything you've done, in one place. This used to live on the home screen
 * as a wall of stat panels — it belongs here, behind a tap, so home can be
 * the one thing you're actually working on.
 */
export default function Record({
  state,
  onExport,
  onWipe,
}: {
  state: State;
  onExport: () => void;
  onWipe: () => void | Promise<void>;
}) {
  const t = today();
  const startedToday = state.receipts.filter(
    (r) => new Date(r.at).toISOString().slice(0, 10) === t
  ).length;
  const bestRun = state.habits.reduce((m, h) => Math.max(m, streakOf(h.days).run), 0);
  const wallsDown = state.walls.filter(
    (w) => w.bricks.length > 0 && !w.bricks.some((b) => b.state === "in")
  ).length;
  const receipts: Receipt[] = state.receipts;

  return (
    <>
      <div className="panel">
        <div className="tiles">
          <div className="tile">
            <span className="tn">{state.started}</span>
            <span className="tl">bricks out</span>
          </div>
          <div className="tile">
            <span className="tn">{startedToday}</span>
            <span className="tl">today</span>
          </div>
          <div className="tile">
            <span className="tn">{wallsDown}</span>
            <span className="tl">walls down</span>
          </div>
          <div className="tile">
            <span className="tn">{bestRun}</span>
            <span className="tl">best run</span>
          </div>
        </div>
      </div>

      <WeekOverview state={state} />

      <div className="panel flat">
        <h2 className="h">everything, most recent first</h2>
        {receipts.length === 0 ? (
          <p className="empty">nothing here yet. your first one lands here.</p>
        ) : (
          <ul className="list">
            {receipts.slice(0, 60).map((r) => (
              <li key={r.id}>
                <span className="grow">
                  <span className="when">
                    {new Date(r.at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                    {r.feeling ? ` · felt ${r.feeling}` : ""}
                  </span>
                  <span className="what">{r.text}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="row" style={{ marginTop: 20 }}>
          <button className="btn ghost" onClick={onExport}>
            export it
          </button>
          <button
            className="btn ghost"
            onClick={() => {
              const warning = cloudEnabled
                ? "erase everything, on every device this account is signed into? this can't be undone."
                : "erase everything? this can't be undone.";
              if (confirm(warning)) onWipe();
            }}
          >
            erase everything
          </button>
        </div>
        <p className="note" style={{ margin: "12px 0 0" }}>
          {cloudEnabled
            ? "your data, stored under your account and synced across your devices."
            : "your data, stored on this device."}
        </p>
      </div>
    </>
  );
}
