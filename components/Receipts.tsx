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
      <p className="eyebrow">// receipts</p>
      <h2 className="h">you did this.</h2>
      <p className="sub">
        proof, for the days your brain insists you never do anything. it&apos;s more than you think.
      </p>

      {receipts.length === 0 ? (
        <p className="empty">nothing here yet. that&apos;s fine. want to start something?</p>
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
            if (confirm("erase everything budg3 remembers? this can't be undone.")) onWipe();
          }}
        >
          erase everything
        </button>
      </div>
      <p className="note" style={{ margin: "12px 0 0" }}>
        it&apos;s yours. it lives in this browser and nowhere else.
      </p>
    </div>
  );
}
