import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { ProgressState, QuizResult, Theme } from '../types';

const STORAGE_KEY = 'react-learning-studio:v1';
const initialState: ProgressState = {
  completedLessons: [],
  completedChallenges: [],
  quizResults: {},
  currentLessonId: 'javascript-foundations',
  theme: 'dark',
};

interface ProgressContextValue extends ProgressState {
  completeLesson: (id: string) => void;
  completeChallenge: (id: string) => void;
  saveQuizResult: (questionId: string, result: QuizResult) => void;
  resetQuizResult: (questionId: string) => void;
  setCurrentLesson: (id: string) => void;
  setTheme: (theme: Theme) => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function readStored(): ProgressState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...initialState, ...JSON.parse(stored) } : initialState;
  } catch {
    return initialState;
  }
}

export function ProgressProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<ProgressState>(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Private browsing or a full storage quota should not break the course UI.
    }
    document.documentElement.dataset.theme = state.theme;
  }, [state]);

  const completeLesson = useCallback((id: string) => setState(current => ({ ...current, completedLessons: current.completedLessons.includes(id) ? current.completedLessons : [...current.completedLessons, id] })), []);
  const completeChallenge = useCallback((id: string) => setState(current => ({ ...current, completedChallenges: current.completedChallenges.includes(id) ? current.completedChallenges : [...current.completedChallenges, id] })), []);
  const saveQuizResult = useCallback((questionId: string, result: QuizResult) => setState(current => ({ ...current, quizResults: { ...current.quizResults, [questionId]: result } })), []);
  const resetQuizResult = useCallback((questionId: string) => setState(current => { const quizResults = { ...current.quizResults }; delete quizResults[questionId]; return { ...current, quizResults }; }), []);
  const setCurrentLesson = useCallback((id: string) => setState(current => ({ ...current, currentLessonId: id })), []);
  const setTheme = useCallback((theme: Theme) => setState(current => ({ ...current, theme })), []);
  const resetProgress = useCallback(() => setState(initialState), []);

  const value = useMemo(() => ({ ...state, completeLesson, completeChallenge, saveQuizResult, resetQuizResult, setCurrentLesson, setTheme, resetProgress }), [state, completeLesson, completeChallenge, saveQuizResult, resetQuizResult, setCurrentLesson, setTheme, resetProgress]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be used inside ProgressProvider');
  return value;
}
