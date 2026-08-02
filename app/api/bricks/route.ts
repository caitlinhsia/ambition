import { NextResponse } from "next/server";

/**
 * Turns a wall into bricks using a model, when a key is configured.
 *
 * This runs on the server for one reason: the key must never reach the
 * browser. Anything prefixed NEXT_PUBLIC_ is readable by everyone who loads
 * the page, so the key lives only in GROQ_API_KEY here.
 *
 * With no key set, this route reports unavailable and the app falls back to
 * its built-in rules — which means budg3 works fully offline and sends
 * nothing anywhere unless someone deliberately turns this on.
 */

const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

/** Things that need a person, not a task list. */
const CRISIS =
  /\b(kill myself|killing myself|end my life|suicid|self.?harm|cut myself|cutting myself|want to die|better off dead|overdose)\b/i;

const SYSTEM = `You break overwhelming things into tiny first steps.

Rules:
- Return 5 to 7 steps, each a single concrete action doable in about two minutes.
- All lowercase. No numbering, no markdown, no trailing commentary.
- Each step must be a physical or mental ACTION, never advice and never an instruction to feel something.
- If the thing is a feeling ("feeling happier", "less anxious"), give small actions that reliably shift that state — daylight, movement, contact with a person, writing it down, one slow breath. Never "just be positive".
- Order them easiest first.
- Never mention therapy, medication, diagnosis, or anything medical.
- Speak plainly and warmly. No exclamation marks. No motivational-poster language.

Return ONLY a JSON array of strings.`;

/**
 * Says whether this deployment can actually reach a model.
 *
 * Visit /api/bricks in a browser to check. It never returns the key or any
 * part of it — only whether one is set, whether Groq accepts it, and whether
 * the configured model still exists on that account. Those are the three ways
 * this can be silently misconfigured while the app looks fine, because every
 * one of them just falls back to the rules.
 */
export async function GET() {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return NextResponse.json({
      ready: false,
      model: MODEL,
      detail:
        "no GROQ_API_KEY on this deployment. walls are built from the rules. add the key in Settings → Environment Variables, then redeploy.",
    });
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({
        ready: false,
        model: MODEL,
        status: res.status,
        detail:
          res.status === 401
            ? "groq rejected the key. it's wrong, revoked, or has a stray space or quote around it."
            : `groq returned ${res.status}.`,
      });
    }

    const data = await res.json();
    const ids: string[] = (data?.data ?? [])
      .map((m: { id?: string }) => String(m?.id ?? ""))
      .filter(Boolean)
      .sort();
    const available = ids.includes(MODEL);

    return NextResponse.json({
      ready: available,
      model: MODEL,
      detail: available
        ? "ready. walls are broken down by the model."
        : `${MODEL} isn't available on this account — it was probably retired. set GROQ_MODEL to one of the models below and redeploy.`,
      models: ids,
    });
  } catch {
    return NextResponse.json({
      ready: false,
      model: MODEL,
      detail: "couldn't reach groq from the server (timeout or network).",
    });
  }
}

export async function POST(req: Request) {
  let thing = "";
  try {
    const body = await req.json();
    thing = String(body?.thing ?? "").slice(0, 200).trim();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-request" }, { status: 400 });
  }
  if (!thing) return NextResponse.json({ ok: false, reason: "empty" }, { status: 400 });

  // Checked before anything else: a task list is the wrong answer here, and
  // that stays true whether or not a model is configured.
  if (CRISIS.test(thing)) {
    return NextResponse.json({ ok: false, reason: "needs-a-person" }, { status: 200 });
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, reason: "no-key" }, { status: 200 });
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.7,
        max_tokens: 500,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `the thing they're avoiding: ${thing}` },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("groq failed", res.status, detail.slice(0, 200));
      return NextResponse.json({ ok: false, reason: "upstream" }, { status: 200 });
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    const steps = parseSteps(raw);

    if (steps.length < 3) {
      return NextResponse.json({ ok: false, reason: "unusable" }, { status: 200 });
    }
    return NextResponse.json({ ok: true, steps: steps.slice(0, 7) });
  } catch (err) {
    console.error("groq error", err);
    return NextResponse.json({ ok: false, reason: "error" }, { status: 200 });
  }
}

/** Models sometimes wrap the array in prose or a code fence. Dig it out. */
function parseSteps(raw: string): string[] {
  const fenced = raw.replace(/```(?:json)?/g, "").trim();
  const start = fenced.indexOf("[");
  const end = fenced.lastIndexOf("]");
  if (start !== -1 && end > start) {
    try {
      const arr = JSON.parse(fenced.slice(start, end + 1));
      if (Array.isArray(arr)) {
        return arr
          .map((x) => String(x).trim())
          .filter((x) => x.length > 0 && x.length < 200);
      }
    } catch {
      // fall through to line parsing
    }
  }
  return fenced
    .split("\n")
    .map((l) => l.replace(/^[\s\-*\d.)"']+/, "").replace(/["',]+$/, "").trim())
    .filter((l) => l.length > 3 && l.length < 200);
}
