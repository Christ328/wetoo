// Routes du forum communautaire : catégories, posts, réponses, réactions, signalements.
import { Router } from 'express';
import { store } from '../db/store.js';
import { authRequired } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { moderate, CRISIS_RESOURCES } from '../utils/moderation.js';
import {
  id,
  nowISO,
  excerpt,
  anonPseudonym,
  normalize,
  assert,
  ApiError,
  grantBadges,
} from '../utils/helpers.js';

const router = Router();

/** Représentation publique de l'auteur d'un contenu (jamais d'identité si anonyme). */
async function publicAuthor(doc) {
  if (doc.anonymous || !doc.authorId) {
    return { name: 'Anonyme', avatar: '🕵️' };
  }
  const user = await store.getById('users', doc.authorId);
  return { name: user ? user.name : 'Anonyme', avatar: user ? user.avatar : '🙂' };
}

/** Forme abrégée d'un post pour les listes. */
async function postSummary(post) {
  const repliesCount = (await store.find('replies', (r) => r.postId === post.id)).length;
  const author = await publicAuthor(post);
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt || excerpt(post.body || ''),
    category: post.category,
    anonymous: Boolean(post.anonymous),
    author,
    authorPseudonym: post.anonymous ? anonPseudonym(post.id) : null,
    createdAt: post.createdAt,
    reactions: post.reactions || { support: 0, helpful: 0 },
    repliesCount,
    flags: post.flags || [],
    status: post.status || 'published',
  };
}

/** Attribue points et badges après une action sociale publiée. */
async function rewardSocial(req, extraCtx = {}) {
  const points = (Number(req.user.points) || 0) + 5;
  const updated = await store.update('users', req.user.id, { points });
  const postsCount =
    (await store.find('posts', (p) => p.authorId === req.user.id)).length +
    (await store.find('replies', (r) => r.authorId === req.user.id)).length;
  grantBadges(updated, await store.get('badges'), { socialAction: true, postsCount, ...extraCtx });
  await store.update('users', req.user.id, { badges: updated.badges });
}

// GET /api/community/categories
router.get('/categories', asyncHandler(async (req, res) => {
  const posts = await store.find('posts', (p) => (p.status || 'published') === 'published');
  const categories = (await store.get('categories')).map((c) => ({
    id: c.id,
    label: c.label,
    description: c.description,
    emoji: c.emoji,
    color: c.color,
    count: posts.filter((p) => p.category === c.id).length,
  }));
  res.json(categories);
}));

// GET /api/community/posts?category=&sort=recent|popular&q=
router.get('/posts', asyncHandler(async (req, res) => {
  const { category, sort = 'recent', q } = req.query;
  let posts = await store.find('posts', (p) => (p.status || 'published') === 'published');

  if (category) posts = posts.filter((p) => p.category === category);
  if (q) {
    const needle = normalize(q);
    posts = posts.filter(
      (p) => normalize(p.title).includes(needle) || normalize(p.body).includes(needle)
    );
  }

  if (sort === 'popular') {
    posts = [...posts].sort((a, b) => {
      const ra = (a.reactions?.support || 0) + (a.reactions?.helpful || 0);
      const rb = (b.reactions?.support || 0) + (b.reactions?.helpful || 0);
      if (rb !== ra) return rb - ra;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  } else {
    posts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json(await Promise.all(posts.map(postSummary)));
}));

// POST /api/community/posts
router.post('/posts', authRequired, asyncHandler(async (req, res) => {
  const { title, body, category, anonymous } = req.body || {};
  assert(title && String(title).trim().length >= 5, 'Le titre doit contenir au moins 5 caractères.', 'invalid_title');
  assert(body && String(body).trim().length >= 10, 'Le contenu doit contenir au moins 10 caractères.', 'invalid_body');
  assert(category && (await store.getById('categories', category)), 'Catégorie invalide.', 'invalid_category');

  const mod = moderate(`${title} ${body}`);
  const post = await store.insert('posts', {
    id: id(),
    title: String(title).trim(),
    body: String(body).trim(),
    excerpt: excerpt(body),
    category,
    anonymous: Boolean(anonymous),
    authorId: anonymous ? null : req.user.id,
    status: mod.status,
    flags: mod.flags,
    reactions: { support: 0, helpful: 0 },
    createdAt: nowISO(),
  });

  // Récompense de participation.
  if (mod.status === 'published') {
    await rewardSocial(req);
  }

  const response = { ...(await postSummary(post)) };
  if (mod.crisis) {
    response.resources = CRISIS_RESOURCES;
    response.message =
      'Nous tenons à toi. Ta publication a bien été enregistrée. Si tu traverses un moment difficile, parle à un adulte de confiance ou appelle la ligne 137 (gratuit, 24h/24).';
  }
  if (mod.status === 'pending') {
    response.message =
      'Ton message a été mis en attente de modération car il contient des termes qui ne respectent pas nos règles de bienveillance. Il sera vérifié prochainement.';
  }

  res.status(201).json(response);
}));

// GET /api/community/posts/:id
router.get('/posts/:id', asyncHandler(async (req, res) => {
  const post = await store.getById('posts', req.params.id);
  if (!post) throw new ApiError(404, 'Publication introuvable.', 'post_not_found');

  const replies = await store.find(
    'replies',
    (r) => r.postId === post.id && (r.status || 'published') === 'published'
  );
  replies.sort((a, b) => {
    if (a.isBestAnswer !== b.isBestAnswer) return a.isBestAnswer ? -1 : 1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const mappedReplies = await Promise.all(replies.map(async (r) => ({
    id: r.id,
    body: r.body,
    anonymous: Boolean(r.anonymous),
    author: await publicAuthor(r),
    authorPseudonym: r.anonymous ? anonPseudonym(r.id) : null,
    createdAt: r.createdAt,
    reactions: r.reactions || { support: 0, helpful: 0 },
    isBestAnswer: Boolean(r.isBestAnswer),
    flags: r.flags || [],
  })));

  res.json({ ...(await postSummary(post)), body: post.body, replies: mappedReplies });
}));

// POST /api/community/posts/:id/replies
router.post('/posts/:id/replies', authRequired, asyncHandler(async (req, res) => {
  const post = await store.getById('posts', req.params.id);
  if (!post) throw new ApiError(404, 'Publication introuvable.', 'post_not_found');

  const { body, anonymous } = req.body || {};
  assert(body && String(body).trim().length >= 5, 'La réponse doit contenir au moins 5 caractères.', 'invalid_body');

  const mod = moderate(body);
  const reply = await store.insert('replies', {
    id: id(),
    postId: post.id,
    body: String(body).trim(),
    anonymous: Boolean(anonymous),
    authorId: anonymous ? null : req.user.id,
    status: mod.status,
    flags: mod.flags,
    isBestAnswer: false,
    reactions: { support: 0, helpful: 0 },
    createdAt: nowISO(),
  });

  if (mod.status === 'published') {
    await rewardSocial(req);
  }

  const response = {
    id: reply.id,
    postId: reply.postId,
    body: reply.body,
    anonymous: reply.anonymous,
    author: await publicAuthor(reply),
    authorPseudonym: reply.anonymous ? anonPseudonym(reply.id) : null,
    createdAt: reply.createdAt,
    reactions: reply.reactions,
    isBestAnswer: reply.isBestAnswer,
    flags: reply.flags,
    status: reply.status,
  };
  if (mod.crisis) {
    response.resources = CRISIS_RESOURCES;
    response.message =
      'Merci de partager cela. Si tu es en détresse, tu n’es pas seul·e : appelle la ligne 137 (gratuit, 24h/24) ou parle à un adulte de confiance.';
  }
  res.status(201).json(response);
}));

// POST /api/community/posts/:id/react
router.post('/posts/:id/react', authRequired, asyncHandler(async (req, res) => {
  const post = await store.getById('posts', req.params.id);
  if (!post) throw new ApiError(404, 'Publication introuvable.', 'post_not_found');

  const { type } = req.body || {};
  assert(['support', 'helpful'].includes(type), 'Le type de réaction doit être « support » ou « helpful ».', 'invalid_reaction');

  const reactions = post.reactions || { support: 0, helpful: 0 };
  reactions[type] = (reactions[type] || 0) + 1;
  await store.update('posts', post.id, { reactions });

  // Trace la réaction et récompense l'auteur de la réaction.
  await store.insert('reactions', {
    id: id(),
    postId: post.id,
    userId: req.user.id,
    type,
    createdAt: nowISO(),
  });
  const updated = await store.update('users', req.user.id, {
    points: (Number(req.user.points) || 0) + 1,
  });
  grantBadges(updated, await store.get('badges'), { socialAction: true });
  await store.update('users', req.user.id, { badges: updated.badges });

  res.json({ reactions });
}));

// POST /api/community/posts/:id/report
router.post('/posts/:id/report', authRequired, asyncHandler(async (req, res) => {
  const post = await store.getById('posts', req.params.id);
  if (!post) throw new ApiError(404, 'Publication introuvable.', 'post_not_found');

  const { reason } = req.body || {};
  assert(reason && String(reason).trim().length >= 3, 'Merci d’indiquer la raison du signalement.', 'invalid_reason');

  await store.insert('reports', {
    id: id(),
    postId: post.id,
    userId: req.user.id,
    reason: String(reason).trim(),
    status: 'received',
    createdAt: nowISO(),
  });

  res.json({ ok: true, message: 'Merci, ton signalement a bien été transmis à notre équipe de modération.' });
}));

// GET /api/community/whatsapp
router.get('/whatsapp', (req, res) => {
  res.json({
    link: 'https://chat.whatsapp.com/wetoo-communaute-benin',
    groups: [
      {
        id: 'g-1',
        name: 'WeToo — Questions santé (18-29)',
        description: 'Poser des questions santé en toute bienveillance, avec des réponses d’experts.',
        members: 312,
        link: 'https://chat.whatsapp.com/wetoo-questions-sante',
      },
      {
        id: 'g-2',
        name: 'WeToo — Bien-être mental',
        description: 'Un espace d’écoute et de soutien pour parler de ses émotions.',
        members: 205,
        link: 'https://chat.whatsapp.com/wetoo-bienetre-mental',
      },
      {
        id: 'g-3',
        name: 'WeToo — Jeunes ambassadeurs',
        description: 'Pour les membres motivés qui veulent faire vivre la communauté.',
        members: 87,
        link: 'https://chat.whatsapp.com/wetoo-ambassadeurs',
      },
    ],
    rules: [
      'Bienveillance et respect : aucun jugement, aucune insulte.',
      'Confidentialité : ne partage jamais l’identité ou l’histoire de quelqu’un d’autre.',
      'Pas de contenu dangereux ni de conseils médicaux non professionnels.',
      'En cas d’urgence, contacte directement la ligne 137 ou le 112.',
      'L’espace est réservé aux 18-29 ans.',
    ],
  });
});

export default router;
