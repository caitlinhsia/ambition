"use client";

// The reward has to land the instant you tap done — that immediacy is what
// wires starting into a habit. Silent for anyone who prefers no motion.

const GLYPHS = ["🌱", "✦", "🌿", "·", "✷"];

export function celebrate() {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  for (let i = 0; i < 9; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    s.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    s.style.left = `${18 + Math.random() * 64}%`;
    s.style.top = `${45 + Math.random() * 20}%`;
    s.style.animation = `floatUp ${0.9 + Math.random() * 0.7}s ease-out forwards`;
    s.style.animationDelay = `${Math.random() * 0.16}s`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1900);
  }

  // A physical tick lands faster than a visual one.
  try {
    navigator.vibrate?.(18);
  } catch {
    // haptics unsupported — no problem
  }
}
