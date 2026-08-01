"use client";

import { useState } from "react";
import { JournalEntry, today } from "@/lib/store";
import { celebrate } from "./Celebrate";

/**
 * One line a day. Kept to a single field with no prompts, no mood scale and no
 * streak — the moment journalling becomes an obligation, people stop.
 */
export default function Journal({
  entries,
  onAdd,
  onRemove,
}: {
  entries: JournalEntry[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
}) {
  const [text, setText] = useState("");
  const t = today();
  const todays = entries.filter((e) => e.day === t);
  const earlier = entries.filter((e) => e.day !== t);

  return (
    <>
      <div className="panel">
        <h2 className="h">one line about today</h2>
        <p className="sub">
          {todays.length > 0
            ? "add another if you want. no rules here."
            : "anything. good, bad, boring. it's just for you."}
        </p>

        <form
          className="field"
          onSubmit={(e) => {
            e.preventDefault();
            const v = text.trim();
            if (!v) return;
            onAdd(v);
            setText("");
          }}
        >
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="today was…"
            aria-label="journal entry"
          />
          <button
            className="btn primary"
            type="submit"
            onClick={(e) => {
              if (text.trim()) celebrate(e.currentTarget);
            }}
          >
            save
          </button>
        </form>

        {todays.length > 0 ? (
          <ul className="list">
            {todays.map((e) => (
              <li key={e.id}>
                <span className="grow">
                  <span className="what">{e.text}</span>
                  <span className="when">
                    {new Date(e.at).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
                <button className="iconbtn" onClick={() => onRemove(e.id)} aria-label="remove entry">
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {earlier.length > 0 ? (
        <div className="panel flat">
          <h2 className="h">before this</h2>
          <ul className="list">
            {earlier.slice(0, 40).map((e) => (
              <li key={e.id}>
                <span className="grow">
                  <span className="when">
                    {new Date(e.at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="what">{e.text}</span>
                </span>
                <button className="iconbtn" onClick={() => onRemove(e.id)} aria-label="remove entry">
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
