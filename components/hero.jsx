"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, Sparkles } from "lucide-react";
import Button from "@/components/ui/button";
import ParticleSphere from "@/components/particle-sphere";
import "./home.css";
import "./hero-motion.css";

export default function Hero() {
  const [stage, setStage] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [motionReduced, setMotionReduced] = useState(false);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionReduced(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);

  const scatter = () => {
    if (!motionReduced) {
      setPaused(false);
      setBurstKey((key) => key + 1);
    }
  };

  return (
    <section className="home-hero" aria-labelledby="hero-title">
      <div className="hero-ambient" aria-hidden="true">
        {Array.from({ length: 28 }, (_, i) => (
          <i
            key={i}
            style={{
              left: `${4 + ((i * 37) % 93)}%`,
              top: `${5 + ((i * 23) % 89)}%`,
              "--dot-size": `${3 + (i % 4) * 2}px`,
              "--drift-x": `${(i % 2 ? 1 : -1) * (16 + (i % 19))}px`,
              "--drift-y": `${-18 - (i % 25)}px`,
              "--drift-time": `${32 + (i % 17)}s`,
              "--drift-delay": `${-i * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="site-wrap hero-grid">
        <div className="hero-copy">
          <div className="brandy-badge hero-enter">
            <span className="pulse-dot" />
            <span>Creative Intelligence in Every Pixel</span>
          </div>

          <h1 id="hero-title" className="hero-enter">
            <span>Creative Intelligence</span>
            <span>in Every</span>
            <span className="hero-accent">Line of Code.</span>
          </h1>

          <p className="hero-description hero-enter">
            No matter the industry you’re in, or the asset you need, we can design and build it for you — custom software, high-conversion web platforms, mobile apps, and enterprise AI.
          </p>

          <div className="btn-row hero-enter">
            <Button href="/start-project" variant="accent">
              Start a Project
            </Button>
            <Button href="#creative-showcase" variant="secondary">
              Our Showcase
            </Button>
          </div>

          <div className="hero-tags hero-enter">
            {[
              "100% Custom Engineering",
              "Web, Mobile, AI & Cloud",
              "Guaranteed Sprints",
            ].map((t) => (
              <span key={t}>
                <i />
                {t}
              </span>
            ))}
          </div>
        </div>

        <div
          className="hero-art-slot"
          onClick={(event) => {
            if (!event.target.closest("button")) scatter();
          }}
        >
          <ParticleSphere
            className="hero-particles"
            onStageChange={setStage}
            burstKey={burstKey}
            paused={paused}
          />
          <p className="particle-hint">
            <span className="particle-hint-pointer">Move to explore · click to scatter</span>
            <span className="particle-hint-touch">Tap to scatter & reform</span>
          </p>
          <div className="particle-status">
            <i
              className={`status-orbit ${paused || motionReduced ? "is-paused" : ""}`}
              aria-hidden="true"
            />
            <b>{["Custom Apps", "Websites", "SEO & Growth", "AI / ML", "DevOps Cloud"][stage]}</b>
            <div className="status-dots" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <i key={i} className={i === stage ? "active" : ""} />
              ))}
            </div>
            <div className="particle-controls">
              <button
                type="button"
                className="particle-control"
                onClick={scatter}
                disabled={motionReduced}
                aria-label="Scatter and reform the particles"
                title="Scatter & reform"
              >
                <RotateCcw size={13} />
              </button>
              <button
                type="button"
                className="particle-control"
                onClick={() => setPaused((value) => !value)}
                disabled={motionReduced}
                aria-label={paused ? "Play particle animation" : "Pause particle animation"}
                aria-pressed={paused}
                title={paused ? "Play animation" : "Pause animation"}
              >
                {paused ? <Play size={13} /> : <Pause size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <a href="#introduction" className="hero-scroll">
        <i />
        <span>Scroll</span>
      </a>
    </section>
  );
}
