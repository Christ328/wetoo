// Routes des experts : annuaire, détail et demandes de mise en relation.
import { Router } from 'express';
import { store } from '../db/store.js';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { id, nowISO, assert, ApiError } from '../utils/helpers.js';

const router = Router();

const CONTACT_PREFERENCES = ['chat', 'sms', 'call', 'whatsapp'];

// GET /api/experts?specialty=
router.get('/', asyncHandler(async (req, res) => {
  const { specialty } = req.query;
  let experts = await store.get('experts');
  if (specialty) {
    const needle = String(specialty).toLowerCase();
    experts = experts.filter(
      (e) =>
        e.specialty.toLowerCase().includes(needle) ||
        e.role.toLowerCase().includes(needle)
    );
  }
  res.json(
    experts.map((e) => ({
      id: e.id,
      name: e.name,
      role: e.role,
      specialty: e.specialty,
      bio: e.bio,
      languages: e.languages || [],
      availability: e.availability,
      avatar: e.avatar,
      rating: e.rating,
      sessionsDone: e.sessionsDone,
    }))
  );
}));

// GET /api/experts/me/requests — mes demandes (déclaré avant /:id).
router.get('/me/requests', authRequired, asyncHandler(async (req, res) => {
  const requests = (await store.find('expertRequests', (r) => r.userId === req.user.id))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((r) => ({
      id: r.id,
      expertId: r.expertId,
      expertName: r.expertName,
      question: r.question,
      status: r.status,
      createdAt: r.createdAt,
    }));
  res.json(requests);
}));

// POST /api/experts/:id/requests
router.post('/:id/requests', authRequired, asyncHandler(async (req, res) => {
  const expert = await store.getById('experts', req.params.id);
  if (!expert) throw new ApiError(404, 'Expert introuvable.', 'expert_not_found');

  const { question, contactPreference, contactValue } = req.body || {};
  assert(question && String(question).trim().length >= 10, 'Merci de détailler ta question (10 caractères minimum).', 'invalid_question');
  assert(
    contactPreference && CONTACT_PREFERENCES.includes(contactPreference),
    `La préférence de contact doit être l'une de : ${CONTACT_PREFERENCES.join(', ')}.`,
    'invalid_contact_preference'
  );
  if (contactPreference !== 'chat') {
    assert(contactValue && String(contactValue).trim().length >= 5, 'Merci d’indiquer un moyen de contact (numéro, email…).', 'invalid_contact_value');
  }

  const etaHours = 48;
  const request = await store.insert('expertRequests', {
    id: id(),
    userId: req.user.id,
    expertId: expert.id,
    expertName: expert.name,
    question: String(question).trim(),
    contactPreference,
    contactValue: contactValue ? String(contactValue).trim() : null,
    status: 'received',
    etaHours,
    createdAt: nowISO(),
  });

  res.status(201).json({
    id: request.id,
    status: 'received',
    etaHours,
    message: `Ta demande a bien été transmise à ${expert.name}. Tu recevras une réponse sous environ ${etaHours} heures, en toute confidentialité.`,
  });
}));

// GET /api/experts/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const expert = await store.getById('experts', req.params.id);
  if (!expert) throw new ApiError(404, 'Expert introuvable.', 'expert_not_found');
  res.json(expert);
}));

export default router;
