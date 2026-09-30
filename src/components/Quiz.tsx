import { useState } from 'react';
import type { QuizQuestion } from '../types';
import { useProgress } from '../store/progress';

export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const { quizResults, saveQuizResult, resetQuizResult } = useProgress();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const question = questions[current];
  const result = quizResults[question.id];
  const answered = Boolean(result);
  const choice = selected ?? result?.selected;
  const score = questions.filter(item => quizResults[item.id]?.correct).length;
  const submit = () => { if (selected !== null) saveQuizResult(question.id, { selected, correct: selected === question.answer }); };
  return <section className="quiz-card"><div className="section-kicker"><span className="icon-badge">?</span><span>MENTAL MODEL CHECK · {current + 1}/{questions.length} · SCORE {score}/{questions.length}</span></div><h3>{question.prompt}</h3>{question.code && <pre className="quiz-code">{question.code}</pre>}<div className="quiz-options">{question.options.map((option, index) => <button key={option} className={`quiz-option ${choice === index ? (index === question.answer ? 'correct' : 'wrong') : ''}`} onClick={() => !answered && setSelected(index)} disabled={Boolean(answered)}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>{answered ? <div className={`quiz-feedback ${choice === question.answer ? 'is-correct' : 'is-wrong'}`}><strong>{choice === question.answer ? 'Correct mental model.' : 'Not quite yet.'}</strong><p>{question.explanation}</p><div className="quiz-feedback-actions">{choice !== question.answer && <button className="button subtle" onClick={() => { resetQuizResult(question.id); setSelected(null); }}>Try again</button>}{current < questions.length - 1 && <button className="button subtle" onClick={() => { setCurrent(value => value + 1); setSelected(null); }}>Next question →</button>}</div></div> : <button className="button primary" disabled={selected === null} onClick={submit}>Check answer</button>}</section>;
}
