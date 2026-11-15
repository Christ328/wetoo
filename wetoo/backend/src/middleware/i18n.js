// Middleware de traduction à la volée : quand l'appelant demande l'anglais
// (lang=en), les réponses des endpoints de contenu éditorial sont traduites
// avant envoi. Rien n'est jamais écrit en base.
import { translatePayload } from '../services/translate.js';

// Endpoints dont le contenu (éditorial / de référence) doit être traduit.
// Les données utilisateurs, l'authentification et les statistiques en sont exclus.
const TRANSLATABLE_PREFIXES = [
  '/api/chat/myths',
  '/api/chat/topics',
  '/api/chat/suggestions',
  '/api/chat/message',
  '/api/learn',
  '/api/campaigns',
  '/api/experts',
  '/api/resources',
  '/api/gamification',
];

/** L'appelant demande-t-il l'anglais ? (query `lang=en`, en-tête ou corps). */
function wantsEnglish(req) {
  const value = String(req.query.lang || req.get('accept-language') || req.body?.lang || '');
  return value.trim().toLowerCase().startsWith('en');
}

function isTranslatablePath(path) {
  return TRANSLATABLE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export function autoTranslate() {
  return function autoTranslateMiddleware(req, res, next) {
    if (!wantsEnglish(req) || !isTranslatablePath(req.path)) return next();

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      translatePayload(body, 'en', 'fr')
        .then((translated) => originalJson(translated))
        .catch(() => originalJson(body)); // repli : on renvoie l'original
      return res;
    };
    return next();
  };
}

export default autoTranslate;
