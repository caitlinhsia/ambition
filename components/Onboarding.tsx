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
        
        <h2 className="h">{result.name}</h2>
        <p className="body">{result.blurb}</p>
        <p className="sub" style={{ marginTop: 18 }}>
          two optional details, so budg3 can tailor things.
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
          done
        </button>
        <p className="note" style={{ margin: "12px 0 0" }}>
          stays on your device. not a real personality test — just a way to tailor what you see.
        </p>
      </div>
    );
  }

  const q = QUIZ[i];
  return (
    <div className="panel">
      <p className="eyebrow">{i + 1} of {QUIZ.length}</p>
      <h2 className="h">{q.q}</h2>
      <p className="sub">no wrong answers.</p>
      <div className="chips">
        {q.a.map((opt) => (
          <button key={opt.label} className="chip" onClick={() => answer(opt.axis, opt.value)}>
            {opt.label}
          </button>
        ))}
      </div>
      <button className="link" onClick={() => onDone({})}>
        skip the quiz →
      </button>
    </div>
  );
}
