"use client";

import { useState } from "react";
import { Axis, QUIZ, StartingType, scoreQuiz } from "@/lib/quiz";

/**
 * First run. A short, playful quiz that hands back a starting type — a mirror,
 * not a diagnosis. Skippable at every step, and everything stays on device.
 */
export default function Onboarding({
  onDone,
}: {
  onDone: (p: { typeKey?: string; age?: string; gender?: string }) => void;
}) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<{ axis: Axis; value: number }[]>([]);
  const [result, setResult] = useState<StartingType | null>(null);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  function answer(axis: Axis, value: number) {
    const next = [...answers, { axis, value }];
    setAnswers(next);
    if (i + 1 >= QUIZ.length) {
      setResult(scoreQuiz(next));
    } else {
      setI(i + 1);
    }
  }

  if (result) {
    return (
      <div className="panel">
        <p className="eyebrow">// your starting type</p>
        <h2 className="h">{result.name}</h2>
        <p className="body">{result.blurb}</p>
        <p className="sub" style={{ marginTop: 18 }}>
          two last things, both optional — they just help budge pick its words.
        </p>
        <div className="field" style={{ marginBottom: 10 }}>
          <input
            type="text"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="age (optional)"
            aria-label="age, optional"
          />
          <input
            type="text"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            placeholder="gender (optional, however you like)"
            aria-label="gender, optional"
          />
        </div>
        <button
          className="btn primary big"
          onClick={() => onDone({ typeKey: result.key, age: age.trim(), gender: gender.trim() })}
        >
          okay, let&apos;s start
        </button>
        <p className="note" style={{ margin: "12px 0 0" }}>
          this never leaves your device. it&apos;s not a personality test and it isn&apos;t science —
          just a way for budge to know how to talk to you.
        </p>
      </div>
    );
  }

  const q = QUIZ[i];
  return (
    <div className="panel">
      <p className="eyebrow">
        // {i + 1} of {QUIZ.length}
      </p>
      <h2 className="h">{q.q}</h2>
      <p className="sub">no wrong answers. it&apos;s just so budge knows how to talk to you.</p>
      <div className="chips">
        {q.a.map((opt) => (
          <button key={opt.label} className="chip" onClick={() => answer(opt.axis, opt.value)}>
            {opt.label}
          </button>
        ))}
      </div>
      <button className="link" onClick={() => onDone({})}>
        skip this, i just want to start →
      </button>
    </div>
  );
}
