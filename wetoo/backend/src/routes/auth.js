// Routes d'authentification : inscription, connexion, déconnexion et profil.
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { store } from '../db/store.js';
import {
  authRequired,
  signToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  id,
  nowISO,
  toPublicUser,
  isValidEmail,
  assert,
  ApiError,
} from '../utils/helpers.js';

const router = Router();

const GENDERS = ['fille', 'garçon', 'autre'];
const AVATARS = ['🙂', '🌸', '⚽', '📚', '🎨', '🌻', '🔥', '💙', '🌈', '🎧'];

/** Recherche un utilisateur par email (insensible à la casse). */
async function findByEmail(email) {
  const target = String(email).trim().toLowerCase();
  return store.findOne('users', (u) => u.email.toLowerCase() === target);
}

// POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, age, gender, region } = req.body || {};

  // Validations.
  assert(name && String(name).trim().length >= 2, 'Le nom est requis (2 caractères minimum).', 'invalid_name');
  assert(email && isValidEmail(email), 'Adresse email invalide.', 'invalid_email');
  assert(password && String(password).length >= 6, 'Le mot de passe doit contenir au moins 6 caractères.', 'invalid_password');
  if (gender !== undefined && gender !== null && gender !== '') {
    assert(GENDERS.includes(gender), `Le genre doit être l'un de : ${GENDERS.join(', ')}.`, 'invalid_gender');
  }
  // Âge : optionnel. S'il est fourni, il doit être compris entre 18 et 29 ans (exigence du challenge).
  let safeAge = null;
  if (age !== undefined && age !== null && age !== '') {
    const n = Number(age);
    assert(Number.isInteger(n), "L'âge doit être un nombre entier.", 'invalid_age');
    assert(n >= 18 && n <= 29, "L'âge doit être compris entre 18 et 29 ans pour cette plateforme.", 'age_out_of_range');
    safeAge = n;
  }

  // Unicité de l'email.
  if (await findByEmail(email)) {
    throw new ApiError(409, 'Un compte existe déjà avec cet email.', 'email_taken');
  }

  const passwordHash = bcrypt.hashSync(String(password), 10);
  const user = await store.insert('users', {
    id: id(),
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    passwordHash,
    age: safeAge,
    gender: gender || null,
    region: region || null,
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    interests: [],
    points: 0,
    badges: ['b-first'], // badge de bienvenue
    completedLessons: [],
    streak: 0,
    createdAt: nowISO(),
  });

  res.cookie(SESSION_COOKIE, signToken(user), sessionCookieOptions());
  res.status(201).json({ user: toPublicUser(user) });
}));

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  assert(email && isValidEmail(email), 'Adresse email invalide.', 'invalid_email');
  assert(password, 'Le mot de passe est requis.', 'invalid_password');

  const user = await findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Email ou mot de passe incorrect.', 'invalid_credentials');
  }
  const ok = bcrypt.compareSync(String(password), user.passwordHash);
  if (!ok) {
    throw new ApiError(401, 'Email ou mot de passe incorrect.', 'invalid_credentials');
  }

  res.cookie(SESSION_COOKIE, signToken(user), sessionCookieOptions());
  res.json({ user: toPublicUser(user) });
}));

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE, { ...sessionCookieOptions(), maxAge: undefined });
  res.json({ ok: true });
});

// GET /api/auth/me
router.get('/me', authRequired, (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

// PATCH /api/auth/me
router.patch('/me', authRequired, asyncHandler(async (req, res) => {
  const { name, age, gender, region, avatar, interests } = req.body || {};
  const patch = {};

  if (name !== undefined) {
    assert(String(name).trim().length >= 2, 'Le nom doit contenir au moins 2 caractères.', 'invalid_name');
    patch.name = String(name).trim();
  }
  if (age !== undefined) {
    if (age === null || age === '') {
      patch.age = null;
    } else {
      const n = Number(age);
      assert(Number.isInteger(n), "L'âge doit être un nombre entier.", 'invalid_age');
      assert(n >= 18 && n <= 29, "L'âge doit être compris entre 18 et 29 ans.", 'age_out_of_range');
      patch.age = n;
    }
  }
  if (gender !== undefined) {
    assert(gender === null || GENDERS.includes(gender), `Le genre doit être l'un de : ${GENDERS.join(', ')}.`, 'invalid_gender');
    patch.gender = gender;
  }
  if (region !== undefined) patch.region = region || null;
  if (avatar !== undefined) patch.avatar = avatar || '🙂';
  if (interests !== undefined) {
    assert(Array.isArray(interests), 'Les centres d’intérêt doivent être une liste.', 'invalid_interests');
    patch.interests = interests.map((i) => String(i)).slice(0, 20);
  }

  const updated = await store.update('users', req.user.id, patch);
  res.json({ user: toPublicUser(updated) });
}));

export default router;
