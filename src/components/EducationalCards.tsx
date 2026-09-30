import type { CommonMistake } from '../types';

export function CommonMistakeCard({ mistake }: { mistake?: CommonMistake }) {
  if (!mistake) return null;
  return <section className="mistake-card"><div className="section-kicker"><span className="icon-badge">!</span><span>COMMON MISTAKE</span></div><h3>{mistake.title}</h3><div className="mistake-grid"><div className="mistake-column wrong"><span>✕ WRONG</span><pre>{mistake.wrongCode}</pre><p>{mistake.why}</p></div><div className="mistake-arrow">→</div><div className="mistake-column correct"><span>✓ CORRECT</span><pre>{mistake.correctCode}</pre><p>{mistake.works}</p></div></div></section>;
}
