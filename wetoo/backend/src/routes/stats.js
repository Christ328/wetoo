// Routes de statistiques, ressources d'aide et santé du service.
import { Router } from 'express';
import { store } from '../db/store.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const VERSION = '1.0.0';

// GET /api/stats
router.get('/stats', asyncHandler(async (req, res) => {
  const users = await store.get('users');
  const lessonsCompleted = users.reduce(
    (sum, u) => sum + (u.completedLessons || []).length,
    0
  );
  const questionsAnswered = (await store.get('chatSessions'))
    .reduce((sum, s) => sum + (s.messages || []).filter((m) => m.role === 'user').length, 0);
  const campaignParticipants = (await store.get('campaigns'))
    .reduce((sum, c) => sum + (Number(c.participants) || 0), 0);

  res.json({
    users: users.length,
    lessonsCompleted,
    questionsAnswered,
    mythsBusted: (await store.get('myths')).length,
    campaignParticipants,
    expertsOnline: (await store.get('experts')).length,
    testimonials: await store.get('testimonials'),
  });
}));

// GET /api/resources/helplines
router.get('/resources/helplines', asyncHandler(async (req, res) => {
  res.json(await store.get('helplines'));
}));

// GET /api/health
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    version: VERSION,
  });
});

export default router;
