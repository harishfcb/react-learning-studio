export type DayNumber = 1 | 2 | 3 | 4 | 5;
export type Theme = 'dark' | 'light';

export interface LessonSection {
  title: string;
  body: string;
  code?: string;
  takeaway?: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  code?: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface CommonMistake {
  title: string;
  wrongCode: string;
  why: string;
  correctCode: string;
  works: string;
}

export interface Challenge {
  title: string;
  prompt: string;
  hints: string[];
}

export interface Lesson {
  id: string;
  day: DayNumber;
  title: string;
  slug: string;
  description: string;
  estimatedMinutes: number;
  prerequisites: string[];
  sections: LessonSection[];
  quiz: QuizQuestion[];
  challenge?: Challenge;
  commonMistake?: CommonMistake;
  tags: string[];
}

export interface QuizResult {
  selected: number;
  correct: boolean;
}

export interface ProgressState {
  completedLessons: string[];
  completedChallenges: string[];
  quizResults: Record<string, QuizResult>;
  currentLessonId: string;
  theme: Theme;
}

export interface DemoEvent {
  id: string;
  label: string;
  description: string;
  codeLine?: number;
  stateSnapshot?: string;
}

export interface LearningStep {
  id: string;
  title: string;
  explanation: string;
  codeLine?: number;
  operation: string;
  stateBefore?: string;
  stateAfter?: string;
  render?: string;
  component?: string;
  effect?: string;
  dom?: string;
  why: string;
  next: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  company: string;
  status: 'Active' | 'Trial' | 'Paused';
}
