// Routes des campagnes mensuelles de sensibilisation.
import { Router } from 'express';
import { store } from '../db/store.js';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { id, nowISO, ApiError } from '../utils/helpers.js';

const router = Router();

/** Nombre de participants = base du seed + inscriptions enregistrées. */
async function participantsCount(campaign) {
  const joins = await store.find('campaignJoins', (j) => j.campaignId === campaign.id);
  return (Number(campaign.participants) || 0) + joins.length;
}

/** Forme publique d'une campagne (liste). */
async function campaignSummary(c) {
  return {
    id: c.id,
    month: c.month,
    title: c.title,
    theme: c.theme,
    emoji: c.emoji,
    description: c.description,
    hashtags: c.hashtags || [],
    dateLabel: c.dateLabel,
    participants: await participantsCount(c),
    resources: c.resources || [],
    status: c.status,
  };
}

// GET /api/campaigns
router.get('/', asyncHandler(async (req, res) => {
  const campaigns = await store.get('campaigns');
  res.json(await Promise.all(campaigns.map(campaignSummary)));
}));

// GET /api/campaigns/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const campaign = await store.getById('campaigns', req.params.id);
  if (!campaign) throw new ApiError(404, 'Campagne introuvable.', 'campaign_not_found');
  res.json({
    ...(await campaignSummary(campaign)),
    schedule: campaign.schedule || [],
    facts: campaign.facts || [],
  });
}));

// POST /api/campaigns/:id/join
router.post('/:id/join', authRequired, asyncHandler(async (req, res) => {
  const campaign = await store.getById('campaigns', req.params.id);
  if (!campaign) throw new ApiError(404, 'Campagne introuvable.', 'campaign_not_found');

  const alreadyJoined = await store.findOne(
    'campaignJoins',
    (j) => j.campaignId === campaign.id && j.userId === req.user.id
  );

  let awardedPoints = 0;
  if (!alreadyJoined) {
    await store.insert('campaignJoins', {
      id: id(),
      campaignId: campaign.id,
      userId: req.user.id,
      createdAt: nowISO(),
    });
    awardedPoints = 15;
    await store.update('users', req.user.id, {
      points: (Number(req.user.points) || 0) + awardedPoints,
    });
  }

  res.json({
    joined: true,
    participants: await participantsCount(campaign),
    awardedPoints,
  });
}));

export default router;
