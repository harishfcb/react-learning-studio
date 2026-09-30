import { describe, expect, it } from 'vitest';
import { getLesson, getNextLesson, lessons, lessonsByDay } from './data';

describe('curriculum model', () => {
  it('contains a navigable five-day path', () => {
    expect(new Set(lessons.map(lesson => lesson.day))).toEqual(new Set([1, 2, 3, 4, 5]));
    expect(lessons.every(lesson => lesson.id && lesson.title && lesson.quiz.length > 0)).toBe(true);
  });

  it('keeps next lesson navigation circular and deterministic', () => {
    expect(getNextLesson(lessons[0].id).id).toBe(lessons[1].id);
    expect(getNextLesson(lessons.at(-1)!.id).id).toBe(lessons[0].id);
  });

  it('retrieves day and lesson records', () => {
    expect(lessonsByDay(3).some(lesson => lesson.id === 'api-flow')).toBe(true);
    expect(getLesson('does-not-exist').id).toBe(lessons[0].id);
  });
});
