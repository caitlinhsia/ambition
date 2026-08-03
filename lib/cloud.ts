"use client";

// The optional server half of budg3.
//
// With no Supabase environment variables set, none of this runs and the app
// behaves exactly as it always has: accounts and data live in localStorage on
// one device, and nothing leaves it. Set the two variables and the same
// account follows you between devices.
//
// Why these two are NEXT_PUBLIC_ when GROQ_API_KEY must never be:
// the anon key is *designed* to be shipped to browsers. It grants no access
// on its own — every read and write is checked by row-level security in
// Postgres against the signed-in user (see supabase/schema.sql). The Groq key
// is the opposite: it is a bearer token with real spending power, so it stays
// on the server. Never put a Supabase *service role* key in this file.

import type { SupabaseClient } from "@supabase/supabase-js";
import { State } from "./store";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when this deployment has somewhere to sync to. */
export const cloudEnabled = Boolean(URL && ANON);

let pending: Promise<SupabaseClient | null> | null = null;

/**
 * The client, loaded on demand.
 *
 * Imported dynamically rather than at the top of the file so the SDK is a
 * separate chunk: a deployment with no sync configured never downloads it,
 * and one that does only pays for it once someone signs in. It's ~70kB —
 * real money on a phone on school wifi.
 */
export function cloud(): Promise<SupabaseClient | null> {
  if (!cloudEnabled) return Promise.resolve(null);
  if (!pending) {
    pending = import("@supabase/supabase-js").then(({ createClient }) =>
      createClient(URL as string, ANON as string, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    );
  }
  return pending;
}

/**
 * Email a six-digit code.
 *
 * There is no password anywhere in budg3, which was fine while data sat on
 * your own device — but the moment it's on a server, "type an email, get the
 * data" would let anyone read anyone's journal. Proving you can read the
 * inbox is what replaces a password here.
 */
export async function sendCode(
  email: string,
  createIfMissing: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const c = await cloud();
  if (!c) return { ok: false, error: "sync isn't set up on this deployment." };
  const { error } = await c.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: createIfMissing },
  });
  if (error) {
    // Supabase says "Signups not allowed for otp" when the address has no
    // account and we didn't ask to make one. That's the sign-in-vs-sign-up
    // mix-up, not a failure worth showing raw.
    if (/signups not allowed/i.test(error.message)) {
      return { ok: false, error: "no account with that email yet." };
    }
    if (/rate|too many|seconds/i.test(error.message)) {
      return { ok: false, error: "too many codes just now. give it a minute." };
    }
    return { ok: false, error: "couldn't send the code. check the address and try again." };
  }
  return { ok: true };
}

export async function checkCode(
  email: string,
  code: string
): Promise<{ ok: true; id: string; email: string } | { ok: false; error: string }> {
  const c = await cloud();
  if (!c) return { ok: false, error: "sync isn't set up on this deployment." };
  const { data, error } = await c.auth.verifyOtp({ email, token: code.trim(), type: "email" });
  if (error || !data.user) {
    return { ok: false, error: "that code didn't work. they expire quickly — send a new one?" };
  }
  return { ok: true, id: data.user.id, email: data.user.email ?? email };
}

export async function cloudSignOut(): Promise<void> {
  await (await cloud())?.auth.signOut();
}

export async function currentCloudUser(): Promise<{ id: string; email: string } | null> {
  const c = await cloud();
  if (!c) return null;
  const { data } = await c.auth.getUser();
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}

/**
 * Read this account's stored state.
 *
 * Returns undefined for "there is no row yet" and null for "the read failed"
 * — the caller must tell those apart, because treating a failed read as an
 * empty account would push emptiness back over the top of real data.
 */
export async function pullState(): Promise<State | undefined | null> {
  const c = await cloud();
  if (!c) return null;
  const { data, error } = await c.from("states").select("data").maybeSingle();
  if (error) {
    console.error("sync: pull failed", error.message);
    return null;
  }
  if (!data) return undefined;
  return data.data as State;
}

export async function pushState(userId: string, state: State): Promise<boolean> {
  const c = await cloud();
  if (!c) return false;
  const { error } = await c
    .from("states")
    .upsert({ user_id: userId, data: state, updated_at: new Date().toISOString() });
  if (error) {
    console.error("sync: push failed", error.message);
    return false;
  }
  return true;
}

/** Erase everything on the server for this account. */
export async function deleteCloudState(userId: string): Promise<boolean> {
  const c = await cloud();
  if (!c) return false;
  const { error } = await c.from("states").delete().eq("user_id", userId);
  return !error;
}
