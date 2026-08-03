"use client";

import { useState } from "react";
import { Account, normalizeEmail, signIn, signUp } from "@/lib/account";

/**
 * Sign up / sign in. Kept to a single field on purpose — every extra box is
 * another reason to close the tab, and the whole product is about lowering
 * the cost of starting.
 */
export default function Auth({
  initialMode = "up",
  onIn,
  onSkip,
}: {
  initialMode?: "up" | "in";
  onIn: (a: Account, mode: "up" | "in") => void;
  onSkip: () => void;
}) {
  const [mode, setMode] = useState<"up" | "in">(initialMode);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  /** The mode that would have worked, when the one you used didn't. */
  const [fix, setFix] = useState<"up" | "in" | null>(null);

  function attempt(as: "up" | "in") {
    const res = as === "up" ? signUp(email) : signIn(email);
    if (res.ok) {
      setError("");
      setFix(null);
      onIn(res.account, as);
    } else {
      setError(res.error);
      setFix(res.then ?? null);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    attempt(mode);
  }

  return (
    <div className="panel">
      
      <h2 className="h">{mode === "up" ? "create an account" : "sign in"}</h2>
      <p className="sub">
        {mode === "up"
          ? "your habits, streaks and history get saved under your email."
          : "use the email you signed up with."}
      </p>

      <form className="field" onSubmit={submit}>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@wherever.com"
          aria-label="your email"
        />
        <button className="btn primary" type="submit">
          {mode === "up" ? "sign up" : "sign in"}
        </button>
      </form>

      {error ? (
        <p className="note" style={{ color: "var(--flag)", margin: "10px 0 0" }} role="alert">
          {error}
        </p>
      ) : null}

      {/* Being told the other button was the right one, with no way to press
          it from here, is the annoying half of this. So offer it. */}
      {fix ? (
        <button
          className="btn ghost"
          style={{ marginTop: 12 }}
          onClick={() => {
            setMode(fix);
            attempt(fix);
          }}
        >
          {fix === "in" ? `sign in as ${normalizeEmail(email)} →` : `create it with ${normalizeEmail(email)} →`}
        </button>
      ) : null}

      <div className="row" style={{ marginTop: 16 }}>
        <button
          className="link"
          style={{ marginTop: 0 }}
          onClick={() => {
            setMode(mode === "up" ? "in" : "up");
            setError("");
            setFix(null);
          }}
        >
          {mode === "up" ? "already have one? sign in →" : "new here? sign up →"}
        </button>
      </div>

      <button className="link" onClick={onSkip}>
        skip for now →
      </button>

      <p className="note" style={{ margin: "16px 0 0" }}>
        no password needed. your data stays on this device and you can export or erase it any time.
      </p>
    </div>
  );
}
