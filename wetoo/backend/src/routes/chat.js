// Routes du chatbot : thèmes, message, historique, mythes et suggestions.
import { Router } from 'express';
import { store } from '../db/store.js';
import { authOptional } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { id, nowISO, assert } from '../utils/helpers.js';
import chatbot from '../services/chatbot.js';

const router = Router();

// GET /api/chat/topics
router.get('/topics', (req, res) => {
  res.json(chatbot.listTopics());
});

// GET /api/chat/suggestions
router.get('/suggestions', (req, res) => {
  res.json(chatbot.getSuggestions());
});

// GET /api/chat/myths
router.get('/myths', asyncHandler(async (req, res) => {
  const myths = (await store.get('myths')).map((m) => ({
    id: m.id,
    myth: m.myth,
    truth: m.truth,
    category: m.category,
    source: m.source,
  }));
  res.json(myths);
}));

// POST /api/chat/message
router.post('/message', authOptional, asyncHandler(async (req, res) => {
  const { message, sessionId, lang = 'fr' } = req.body || {};
  assert(message && String(message).trim().length > 0, 'Le message ne peut pas être vide.', 'invalid_message');

  // Récupère ou crée la session de conversation (persistée en base).
  let session = sessionId ? await store.getById('chatSessions', sessionId) : null;
  if (!session) {
    session = await store.insert('chatSessions', {
      id: sessionId || id(),
      userId: req.user ? req.user.id : null,
      lang: lang || 'fr',
      messages: [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
    });
  }

  const userText = String(message).trim();
  const reply = chatbot.answer(userText);

  // Historise l'échange (message utilisateur + réponse du bot).
  const messages = Array.isArray(session.messages) ? [...session.messages] : [];
  messages.push({ role: 'user', text: userText, at: nowISO() });
  messages.push({
    role: 'bot',
    text: reply.text,
    at: nowISO(),
    category: reply.category,
    urgent: reply.urgent,
  });
  await store.update('chatSessions', session.id, { messages, updatedAt: nowISO() });

  res.json({ sessionId: session.id, reply });
}));

// GET /api/chat/history?sessionId=...
router.get('/history', authOptional, asyncHandler(async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) {
    return res.json({ sessionId: null, messages: [] });
  }
  const session = await store.getById('chatSessions', String(sessionId));
  if (!session) {
    return res.json({ sessionId: String(sessionId), messages: [] });
  }
  return res.json({ sessionId: session.id, messages: session.messages || [] });
}));

export default router;
