import { useEffect, useMemo, useState } from 'react';
import type { LearningStep } from '../types';
import { CodePanel } from './CodePanel';

interface StepPlayerProps {
  title: string;
  subtitle: string;
  code: string;
  steps: LearningStep[];
  resetKey?: string | number;
}

const speeds = [0.5, 1, 1.5] as const;

export function StepPlayer({ title, subtitle, code, steps, resetKey }: StepPlayerProps) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof speeds)[number]>(1);
  const active = steps[Math.min(step, steps.length - 1)];
  const reducedMotion = useMemo(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, []);

  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [resetKey]);

  useEffect(() => {
    if (!playing || !active || steps.length < 2) return;
    const timer = window.setTimeout(() => {
      setStep(current => {
        if (current >= steps.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, (reducedMotion ? 650 : 1500) / speed);
    return () => window.clearTimeout(timer);
  }, [active, playing, reducedMotion, speed, steps.length]);

  if (!active) return null;

  const moveTo = (next: number) => {
    setStep(Math.max(0, Math.min(steps.length - 1, next)));
    setPlaying(false);
  };

  return <div className="step-player" aria-label={`${title} step-by-step visualization`}>
    <div className="step-player-head">
      <div>
        <span className="eyebrow accent">GUIDED EXECUTION</span>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <div className={`execution-state ${playing ? 'running' : 'paused'}`} aria-live="polite">
        <span className="execution-dot" />{playing ? 'playing' : 'manual step'}
      </div>
    </div>
    <div className="step-progress" aria-label="Execution steps">
      {steps.map((item, index) => <button key={item.id} className={`step-marker ${index < step ? 'done' : ''} ${index === step ? 'current' : ''}`} aria-label={`Step ${index + 1}: ${item.title}`} aria-current={index === step ? 'step' : undefined} onClick={() => moveTo(index)}><span>{String(index + 1).padStart(2, '0')}</span><small>{item.title}</small></button>)}
    </div>
    <div className="step-player-grid">
      <div className="step-code-column">
        <CodePanel code={code} title="execution.jsx" activeLine={active.codeLine} />
        <div className="active-line-note"><span className="pulse-dot" />{active.codeLine ? `Line ${active.codeLine} is the source of this step.` : 'This step connects the execution model to the result.'}</div>
      </div>
      <div className="step-explanation" aria-live="polite">
        <div className="step-title-row"><span className="step-label">STEP {step + 1} OF {steps.length}</span><strong>{active.title}</strong></div>
        <p className="step-explanation-copy">{active.explanation}</p>
        <div className="step-facts">
          <Fact label="Operation" value={active.operation} />
          {active.component && <Fact label="Component" value={active.component} />}
          {active.render && <Fact label="Render" value={active.render} />}
          {active.effect && <Fact label="Effect" value={active.effect} />}
          {active.stateBefore && <Fact label="State before" value={active.stateBefore} />}
          {active.stateAfter && <Fact label="State after" value={active.stateAfter} tone="positive" />}
          {active.dom && <Fact label="Browser / DOM" value={active.dom} tone="positive" />}
        </div>
        <div className="step-why"><span>WHY THIS HAPPENED</span><p>{active.why}</p></div>
        <div className="step-next"><span>WHAT HAPPENS NEXT</span><p>{active.next}</p></div>
      </div>
    </div>
    <div className="step-event-log">
      <div className="event-log-head"><span className="eyebrow">EVENT LOG</span><small>Choose a step to inspect its evidence</small></div>
      <div className="event-log-list">{steps.map((item, index) => <button key={item.id} className={index === step ? 'selected' : ''} onClick={() => moveTo(index)}><span>{index < step ? '✓' : index + 1}</span><strong>{item.title}</strong><small>{item.operation}</small></button>)}</div>
    </div>
    <div className="step-controls"><button className="button subtle" onClick={() => moveTo(step - 1)} disabled={step === 0}>← Previous</button><button className="button primary" onClick={() => setPlaying(value => !value)}>{playing ? 'Ⅱ Pause' : '▶ Auto play'}</button><button className="button subtle" onClick={() => moveTo(step + 1)} disabled={step === steps.length - 1}>Next →</button><button className="text-button" onClick={() => moveTo(0)}>↻ Restart</button><label className="speed-control">Speed<select value={speed} onChange={event => setSpeed(Number(event.target.value) as (typeof speeds)[number])}>{speeds.map(value => <option value={value} key={value}>{value}x</option>)}</select></label></div>
  </div>;
}

function Fact({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'positive' }) {
  return <div className={`step-fact ${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}
