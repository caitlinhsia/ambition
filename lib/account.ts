"use client";

// Accounts.
//
// IMPORTANT — read before shipping to real users:
// This module is the ONLY place that knows how accounts are stored. Right now
// it keeps them in localStorage, which means an account is real but *device
// local*: signing in on a phone will not show the data from a laptop. That is
// deliberate — it keeps the app deployable with zero configuration and keeps
// personal data off any server until there's a considered place to put it.
//
// To turn this into real cross-device sync, replace the four functions below
// (signUp / signIn / signOut / currentAccount) with calls to an auth provider
// and a database. Nothing else in the app needs to change: everything reads
// accounts through this interface.

export type Account = { email: string; createdAt: number };

const ACTIVE = "budg3.active";
const ACCOUNTS = "budg3.accounts";

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

export function currentAccount(): Account | null {
  if (typeof window === "undefined") return null;
  const email = window.localStorage.getItem(ACTIVE);
  if (!email) return null;
  return readAccounts()[email] ?? null;
}

export function signUp(emailRaw: string): { ok: true; account: Account } | { ok: false; error: string } {
  const email = normalizeEmail(emailRaw);
  if (!isEmail(email)) return { ok: false, error: "that email looks off. mind checking it?" };
  const accounts = readAccounts();
  if (accounts[email]) return { ok: false, error: "you already have an account with that email — sign in instead." };
  const account: Account = { email, createdAt: Date.now() };
  accounts[email] = account;
  writeAccounts(accounts);
  window.localStorage.setItem(ACTIVE, email);
  return { ok: true, account };
}

export function signIn(emailRaw: string): { ok: true; account: Account } | { ok: false; error: string } {
  const email = normalizeEmail(emailRaw);
  if (!isEmail(email)) return { ok: false, error: "that email looks off. mind checking it?" };
  const accounts = readAccounts();
  const account = accounts[email];
  if (!account) return { ok: false, error: "no account here with that email yet. want to sign up?" };
  window.localStorage.setItem(ACTIVE, email);
  return { ok: true, account };
}

export function signOut() {
  try {
    window.localStorage.removeItem(ACTIVE);
  } catch {
    // nothing to clear
  }
}

/** Storage key for one account's data, so two accounts never collide. */
export function dataKeyFor(account: Account | null): string {
  return account ? `budg3.v1.${account.email}` : "budg3.v1.guest";
}
