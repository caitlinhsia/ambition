"use client";

import { allSteps } from "./shrinker";

export type BrickSource = "ai" | "rules" | "generic";

export type BuiltBricks = {
  intro: string;
  steps: string[];
  source: BrickSource;
  /** Set when the thing needs a person rather than a task list. */
  needsAPerson?: boolean;
};

/**
 * Gets bricks for a wall.
 *
 * Tries the model route first when one is configured, and falls back to the
 * built-in rules on absolutely any failure — no key, timeout, bad response,
 * offline. The rules are the floor, so the app never depends on the network
 * to be useful.
 */
export async function buildBricks(thing: string): Promise<BuiltBricks> {
  const local = allSteps(thing);
  const fallback: BuiltBricks = {
    intro: local.intro,
    steps: local.steps,
    source: local.known ? "rules" : "generic",
  };

  try {
    const res = await fetch("/api/bricks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thing }),
    });
    if (!res.ok) return fallback;
    const data = await res.json();

    if (data?.reason === "needs-a-person") {
      return { ...fallback, needsAPerson: true };
    }
    if (data?.ok && Array.isArray(data.steps) && data.steps.length >= 3) {
      return {
        intro: "broken down for this one specifically.",
        steps: data.steps as string[],
        source: "ai",
      };
    }
    return fallback;
  } catch {
    return fallback;
  }
}
