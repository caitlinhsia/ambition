"use client";

import { AREAS } from "@/lib/areas";

/**
 * The landing page. Someone arriving cold needs to know what this is before
 * they're asked for an email — so the pitch comes first and the form comes
 * after it.
 */
export default function Landing({
  onSignUp,
  onSignIn,
  onSkip,
}: {
  onSignUp: () => void;
  onSignIn: () => void;
  onSkip: () => void;
}) {
  return (
    <>
      <section className="hero">
        <p className="hero-kicker">learn to start.</p>
        <h1 className="hero-h">
          most of being unmotivated is just <em>not having started yet.</em>
        </h1>
        <p className="hero-p">
          budg3 gives you one small thing to do right now — small enough that starting it is easier
          than not. Then another. That&apos;s the whole thing.
        </p>
        <div className="row">
          <button className="btn primary big-cta" onClick={onSignUp}>
            get started
          </button>
          <button className="btn ghost big-cta" onClick={onSkip}>
            look around first
          </button>
        </div>
        <button className="link" onClick={onSignIn}>
          already have an account? sign in →
        </button>
      </section>

      <section className="strip">
        <div className="stat">
          <span className="sn">2 min</span>
          <span className="sl">the size of every first step</span>
        </div>
        <div className="stat">
          <span className="sn">0</span>
          <span className="sl">streaks you can lose</span>
        </div>
        <div className="stat">
          <span className="sn">8</span>
          <span className="sl">areas of your life to pick from</span>
        </div>
      </section>

      <section className="block">
        <h2 className="bh">how it works</h2>
        <ol className="steps">
          <li>
            <span className="sno">1</span>
            <span>
              <b>tell it what you&apos;re facing</b>
              <span>
                a subject you&apos;re avoiding, an area you want to move on, or just how you&apos;re
                feeling. or skip all that and hit the button.
              </span>
            </span>
          </li>
          <li>
            <span className="sno">2</span>
            <span>
              <b>get one small move</b>
              <span>
                never a plan, never a list. one step you could do in the next two minutes. swap it
                if it doesn&apos;t fit.
              </span>
            </span>
          </li>
          <li>
            <span className="sno">3</span>
            <span>
              <b>do it, then go again</b>
              <span>
                it gets logged, your habits build, and the numbers only ever go up. momentum does
                the rest.
              </span>
            </span>
          </li>
        </ol>
      </section>

      <section className="block">
        <h2 className="bh">what&apos;s inside</h2>
        <div className="feats">
          <div className="feat">
            <b>the ten second start</b>
            <span>one button, one thing, a countdown. for when picking is the hard part.</span>
          </div>
          <div className="feat">
            <b>the shrinker</b>
            <span>name the thing you&apos;re dreading and it breaks off a piece you can actually do.</span>
          </div>
          <div className="feat">
            <b>start with me</b>
            <span>a two minute timer so you&apos;re not starting on your own.</span>
          </div>
          <div className="feat">
            <b>habit builder</b>
            <span>build runs that pause instead of resetting. nothing here turns red.</span>
          </div>
          <div className="feat">
            <b>trackers</b>
            <span>count water, hours, walks, whatever matters. no targets to miss.</span>
          </div>
          <div className="feat">
            <b>receipts</b>
            <span>every start you&apos;ve made, in one list. proof you keep showing up.</span>
          </div>
        </div>
      </section>

      <section className="block">
        <h2 className="bh">pick any part of your life</h2>
        <div className="chips">
          {AREAS.map((a) => (
            <span key={a.key} className="chip static">
              {a.name}
            </span>
          ))}
        </div>
      </section>

      <section className="block cta">
        <h2 className="bh">ready?</h2>
        <p className="hero-p">
          an email is all it takes. no password, no spam — it just keeps your habits and history.
        </p>
        <div className="row">
          <button className="btn primary big-cta" onClick={onSignUp}>
            get started
          </button>
          <button className="btn ghost big-cta" onClick={onSkip}>
            skip, just let me try it
          </button>
        </div>
      </section>
    </>
  );
}
