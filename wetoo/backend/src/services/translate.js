// Traduction automatique du contenu éditorial pour l'affichage en anglais.
// Aucune donnée n'est écrite en base : la traduction est faite à la volée,
// puis mise en cache mémoire pour limiter les appels au service externe.
// Approche frugale : service public sans clé API, avec repli sur l'original.

const CACHE = new Map();
const MAX_CACHE = 4000;
const CONCURRENCY = 6;

let active = 0;
const waiting = [];

/** File d'attente simple pour limiter les appels simultanés au service externe. */
function withLimit(task) {
  return new Promise((resolve, reject) => {
    const run = () => {
      active += 1;
      task()
        .then(resolve, reject)
        .finally(() => {
          active -= 1;
          const next = waiting.shift();
          if (next) next();
        });
    };
    if (active < CONCURRENCY) run();
    else waiting.push(run);
  });
}

/** Service principal : endpoint public Google (aucune clé requise). */
async function viaGoogle(text, from, to) {
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t' +
    `&sl=${from}&tl=${to}&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'WeToo/1.0' } });
  if (!res.ok) throw new Error(`translate google ${res.status}`);
  const data = await res.json();
  const segments = Array.isArray(data?.[0]) ? data[0] : [];
  const out = segments.map((seg) => (Array.isArray(seg) ? seg[0] : '')).join('');
  if (!out) throw new Error('translate google vide');
  return out;
}

/** Service de repli : MyMemory (aucune clé requise). */
async function viaMyMemory(text, from, to) {
  const url =
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}` +
    `&langpair=${from}|${to}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`translate mymemory ${res.status}`);
  const data = await res.json();
  const out = data?.responseData?.translatedText;
  if (!out) throw new Error('translate mymemory vide');
  return out;
}

/**
 * Traduit une chaîne et mémorise le résultat.
 * En cas d'échec des deux services, renvoie le texte d'origine (jamais d'erreur).
 */
export async function translateText(text, to = 'en', from = 'fr') {
  const key = `${from}|${to}|${text}`;
  if (CACHE.has(key)) return CACHE.get(key);

  const translated = await withLimit(async () => {
    try {
      return await viaGoogle(text, from, to);
    } catch {
      try {
        return await viaMyMemory(text, from, to);
      } catch {
        return text;
      }
    }
  });

  if (CACHE.size >= MAX_CACHE) CACHE.delete(CACHE.keys().next().value);
  CACHE.set(key, translated);
  return translated;
}

/* --------------------------- Sélection des champs --------------------------- */

// Champs jamais traduits : identifiants, technique, données personnelles, énums.
const SKIP_KEYS = new Set([
  'id', 'slug', 'code', 'key', 'url', 'href', 'to', 'link', 'icon', 'emoji',
  'image', 'imageUrl', 'avatar', 'photo', 'color', 'hex', 'email', 'phone',
  'telephone', 'tel', 'password', 'token', 'sessionId', 'userId', 'authorId',
  'createdAt', 'updatedAt', 'publishedAt', 'date', 'time', 'at', 'status',
  'type', 'role', 'level', 'points', 'count', 'total', 'score', 'rank',
  'latitude', 'longitude', 'lat', 'lng', 'currency', 'lang', 'locale', 'mime',
  'name', 'firstName', 'lastName', 'fullName', 'username', 'displayName',
]);

const RE_URL = /^(https?:\/\/|www\.|\/|mailto:|tel:|#)/i;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RE_DATE = /^\d{4}-\d{2}-\d{2}/;
const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i;
const RE_NUMBER = /^[+\d\s().,%°-]+$/;

function isTranslatable(key, value) {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (v.length < 2) return false;
  if (!/[A-Za-zÀ-ÿ]/.test(v)) return false;
  if (SKIP_KEYS.has(key)) return false;
  if (RE_URL.test(v) || RE_EMAIL.test(v) || RE_DATE.test(v) || RE_UUID.test(v)) return false;
  if (RE_NUMBER.test(v)) return false;
  return true;
}

/**
 * Parcourt récursivement une charge utile JSON et traduit les chaînes
 * pertinentes, en préservant les identifiants et données non traduisibles.
 * `key` est la clé du parent, transmise aussi aux éléments de tableaux
 * (pour appliquer les mêmes règles aux listes de chaînes).
 */
export async function translatePayload(value, to = 'en', from = 'fr', key = null) {
  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => translatePayload(item, to, from, key)));
  }
  if (value && typeof value === 'object') {
    const out = {};
    await Promise.all(
      Object.keys(value).map(async (k) => {
        out[k] = await translatePayload(value[k], to, from, k);
      })
    );
    return out;
  }
  if (typeof value === 'string' && isTranslatable(key, value)) {
    return translateText(value, to, from);
  }
  return value;
}

export default { translateText, translatePayload };
