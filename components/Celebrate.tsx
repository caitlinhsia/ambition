"use client";

// Confirmation should feel immediate but not theatrical. A short pulse from
// the thing you actually pressed — not confetti thrown across the page.

export function celebrate(origin?: HTMLElement | null) {
  if (typeof window === "undefined") return;

  // A physical tick lands faster than a visual one.
  try {
    navigator.vibrate?.(14);
  } catch {
    // haptics unsupported — no problem
  }

  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const el = origin ?? null;
  if (!el) return;

  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  for (let i = 0; i < 5; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    s.textContent = "·";
    const spread = (i - 2) * 16;
    s.style.left = `${cx + spread}px`;
    s.style.top = `${cy}px`;
    s.style.animation = `floatUp ${0.5 + Math.random() * 0.25}s ease-out forwards`;
    s.style.animationDelay = `${i * 0.03}s`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 900);
  }
}
