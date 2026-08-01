"use client";

import { Receipt } from "@/lib/store";

/**
 * Receipts exist for one reason: to be counter-evidence to the "i never do
 * anything" story. Plain list, no graphs — a graph can look bad, and this
 * never should.
 */
export default function Receipts({
  receipts,
  onExport,
  onWipe,
}: {
  receipts: Receipt[];
  onExport: () => void;
  onWipe: () => void;
}) {
  return (
    <div className="panel">
      
      <h2 className="h">everything you&apos;ve started</h2>
      <p className="sub">
        proof you keep showing up. most recent first.
      </p>

      {receipts.length === 0 ? (
        <p className="empty">your first one lands here.</p>
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
            if (confirm("erase everything? this can't be undone.")) onWipe();
          }}
        >
          erase everything
        </button>
      </div>
      <p className="note" style={{ margin: "12px 0 0" }}>
        your data, stored on this device.
      </p>
    </div>
  );
}
