"use client";

import { useState } from "react";
import { DayLog, JournalEntry, Tracker, today } from "@/lib/store";
import { DAY_MOODS, WEATHER, weatherOf } from "@/lib/daily";
import { celebrate } from "./Celebrate";
import DayBars from "./DayBars";

/**
 * The day, at three levels of effort: two taps, a few bars, or a line of
 * writing. All three are optional and none of them nags — the moment
 * journalling becomes an obligation, people stop.
 */
export default function Journal({
  entries,
  dayLogs,
  trackers,
  onAdd,
  onRemove,
  onDayLog,
  onAddTracker,
  onBump,
  onSetCount,
  onSetGoal,
  onRemoveTracker,
}: {
  entries: JournalEntry[];
  dayLogs: Record<string, DayLog>;
  trackers: Tracker[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onDayLog: (field: keyof DayLog, value: string | null) => void;
  onAddTracker: (name: string, unit: string) => void;
  onBump: (id: string, by: number) => void;
  onSetCount: (id: string, n: number) => void;
  onSetGoal: (id: string, goal: number | null) => void;
  onRemoveTracker: (id: string) => void;
}) {
  const [text, setText] = useState("");
  const t = today();
  const log = dayLogs[t] ?? {};
  const todays = entries.filter((e) => e.day === t);
  const earlier = entries.filter((e) => e.day !== t);

  return (
    <>
      <div className="panel">
        <h2 className="h">how was today</h2>
        <p className="sub">two taps. skip either one.</p>

        <p className="dblabel">the weather</p>
        <div className="chips">
          {WEATHER.map((w) => (
            <button
              key={w.key}
              className={"chip" + (log.weather === w.key ? " sel" : "")}
              onClick={(e) => {
                if (log.weather !== w.key) celebrate(e.currentTarget);
                onDayLog("weather", log.weather === w.key ? null : w.key);
              }}
              aria-pressed={log.weather === w.key}
            >
              <span className="mark">{w.mark}</span> {w.label}
            </button>
          ))}
        </div>

        <p className="dblabel">how you felt</p>
        <div className="chips">
          {DAY_MOODS.map((m) => (
            <button
              key={m.key}
              className={"chip" + (log.mood === m.key ? " sel" : "")}
              onClick={(e) => {
                if (log.mood !== m.key) celebrate(e.currentTarget);
                onDayLog("mood", log.mood === m.key ? null : m.key);
              }}
              aria-pressed={log.mood === m.key}
            >
              {m.label}
            </button>
          ))}
        </div>

        {log.weather || log.mood ? (
          <p className="note" style={{ margin: "16px 0 0" }}>
            logged. tap it again to clear it.
          </p>
        ) : null}
      </div>

      <DayBars
        trackers={trackers}
        onAdd={onAddTracker}
        onBump={onBump}
        onSet={onSetCount}
        onGoal={onSetGoal}
        onRemove={onRemoveTracker}
      />

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
            {earlier.slice(0, 40).map((e) => {
              const past = dayLogs[e.day] ?? {};
              const w = weatherOf(past.weather);
              return (
                <li key={e.id}>
                  <span className="grow">
                    <span className="when">
                      {new Date(e.at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                      {w ? <span className="mark past"> {w.mark}</span> : null}
                      {past.mood ? <span className="past"> {past.mood}</span> : null}
                    </span>
                    <span className="what">{e.text}</span>
                  </span>
                  <button className="iconbtn" onClick={() => onRemove(e.id)} aria-label="remove entry">
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </>
  );
}
