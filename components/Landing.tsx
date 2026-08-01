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
        <p className="hero-kicker">brick by brick.</p>
        <h1 className="hero-h">
          don&apos;t run at the wall. <em>take it down brick by brick.</em>
        </h1>
        <p className="hero-p">
          the thing you&apos;re avoiding is a wall. running at it has never worked — you just bounce
          off and feel worse. budg3 hands you one brick at a time, small enough to actually pull
          loose. do that enough and there&apos;s no wall left.
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
          <span className="sl">the size of one brick</span>
        </div>
        <div className="stat">
          <span className="sn">1</span>
          <span className="sl">brick at a time, never the wall</span>
        </div>
        <div className="stat">
          <span className="sn">0</span>
          <span className="sl">streaks you can lose</span>
        </div>
      </section>

      <section className="block">
        <h2 className="bh">how it works</h2>
        <ol className="steps">
          <li>
            <span className="sno">1</span>
            <span>
              <b>point at the wall</b>
              <span>
                the essay, the gym, the message you owe. or skip naming it and just hit the button —
                budg3 will pick something.
              </span>
            </span>
          </li>
          <li>
            <span className="sno">2</span>
            <span>
              <b>take one brick out</b>
              <span>
                never a plan, never a list. one move you could do in the next two minutes. if that
                brick won&apos;t budge, swap it for an easier one.
              </span>
            </span>
          </li>
          <li>
            <span className="sno">3</span>
            <span>
              <b>then the next one</b>
              <span>
                every brick is counted and kept. you watch the pile grow, the wall gets thinner,
                and at some point you realise you&apos;re through it.
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
            <span>one button, one brick, a countdown. for when picking is the hard part.</span>
          </div>
          <div className="feat">
            <b>the shrinker</b>
            <span>name the wall and it knocks a single brick loose for you.</span>
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
            <span>every brick you&apos;ve pulled out, in one list. proof you keep showing up.</span>
          </div>
        </div>
      </section>

      <section className="block">
        <h2 className="bh">every wall counts</h2>
        <div className="chips">
          {AREAS.map((a) => (
            <span key={a.key} className="chip static">
              {a.name}
            </span>
          ))}
        </div>
      </section>

      <section className="block cta">
        <h2 className="bh">which wall are you sick of?</h2>
        <p className="hero-p">
          an email is all it takes. no password, no spam — it just keeps your bricks counted.
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
