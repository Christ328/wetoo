// Middlewares d'authentification.
// La session est portée par un cookie « httpOnly » posé par le serveur :
// aucun jeton n'est stocké dans le navigateur (ni localStorage, ni JS accessible).
import jwt from 'jsonwebtoken';
import { store } from '../db/store.js';
import { ApiError } from '../utils/helpers.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'wetoo-dev-secret';
export const JWT_EXPIRES_IN = '7d';
export const SESSION_COOKIE = 'wetoo_session';

/** Génère un token JWT pour un utilisateur. */
export function signToken(user) {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/** Options du cookie de session (httpOnly : illisible depuis le JavaScript client). */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  };
}

/** Lit une valeur dans l'en-tête « Cookie » de la requête. */
function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    if (part.slice(0, separator).trim() === name) {
      return decodeURIComponent(part.slice(separator + 1).trim());
    }
  }
  return null;
}

/** Extrait le jeton : cookie de session, puis en-tête Authorization en secours. */
function extractToken(req) {
  const fromCookie = readCookie(req, SESSION_COOKIE);
  if (fromCookie) return fromCookie;
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

/**
 * Middleware strict : exige une session valide, sinon 401.
 * Attache l'utilisateur à req.user.
 */
export async function authRequired(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return next(new ApiError(401, 'Authentification requise.', 'unauthorized'));
  }
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return next(new ApiError(401, 'Session invalide ou expirée, reconnecte-toi.', 'unauthorized'));
  }
  try {
    const user = await store.getById('users', payload.sub);
    if (!user) {
      return next(new ApiError(401, 'Session invalide, veuillez vous reconnecter.', 'unauthorized'));
    }
    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Middleware permissif : attache req.user si une session valide est présente,
 * sinon laisse passer.
 */
export async function authOptional(req, res, next) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await store.getById('users', payload.sub);
    if (user) req.user = user;
  } catch {
    // On ignore silencieusement : la route reste accessible.
  }
  return next();
}
