"use client";

import { useState } from "react";
import { Account, signIn, signUp } from "@/lib/account";

/**
 * Sign up / sign in. Kept to a single field on purpose — every extra box is
 * another reason to close the tab, and the whole product is about lowering
 * the cost of starting.
 */
export default function Auth({
  onIn,
  onSkip,
}: {
  onIn: (a: Account) => void;
  onSkip: () => void;
}) {
  const [mode, setMode] = useState<"up" | "in">("up");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = mode === "up" ? signUp(email) : signIn(email);
    if (res.ok) {
      setError("");
      onIn(res.account);
    } else {
      setError(res.error);
    }
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

      <div className="row" style={{ marginTop: 16 }}>
        <button
          className="link"
          style={{ marginTop: 0 }}
          onClick={() => {
            setMode(mode === "up" ? "in" : "up");
            setError("");
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
