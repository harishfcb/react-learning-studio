import { useEffect, useState } from 'react';
import type { DemoEvent } from '../types';

export function ExecutionTimeline({ events, onActiveChange }: { events: DemoEvent[]; onActiveChange?: (event: DemoEvent) => void }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { onActiveChange?.(events[step]); }, [events, onActiveChange, step]);
  useEffect(() => { if (!playing) return; const timer = window.setInterval(() => setStep(current => Math.min(events.length - 1, current + 1)), 1000); return () => window.clearInterval(timer); }, [playing, events.length]);
  useEffect(() => { if (playing && step >= events.length - 1) setPlaying(false); }, [playing, step, events.length]);
  const active = events[step];
  return <div className="timeline-card"><div className="timeline-head"><div><span className="eyebrow">Execution timeline</span><h3>See the next thing React does</h3></div><span className="timeline-count">{step + 1} / {events.length}</span></div><div className="timeline-track">{events.map((event, index) => <button key={event.id} className={`timeline-dot ${index <= step ? 'done' : ''} ${index === step ? 'current' : ''}`} aria-label={`Go to ${event.label}`} onClick={() => { setStep(index); setPlaying(false); }}><span>{index + 1}</span></button>)}</div><div className="timeline-active"><span className="step-label">STEP {step + 1}</span><h4>{active.label}</h4><p>{active.description}</p>{active.stateSnapshot && <div className="snapshot"><span>React memory</span><strong>{active.stateSnapshot}</strong></div>}</div><div className="timeline-actions"><button className="button subtle" onClick={() => { setStep(Math.max(0, step - 1)); setPlaying(false); }}>← Previous</button><button className="button primary" onClick={() => setPlaying(value => !value)}>{playing ? 'Pause' : 'Auto play'}</button><button className="button subtle" onClick={() => { setStep(Math.min(events.length - 1, step + 1)); setPlaying(false); }}>Next →</button><button className="text-button" onClick={() => { setStep(0); setPlaying(false); }}>Restart</button></div></div>;
}
