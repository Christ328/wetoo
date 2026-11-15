// Fonctions utilitaires transverses pour toute l'API WeToo.
import crypto from 'node:crypto';

/**
 * Génère un identifiant unique (UUID v4) sans dépendance externe.
 */
export const id = () => crypto.randomUUID();

/**
 * Renvoie la date courante au format ISO 8601 (chaîne).
 */
export const nowISO = () => new Date().toISOString();

/**
 * Transforme une chaîne en identifiant lisible (slug) : minuscules, tirets.
 */
export function slugify(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // suppression des accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// --- Système de niveaux -----------------------------------------------------
// Paliers de points menant au niveau suivant. Nombre de niveaux = LEVELS.length.
const LEVELS = [
  { level: 1, name: 'Débutant·e', min: 0 },
  { level: 2, name: 'Curieux·se', min: 50 },
  { level: 3, name: 'Apprenti·e', min: 150 },
  { level: 4, name: 'Connaisseur·se', min: 300 },
  { level: 5, name: 'Éclaireur·se', min: 600 },
  { level: 6, name: 'Mentor·e', min: 1000 },
  { level: 7, name: 'Ambassadrice/Ambassadeur WeToo', min: 1600 },
];

/**
 * Calcule le niveau, le nom du niveau, le prochain palier et la progression (0-100)
 * à partir d'un total de points.
 */
export function levelFromPoints(points = 0) {
  const pts = Math.max(0, Number(points) || 0);
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (pts >= lvl.min) current = lvl;
  }
  const next = LEVELS.find((l) => l.min > current.min) || null;
  const nextLevelAt = next ? next.min : current.min;
  const span = next ? next.min - current.min : 1;
  const progressPct = next
    ? Math.min(100, Math.round(((pts - current.min) / span) * 100))
    : 100;
  return {
    level: current.level,
    levelName: current.name,
    nextLevelAt,
    progressPct,
  };
}

/**
 * Pseudo anonyme STABLE dérivé d'un identifiant (ex : "Jeune Anonyme #4821").
 * Le même utilisateur/post donne toujours le même pseudonyme.
 */
export function anonPseudonym(seedStr = '') {
  const hash = crypto.createHash('sha256').update(String(seedStr)).digest('hex');
  const num = parseInt(hash.slice(0, 6), 16) % 9000 + 1000; // entre 1000 et 9999
  return `Jeune Anonyme #${num}`;
}

/**
 * Pagination générique : renvoie un sous-ensemble + les métadonnées.
 */
export function paginate(array = [], page = 1, pageSize = 20) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));
  const start = (p - 1) * size;
  const items = array.slice(start, start + size);
  return {
    items,
    page: p,
    pageSize: size,
    total: array.length,
    totalPages: Math.ceil(array.length / size) || 1,
  };
}

/**
 * Réduit un texte à un extrait (excerpt) propre.
 */
export function excerpt(text = '', max = 180) {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

/**
 * Validation basique d'un email.
 */
export function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

/**
 * Normalise une chaîne (minuscules, sans accents) pour la recherche.
 */
export function normalize(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Fonction publique de sérialisation d'un utilisateur.
 * NE RENVOIE JAMAIS le mot de passe (passwordHash).
 */
export function toPublicUser(user) {
  if (!user) return null;
  const { level, levelName, nextLevelAt, progressPct } = levelFromPoints(user.points);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    age: user.age ?? null,
    gender: user.gender ?? null,
    region: user.region ?? null,
    avatar: user.avatar ?? '🙂',
    interests: Array.isArray(user.interests) ? user.interests : [],
    points: Number(user.points) || 0,
    level,
    levelName,
    nextLevelAt,
    progressPct,
    badges: Array.isArray(user.badges) ? user.badges : [],
    completedLessons: Array.isArray(user.completedLessons) ? user.completedLessons : [],
    streak: Number(user.streak) || 0,
    createdAt: user.createdAt,
  };
}

// --- Attribution des badges ------------------------------------------------
// Chaque règle décide si un badge doit être accordé selon le contexte fourni.
const BADGE_RULES = {
  'b-next': () => false, // placeholder de sécurité
  'b-curieux': (ctx) => (ctx.lessonsDone || 0) >= 1,
  'b-expert': (ctx) => (ctx.lessonsDone || 0) >= 5,
  'b-sante': (ctx) => Boolean(ctx.isMentalLesson),
  'b-allie': (ctx) => Boolean(ctx.socialAction),
  'b-sans-tabou': (ctx) => (ctx.postsCount || 0) >= 3,
  'b-mythes': (ctx) => ctx.quizId === 'quiz-mythes',
  'b-soutien': (ctx) => (ctx.helpfulReceived || 0) >= 5,
  'b-regulier': (ctx) => (ctx.streak || 0) >= 7,
  'b-ambassadeur': (ctx) => (ctx.points || 0) >= 1000,
};

/**
 * Accorde les nouveaux badges mérités par un utilisateur, sans doublon.
 * Mutate `user.badges` et renvoie la liste des badges nouvellement obtenus.
 * @param {object} user utilisateur (déjà à jour côté points/streak)
 * @param {Array} catalog catalogue des badges (collection 'badges')
 * @param {object} ctx contexte : { lessonsDone, isMentalLesson, socialAction, postsCount, quizId, helpfulReceived }
 */
export function grantBadges(user, catalog = [], ctx = {}) {
  const owned = new Set(user.badges || []);
  const ctxAll = { ...ctx, points: user.points, streak: user.streak };
  const added = [];
  for (const badge of catalog) {
    if (owned.has(badge.id)) continue;
    const rule = BADGE_RULES[badge.id];
    if (rule && rule(ctxAll)) {
      user.badges = [...(user.badges || []), badge.id];
      owned.add(badge.id);
      added.push(badge);
    }
  }
  return added;
}

/**
 * Erreur applicative porteuse d'un code HTTP et d'un code métier.
 * Utilisée partout pour produire des réponses { error: { message, code } }.
 */
export class ApiError extends Error {
  constructor(status, message, code = 'error') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * Petit assistant de validation : lève une ApiError 400 si la condition est fausse.
 */
export function assert(condition, message, code = 'validation_error') {
  if (!condition) throw new ApiError(400, message, code);
}
