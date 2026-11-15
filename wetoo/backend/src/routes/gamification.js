// Routes de gamification : progression personnelle, classement et badges.
import { Router } from 'express';
import { store } from '../db/store.js';
import { authRequired, authOptional } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { levelFromPoints } from '../utils/helpers.js';

const router = Router();

// GET /api/gamification/me
router.get('/me', authRequired, asyncHandler(async (req, res) => {
  const user = req.user;
  const lvl = levelFromPoints(user.points);
  const badges = (await store.get('badges')).filter((b) => (user.badges || []).includes(b.id));

  // Rang de l'utilisateur dans le classement général.
  const ranked = [...(await store.get('users'))].sort((a, b) => (b.points || 0) - (a.points || 0));
  const rank = ranked.findIndex((u) => u.id === user.id) + 1;

  res.json({
    points: Number(user.points) || 0,
    level: lvl.level,
    levelName: lvl.levelName,
    nextLevelAt: lvl.nextLevelAt,
    progressPct: lvl.progressPct,
    badges: badges.map((b) => ({ id: b.id, name: b.name, emoji: b.emoji, description: b.description, criteria: b.criteria })),
    streak: Number(user.streak) || 0,
    completedLessonsCount: (user.completedLessons || []).length,
    rank,
  });
}));

// GET /api/gamification/leaderboard
router.get('/leaderboard', authOptional, asyncHandler(async (req, res) => {
  const ranked = [...(await store.get('users'))].sort((a, b) => (b.points || 0) - (a.points || 0));
  const entries = ranked.slice(0, 10).map((u, i) => ({
    rank: i + 1,
    name: u.name,
    avatar: u.avatar,
    points: Number(u.points) || 0,
    level: levelFromPoints(u.points).level,
    isMe: req.user ? u.id === req.user.id : undefined,
  }));

  const payload = { entries };
  if (req.user) {
    const myRank = ranked.findIndex((u) => u.id === req.user.id) + 1;
    payload.me = {
      rank: myRank,
      name: req.user.name,
      avatar: req.user.avatar,
      points: Number(req.user.points) || 0,
      level: levelFromPoints(req.user.points).level,
    };
  }
  res.json(payload);
}));

// GET /api/gamification/badges
router.get('/badges', asyncHandler(async (req, res) => {
  const badges = (await store.get('badges')).map((b) => ({
    id: b.id,
    name: b.name,
    emoji: b.emoji,
    description: b.description,
    criteria: b.criteria,
  }));
  res.json(badges);
}));

export default router;
