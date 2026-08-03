import { describe, expect, it } from "vitest";
import { mergeStates } from "./merge";
import { State } from "./store";

/**
 * These aren't tests of an implementation, they're tests of a promise: two
 * devices meeting must never end with less than either brought. Every case
 * below is one way sync could quietly delete someone's week.
 */

const base = (over: Partial<State> = {}): State => ({
  profile: { onboarded: false },
  started: 0,
  receipts: [],
  habits: [],
  trackers: [],
  plans: [],
  journal: [],
  walls: [],
  dayLogs: {},
  ...over,
});

describe("receipts", () => {
  it("keeps starts from both devices", () => {
    const phone = base({ receipts: [{ id: "a", text: "walked", at: 1 }], started: 1 });
    const laptop = base({ receipts: [{ id: "b", text: "essay", at: 2 }], started: 1 });
    const m = mergeStates(phone, laptop);
    expect(m.receipts.map((r) => r.id).sort()).toEqual(["a", "b"]);
  });

  it("does not duplicate the same start seen twice", () => {
    const r = { id: "a", text: "walked", at: 1 };
    const m = mergeStates(base({ receipts: [r] }), base({ receipts: [r] }));
    expect(m.receipts).toHaveLength(1);
  });

  it("never reports fewer starts than there are receipts", () => {
    const m = mergeStates(
      base({ started: 0, receipts: [{ id: "a", text: "x", at: 1 }] }),
      base({ started: 0, receipts: [{ id: "b", text: "y", at: 2 }] })
    );
    expect(m.started).toBe(2);
  });

  it("takes the higher total when receipts have been trimmed away", () => {
    const m = mergeStates(base({ started: 900 }), base({ started: 12 }));
    expect(m.started).toBe(900);
  });
});

describe("habits", () => {
  it("unions the days done on each device", () => {
    const phone = base({ habits: [{ id: "h", name: "walk", days: ["2026-01-01", "2026-01-02"] }] });
    const laptop = base({ habits: [{ id: "h", name: "walk", days: ["2026-01-02", "2026-01-03"] }] });
    const m = mergeStates(phone, laptop);
    expect(m.habits[0].days).toEqual(["2026-01-01", "2026-01-02", "2026-01-03"]);
  });

  it("a stale device cannot erase a day", () => {
    const stale = base({ habits: [{ id: "h", name: "walk", days: [] }] });
    const fresh = base({ habits: [{ id: "h", name: "walk", days: ["2026-01-01"] }] });
    expect(mergeStates(fresh, stale).habits[0].days).toEqual(["2026-01-01"]);
  });

  it("takes the newer name after a rename", () => {
    const older = base({ habits: [{ id: "h", name: "walk", days: [] }] });
    const newer = base({ habits: [{ id: "h", name: "morning walk", days: [] }] });
    expect(mergeStates(older, newer).habits[0].name).toBe("morning walk");
  });
});

describe("trackers", () => {
  it("keeps the higher count for a day logged on both", () => {
    const phone = base({ trackers: [{ id: "t", name: "water", unit: "cups", counts: { "2026-01-01": 3 } }] });
    const laptop = base({ trackers: [{ id: "t", name: "water", unit: "cups", counts: { "2026-01-01": 6 } }] });
    expect(mergeStates(phone, laptop).trackers[0].counts["2026-01-01"]).toBe(6);
    expect(mergeStates(laptop, phone).trackers[0].counts["2026-01-01"]).toBe(6);
  });

  it("keeps days only one device knows about", () => {
    const phone = base({ trackers: [{ id: "t", name: "water", unit: "cups", counts: { a: 1 } }] });
    const laptop = base({ trackers: [{ id: "t", name: "water", unit: "cups", counts: { b: 2 } }] });
    expect(mergeStates(phone, laptop).trackers[0].counts).toEqual({ a: 1, b: 2 });
  });

  it("carries a goal set on one device to the other", () => {
    const noGoal = base({ trackers: [{ id: "t", name: "water", unit: "cups", counts: {} }] });
    const withGoal = base({ trackers: [{ id: "t", name: "water", unit: "cups", counts: {}, goal: 6 }] });
    expect(mergeStates(noGoal, withGoal).trackers[0].goal).toBe(6);
    expect(mergeStates(withGoal, noGoal).trackers[0].goal).toBe(6);
  });
});

describe("walls", () => {
  const wall = (state: "in" | "down" | "aside", extra: Partial<State> = {}) =>
    base({
      walls: [{ id: "w", name: "essay", createdAt: 10, bricks: [{ id: "b1", text: "open it", state }] }],
      ...extra,
    });

  it("a knocked-out brick never goes back in", () => {
    expect(mergeStates(wall("down"), wall("in")).walls[0].bricks[0].state).toBe("down");
    expect(mergeStates(wall("in"), wall("down")).walls[0].bricks[0].state).toBe("down");
  });

  it("aside beats in, so a brick you moved stays moved", () => {
    expect(mergeStates(wall("in"), wall("aside")).walls[0].bricks[0].state).toBe("aside");
  });

  it("unions bricks added on different devices", () => {
    const a = base({ walls: [{ id: "w", name: "essay", createdAt: 1, bricks: [{ id: "b1", text: "one", state: "in" }] }] });
    const b = base({ walls: [{ id: "w", name: "essay", createdAt: 1, bricks: [{ id: "b2", text: "two", state: "in" }] }] });
    expect(mergeStates(a, b).walls[0].bricks.map((x) => x.id).sort()).toEqual(["b1", "b2"]);
  });

  it("finishes a wall when the two halves together take it down", () => {
    const a = base({
      walls: [{ id: "w", name: "essay", createdAt: 1, bricks: [
        { id: "b1", text: "one", state: "down" },
        { id: "b2", text: "two", state: "in" },
      ] }],
    });
    const b = base({
      walls: [{ id: "w", name: "essay", createdAt: 1, bricks: [
        { id: "b1", text: "one", state: "in" },
        { id: "b2", text: "two", state: "down" },
      ] }],
    });
    expect(mergeStates(a, b).walls[0].finishedAt).toBeGreaterThan(0);
  });

  it("keeps the earliest creation time", () => {
    const a = base({ walls: [{ id: "w", name: "e", createdAt: 5, bricks: [] }] });
    const b = base({ walls: [{ id: "w", name: "e", createdAt: 99, bricks: [] }] });
    expect(mergeStates(a, b).walls[0].createdAt).toBe(5);
  });
});

describe("journal and day logs", () => {
  it("keeps entries written on both devices", () => {
    const a = base({ journal: [{ id: "j1", day: "2026-01-01", text: "one", at: 1 }] });
    const b = base({ journal: [{ id: "j2", day: "2026-01-01", text: "two", at: 2 }] });
    expect(mergeStates(a, b).journal).toHaveLength(2);
  });

  it("fills in a field the other device left blank", () => {
    const a = base({ dayLogs: { "2026-01-01": { weather: "rain" } } });
    const b = base({ dayLogs: { "2026-01-01": { mood: "tired" } } });
    expect(mergeStates(a, b).dayLogs["2026-01-01"]).toEqual({ weather: "rain", mood: "tired" });
  });

  it("takes the newer answer when both filled the same field", () => {
    const a = base({ dayLogs: { d: { mood: "flat" } } });
    const b = base({ dayLogs: { d: { mood: "good" } } });
    expect(mergeStates(a, b).dayLogs.d.mood).toBe("good");
  });
});

describe("profile", () => {
  it("does not ask you to onboard again", () => {
    const done = base({ profile: { onboarded: true, tutorialDone: true } });
    const fresh = base({ profile: { onboarded: false } });
    const m = mergeStates(done, fresh);
    expect(m.profile.onboarded).toBe(true);
    expect(m.profile.tutorialDone).toBe(true);
  });

  it("keeps quiz answers a blank device does not have", () => {
    const answered = base({ profile: { onboarded: true, typeKey: "sprinter", age: "16" } });
    const blank = base({ profile: { onboarded: true } });
    expect(mergeStates(answered, blank).profile.typeKey).toBe("sprinter");
  });
});

describe("the promise itself", () => {
  const rich = base({
    profile: { onboarded: true, typeKey: "night owl" },
    started: 40,
    receipts: [{ id: "r1", text: "x", at: 5 }],
    habits: [{ id: "h", name: "walk", days: ["2026-01-01"] }],
    trackers: [{ id: "t", name: "water", unit: "cups", counts: { "2026-01-01": 5 }, goal: 6 }],
    plans: [{ id: "p", text: "email", forDay: "2026-01-02", done: true }],
    journal: [{ id: "j", day: "2026-01-01", text: "hi", at: 5 }],
    walls: [
      { id: "w", name: "essay", createdAt: 1, finishedAt: 20, bricks: [{ id: "b", text: "open", state: "down" }] },
    ],
    dayLogs: { "2026-01-01": { weather: "sun", mood: "good" } },
  });

  it("an empty device cannot wipe a full one, in either order", () => {
    for (const m of [mergeStates(rich, base()), mergeStates(base(), rich)]) {
      expect(m.started).toBe(40);
      expect(m.receipts).toHaveLength(1);
      expect(m.habits[0].days).toEqual(["2026-01-01"]);
      expect(m.trackers[0].counts["2026-01-01"]).toBe(5);
      expect(m.trackers[0].goal).toBe(6);
      expect(m.plans[0].done).toBe(true);
      expect(m.journal).toHaveLength(1);
      expect(m.walls[0].bricks[0].state).toBe("down");
      expect(m.dayLogs["2026-01-01"]).toEqual({ weather: "sun", mood: "good" });
      expect(m.profile.typeKey).toBe("night owl");
    }
  });

  // updatedAt is always present on the result even when neither input had
  // one, which is why it's spread in rather than assumed absent.
  it("merging with itself changes nothing", () => {
    expect(mergeStates(rich, rich)).toEqual({ ...rich, updatedAt: 0 });
  });

  // Sync merges the same pair repeatedly — on sign-in, on focus, on push.
  // If a merge kept producing new output the devices would never settle.
  it("settles: merging the result again produces the same thing", () => {
    const once = mergeStates(rich, base({ started: 2, habits: [{ id: "h2", name: "read", days: ["2026-02-02"] }] }));
    expect(mergeStates(once, once)).toEqual(once);
    expect(mergeStates(once, rich)).toEqual(once);
  });

  it("is order-independent for everything that can be unioned", () => {
    const other = base({
      started: 3,
      receipts: [{ id: "r2", text: "y", at: 9 }],
      habits: [{ id: "h", name: "walk", days: ["2026-01-02"] }],
      trackers: [{ id: "t", name: "water", unit: "cups", counts: { "2026-01-02": 2 } }],
    });
    const ab = mergeStates(rich, other);
    const ba = mergeStates(other, rich);
    expect(ab.started).toBe(ba.started);
    expect(ab.receipts.map((r) => r.id).sort()).toEqual(ba.receipts.map((r) => r.id).sort());
    expect(ab.habits[0].days).toEqual(ba.habits[0].days);
    expect(ab.trackers[0].counts).toEqual(ba.trackers[0].counts);
  });
});
