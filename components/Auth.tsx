"use client";

import { useState } from "react";
import { Account, AuthStep, begin, finish, needsCode, normalizeEmail } from "@/lib/account";

/**
 * Sign up / sign in.
 *
 * One field where one field is enough. When this deployment syncs, there's a
 * second step for the code from your inbox — the app has no password, so
 * proving you can read the address is what stops anyone typing your email and
 * reading your journal.
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
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  /** The mode that would have worked, when the one you used didn't. */
  const [fix, setFix] = useState<"up" | "in" | null>(null);

  function handle(res: AuthStep, as: "up" | "in") {
    if (!res.ok) {
      setError(res.error);
      setFix(res.then ?? null);
      return;
    }
    setError("");
    setFix(null);
    if ("codeSent" in res) setSent(true);
    else onIn(res.account, as);
  }

  async function attempt(as: "up" | "in") {
    setBusy(true);
    try {
      handle(await begin(email, as), as);
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    try {
      handle(await finish(email, code), mode);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="panel">
        <p className="eyebrow">{normalizeEmail(email)}</p>
        <h2 className="h">check your email</h2>
        <p className="sub">
          a six-digit code is on its way. it only works for a few minutes, so grab it now.
        </p>

        <form className="field" onSubmit={submitCode}>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            aria-label="the code from your email"
          />
          <button className="btn primary" type="submit" disabled={busy}>
            {busy ? "checking…" : "let me in"}
          </button>
        </form>

        {error ? (
          <p className="note" style={{ color: "var(--flag)", margin: "10px 0 0" }} role="alert">
            {error}
          </p>
        ) : null}

        <div className="row" style={{ marginTop: 16 }}>
          <button className="link" style={{ marginTop: 0 }} disabled={busy} onClick={() => attempt(mode)}>
            send another →
          </button>
        </div>
        <button
          className="link"
          onClick={() => {
            setSent(false);
            setCode("");
            setError("");
          }}
        >
          ← different email
        </button>

        <p className="note" style={{ margin: "16px 0 0" }}>
          nothing arrived? it can take a minute, and it does end up in spam sometimes.
        </p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2 className="h">{mode === "up" ? "create an account" : "sign in"}</h2>
      <p className="sub">
        {mode === "up"
          ? "your habits, streaks and history get saved under your email."
          : "use the email you signed up with."}
      </p>

      <form
        className="field"
        onSubmit={(e) => {
          e.preventDefault();
          attempt(mode);
        }}
      >
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@wherever.com"
          aria-label="your email"
        />
        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? "…" : needsCode ? "send me a code" : mode === "up" ? "sign up" : "sign in"}
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
          disabled={busy}
          onClick={() => {
            setMode(fix);
            attempt(fix);
          }}
        >
          {fix === "in"
            ? `sign in as ${normalizeEmail(email)} →`
            : `create it with ${normalizeEmail(email)} →`}
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
        {needsCode
          ? "no password — just a code emailed to you. your account opens on any device, and you can export or erase everything any time."
          : "no password needed. your data stays on this device and you can export or erase it any time."}
      </p>
    </div>
  );
}
