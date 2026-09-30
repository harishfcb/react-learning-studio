interface FlowDiagramProps { steps: string[]; active?: number; onSelect?: (index: number) => void; }
export function FlowDiagram({ steps, active = -1, onSelect }: FlowDiagramProps) {
  return <div className="flow-diagram">{steps.map((step, index) => <div className="flow-item-wrap" key={step}><button className={`flow-item ${active === index ? 'selected' : ''}`} onClick={() => onSelect?.(index)}>{step}</button>{index < steps.length - 1 && <span className="flow-arrow">↓</span>}</div>)}</div>;
}

export function StatusPill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) { return <span className={`status-pill ${tone}`}>{children}</span>; }
