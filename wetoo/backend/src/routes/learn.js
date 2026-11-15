// Routes d'apprentissage : cours (leçons) et quiz.
import { Router } from 'express';
import { store } from '../db/store.js';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  ApiError,
  assert,
  grantBadges,
  levelFromPoints,
} from '../utils/helpers.js';

const router = Router();

/** Résumé d'une leçon (pour les listes). */
function lessonSummary(l) {
  return {
    id: l.id,
    title: l.title,
    category: l.category,
    level: l.level,
    durationMin: l.durationMin,
    points: l.points,
    cover: l.cover,
    emoji: l.emoji,
    summary: l.summary,
    tags: l.tags || [],
    sectionsCount: (l.sections || []).length,
  };
}

/** Progression publique d'un utilisateur à partir de sa version en base. */
function progressOf(user) {
  const lvl = levelFromPoints(user.points);
  return {
    points: user.points,
    level: lvl.level,
    levelName: lvl.levelName,
    badges: user.badges,
    completedLessons: user.completedLessons,
    streak: user.streak,
  };
}

// GET /api/learn/lessons?category=&level=
router.get('/lessons', asyncHandler(async (req, res) => {
  const { category, level } = req.query;
  let lessons = await store.get('lessons');
  if (category) lessons = lessons.filter((l) => l.category === category);
  if (level) lessons = lessons.filter((l) => l.level === level);
  res.json(lessons.map(lessonSummary));
}));

// GET /api/learn/lessons/:id
router.get('/lessons/:id', asyncHandler(async (req, res) => {
  const lesson = await store.getById('lessons', req.params.id);
  if (!lesson) throw new ApiError(404, 'Leçon introuvable.', 'lesson_not_found');
  res.json({ ...lesson, sectionsCount: (lesson.sections || []).length });
}));

// POST /api/learn/lessons/:id/complete
router.post('/lessons/:id/complete', authRequired, asyncHandler(async (req, res) => {
  const lesson = await store.getById('lessons', req.params.id);
  if (!lesson) throw new ApiError(404, 'Leçon introuvable.', 'lesson_not_found');

  const user = req.user;
  const alreadyDone = (user.completedLessons || []).includes(lesson.id);
  let awardedPoints = 0;
  let newBadges = [];

  if (!alreadyDone) {
    awardedPoints = Number(lesson.points) || 0;
    const completedLessons = [...(user.completedLessons || []), lesson.id];
    const points = (Number(user.points) || 0) + awardedPoints;
    const streak = (Number(user.streak) || 0) + 1;

    const updated = await store.update('users', user.id, { completedLessons, points, streak });
    // Attribution des badges éventuels (déjà complétée par les points/streak ci-dessus).
    newBadges = grantBadges(updated, await store.get('badges'), {
      lessonsDone: completedLessons.length,
      isMentalLesson: lesson.category === 'Santé mentale',
    });
    if (newBadges.length) await store.update('users', user.id, { badges: updated.badges });
  }

  const fresh = await store.getById('users', user.id);
  res.json({
    awardedPoints,
    progress: progressOf(fresh),
    newBadges: newBadges.map((b) => ({ id: b.id, name: b.name, emoji: b.emoji, description: b.description })),
    alreadyDone,
  });
}));

// GET /api/learn/quizzes
router.get('/quizzes', asyncHandler(async (req, res) => {
  const quizzes = (await store.get('quizzes')).map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    topic: quiz.topic,
    questionsCount: (quiz.questions || []).length,
    points: quiz.points,
    emoji: quiz.emoji,
    description: quiz.description,
  }));
  res.json(quizzes);
}));

// GET /api/learn/quizzes/:id — NE PAS exposer les bonnes réponses.
router.get('/quizzes/:id', asyncHandler(async (req, res) => {
  const quiz = await store.getById('quizzes', req.params.id);
  if (!quiz) throw new ApiError(404, 'Quiz introuvable.', 'quiz_not_found');

  res.json({
    id: quiz.id,
    title: quiz.title,
    topic: quiz.topic,
    points: quiz.points,
    emoji: quiz.emoji,
    description: quiz.description,
    questions: (quiz.questions || []).map((question) => ({
      id: question.id,
      question: question.question,
      multi: Boolean(question.multi),
      options: (question.options || []).map((o) => ({ id: o.id, text: o.text })),
    })),
  });
}));

// POST /api/learn/quizzes/:id/submit
router.post('/quizzes/:id/submit', authRequired, asyncHandler(async (req, res) => {
  const quiz = await store.getById('quizzes', req.params.id);
  if (!quiz) throw new ApiError(404, 'Quiz introuvable.', 'quiz_not_found');

  const { answers } = req.body || {};
  assert(Array.isArray(answers), 'Le champ « answers » doit être une liste.', 'invalid_answers');

  // Indexe les réponses envoyées par question.
  const answerMap = new Map();
  for (const a of answers) {
    if (!a || !a.questionId) continue;
    const ids = a.optionIds || (a.optionId ? [a.optionId] : []);
    answerMap.set(a.questionId, new Set(ids));
  }

  const questions = quiz.questions || [];
  let correctCount = 0;
  const corrections = questions.map((question) => {
    const selected = answerMap.get(question.id) || new Set();
    const correctSet = new Set(question.correctOptionIds || []);
    const isCorrect =
      selected.size === correctSet.size &&
      [...selected].every((opt) => correctSet.has(opt));
    if (isCorrect) correctCount += 1;
    return {
      questionId: question.id,
      correctOptionIds: question.correctOptionIds || [],
      explanation: question.explanation || '',
      isCorrect,
    };
  });

  const total = questions.length || 1;
  const score = Math.round((correctCount / total) * 100);
  const awardedPoints = Math.round(((Number(quiz.points) || 0) * correctCount) / total);

  const user = req.user;
  let newBadges = [];
  if (awardedPoints > 0) {
    const points = (Number(user.points) || 0) + awardedPoints;
    const updated = await store.update('users', user.id, { points });
    newBadges = grantBadges(updated, await store.get('badges'), { quizId: quiz.id });
    if (newBadges.length) await store.update('users', user.id, { badges: updated.badges });
  }

  const fresh = await store.getById('users', user.id);
  res.json({
    score,
    total: questions.length,
    correct: correctCount,
    awardedPoints,
    corrections,
    newBadges: newBadges.map((b) => ({ id: b.id, name: b.name, emoji: b.emoji, description: b.description })),
    progress: progressOf(fresh),
  });
}));

export default router;
