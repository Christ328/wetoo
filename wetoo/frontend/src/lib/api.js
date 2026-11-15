/**
 * Client API WeToo.
 * - La session est portée par un cookie « httpOnly » posé par le serveur :
 *   le navigateur l'envoie automatiquement (credentials: 'include').
 *   Aucun jeton ni aucune donnée n'est stocké dans le navigateur.
 * - Gère les erreurs de façon homogène (ApiError).
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(message, status = 0, code = 'ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/* --------------------------- Requête brute --------------------------- */
/** Langue courante : le serveur traduit le contenu éditorial quand c'est « en ». */
function currentLang() {
  if (typeof document !== 'undefined' && document.documentElement.lang) {
    return document.documentElement.lang.slice(0, 2).toLowerCase();
  }
  return 'fr';
}

async function request(method, path, { body, signal, lang } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept-Language': lang || currentLang(),
  };

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    throw new ApiError(
      'Impossible de joindre le serveur. Vérifie ta connexion internet.',
      0,
      'NETWORK'
    );
  }

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = payload?.error?.message || payload?.message || 'Une erreur est survenue.';
    const code = payload?.error?.code || `HTTP_${res.status}`;
    throw new ApiError(message, res.status, code);
  }

  return payload;
}

/* ------------------------------- API ------------------------------- */
export const api = {
  get(path, opts = {}) {
    return request('GET', path, opts);
  },
  post(path, body, opts = {}) {
    return request('POST', path, { ...opts, body });
  },
  patch(path, body, opts = {}) {
    return request('PATCH', path, { ...opts, body });
  },
  delete(path, opts = {}) {
    return request('DELETE', path, opts);
  },
};

export { BASE_URL };
