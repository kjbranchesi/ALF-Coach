import React from 'react';
import './landingAnimations.css';
import { CoDesignLoop } from './CoDesignLoop';
import { PromptToPlan } from './PromptToPlan';
import { LayersAssembly } from './LayersAssembly';
import { CardFlipJourney } from './CardFlipJourney';

export function AnimationsShowcase() {
  return (
    <section className="mt-24 md:mt-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            See ALF’s flow in motion
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mt-2">
            How your inputs become a complete project blueprint
          </h2>
        </div>

        <div className="landing-animations-grid">
          <div className="landing-anim-card">
            <h3 className="landing-anim-title">Context to Journey</h3>
            <p className="landing-anim-caption">
              Watch ALF turn big-picture details into sequenced phases and ready-to-go deliverables.
            </p>
            <CoDesignLoop />
          </div>

          <div className="landing-anim-card">
            <h3 className="landing-anim-title">Prompt to Plan</h3>
            <p className="landing-anim-caption">
              One guiding prompt evolves into a four-phase learning arc tailored for your community.
            </p>
            <PromptToPlan />
          </div>

          <div className="landing-anim-card">
            <h3 className="landing-anim-title">Stacking the Essentials</h3>
            <p className="landing-anim-caption">
              The key components—questions, journey, and deliverables—snap into place layer by layer.
            </p>
            <LayersAssembly />
          </div>

          <div className="landing-anim-card">
            <h3 className="landing-anim-title">360° Blueprint</h3>
            <p className="landing-anim-caption">
              Flip through Big Idea, Journey, and Deliverables in one elegant, quietly looping card.
            </p>
            <CardFlipJourney />
          </div>
        </div>
      </div>
    </section>
  );
}

