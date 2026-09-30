import { useMemo, useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';

interface CodePanelProps { code: string; title?: string; activeLine?: number; editable?: boolean; onChange?: (code: string) => void; }

export function CodePanel({ code, title = 'Example.jsx', activeLine, editable = false, onChange }: CodePanelProps) {
  const [value, setValue] = useState(code);
  const highlighted = useMemo(() => Prism.highlight(value, Prism.languages.jsx, 'jsx'), [value]);
  const lines = value.split('\n');
  if (editable) {
    return <div className="code-panel"><div className="code-title"><span className="dot red" /><span className="dot yellow" /><span className="dot green" /><span className="code-file">{title}</span><span className="code-label">editable</span></div><Editor value={value} onValueChange={next => { setValue(next); onChange?.(next); }} highlight={codeValue => Prism.highlight(codeValue, Prism.languages.jsx, 'jsx')} padding={18} textareaClassName="code-editor-textarea" preClassName="code-editor-pre" className="code-editor" /></div>;
  }
  return <div className="code-panel"><div className="code-title"><span className="dot red" /><span className="dot yellow" /><span className="dot green" /><span className="code-file">{title}</span><span className="code-label">{activeLine ? `line ${activeLine}` : 'read-only'}</span></div><pre className="code-lines" aria-label={`${title} code`}>{lines.map((line, index) => <code key={`${line}-${index}`} className={activeLine === index + 1 ? 'active-line' : ''}><span className="line-number">{String(index + 1).padStart(2, '0')}</span><span dangerouslySetInnerHTML={{ __html: Prism.highlight(line || ' ', Prism.languages.jsx, 'jsx') }} /></code>)}</pre></div>;
}

export function MiniCode({ children }: { children: string }) { return <code className="inline-code">{children}</code>; }
