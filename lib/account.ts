"use client";

// Accounts — the one place that knows how signing in works.
//
// There are two modes and the app can't tell them apart:
//
//   local  (no Supabase env vars)  an account is a name for a slot in this
//                                  browser's localStorage. Nothing leaves the
//                                  device. No code, no password, because
//                                  there's nothing to protect it from — it's
//                                  your device already.
//
//   cloud  (env vars set)          a real account, verified by a code sent to
//                                  the address, with data in Postgres. The
//                                  same account opens on any device.
//
// Everything else in the app goes through `begin` / `finish` / `signOut` /
// `currentAccount` and doesn't care which mode is running.

import {
  cloudEnabled,
  cloudSignOut,
  currentCloudUser,
  checkCode,
  sendCode,
} from "./cloud";

export type Account = {
  email: string;
  createdAt: number;
  /** Server user id. Absent in local mode. */
  id?: string;
};

const ACTIVE = "budg3.active";
const ACCOUNTS = "budg3.accounts";

/** In cloud mode, signing in takes a code from your inbox. */
export const needsCode = cloudEnabled;

function readAccounts(): Record<string, Account> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(ACCOUNTS) ?? "{}") as Record<string, Account>;
  } catch {
    return {};
  }
}

function writeAccounts(a: Record<string, Account>) {
  try {
    window.localStorage.setItem(ACCOUNTS, JSON.stringify(a));
  } catch {
    // storage blocked — the session still works, it just won't be remembered
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** `then` names the mode that would have worked, so the interface can offer
 *  it as one tap instead of leaving you to spot the link yourself. */
export type AuthStep =
  | { ok: true; account: Account }
  | { ok: true; codeSent: true }
  | { ok: false; error: string; then?: "up" | "in" };

const BAD_EMAIL = { ok: false, error: "that email looks off. mind checking it?" } as const;

/**
 * Step one. In local mode this is the whole thing; in cloud mode it sends a
 * code and you come back through `finish`.
 */
export async function begin(emailRaw: string, mode: "up" | "in"): Promise<AuthStep> {
  const email = normalizeEmail(emailRaw);
  if (!isEmail(email)) return BAD_EMAIL;

  if (cloudEnabled) {
    const res = await sendCode(email, mode === "up");
    if (!res.ok) {
      // Only the sign-in-with-no-account case has an obvious other button.
      return { ok: false, error: res.error, then: /no account/.test(res.error) ? "up" : undefined };
    }
    return { ok: true, codeSent: true };
  }

  const accounts = readAccounts();
  if (mode === "up") {
    if (accounts[email]) {
      return { ok: false, error: "you've already got an account with that email.", then: "in" };
    }
    const account: Account = { email, createdAt: Date.now() };
    accounts[email] = account;
    writeAccounts(accounts);
    setActive(email);
    return { ok: true, account };
  }

  const account = accounts[email];
  if (!account) {
    return { ok: false, error: "no account on this device with that email yet.", then: "up" };
  }
  setActive(email);
  return { ok: true, account };
}

/** Step two, cloud mode only: swap the emailed code for a session. */
export async function finish(emailRaw: string, code: string): Promise<AuthStep> {
  const email = normalizeEmail(emailRaw);
  if (!cloudEnabled) return { ok: false, error: "this deployment doesn't use codes." };

  const res = await checkCode(email, code);
  if (!res.ok) return { ok: false, error: res.error };

  const account: Account = { email: res.email || email, createdAt: Date.now(), id: res.id };
  // Remembered locally too, so the device knows whose data it's holding while
  // offline. The session itself is Supabase's to keep.
  const accounts = readAccounts();
  accounts[account.email] = { ...accounts[account.email], ...account };
  writeAccounts(accounts);
  setActive(account.email);
  return { ok: true, account };
}

function setActive(email: string) {
  try {
    window.localStorage.setItem(ACTIVE, email);
  } catch {
    // storage blocked — this session still works
  }
}

export async function currentAccount(): Promise<Account | null> {
  if (typeof window === "undefined") return null;

  if (cloudEnabled) {
    const user = await currentCloudUser();
    if (!user) return null;
    const known = readAccounts()[normalizeEmail(user.email)];
    return { email: user.email, createdAt: known?.createdAt ?? Date.now(), id: user.id };
  }

  const email = window.localStorage.getItem(ACTIVE);
  if (!email) return null;
  return readAccounts()[email] ?? null;
}

export async function signOut(): Promise<void> {
  try {
    window.localStorage.removeItem(ACTIVE);
  } catch {
    // nothing to clear
  }
  if (cloudEnabled) await cloudSignOut();
}

/**
 * Storage key for one account's data on this device.
 *
 * Keyed by server id in cloud mode so that changing the email on an account
 * doesn't strand its data, and by email in local mode where there is no id.
 */
export function dataKeyFor(account: Account | null): string {
  if (!account) return "budg3.v1.guest";
  return account.id ? `budg3.v1.u.${account.id}` : `budg3.v1.${account.email}`;
}
