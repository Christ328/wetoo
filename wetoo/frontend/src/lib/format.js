/** Petits utilitaires de formatage partagés. */

const LOCALES = { fr: 'fr-FR', en: 'en-GB' };

const dateFmtCache = new Map();
const dateTimeFmtCache = new Map();

function localeOf(lang) {
  return LOCALES[lang] || LOCALES.fr;
}

function dateFmtOf(lang) {
  const locale = localeOf(lang);
  if (!dateFmtCache.has(locale)) {
    dateFmtCache.set(
      locale,
      new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    );
  }
  return dateFmtCache.get(locale);
}

function dateTimeFmtOf(lang) {
  const locale = localeOf(lang);
  if (!dateTimeFmtCache.has(locale)) {
    dateTimeFmtCache.set(
      locale,
      new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    );
  }
  return dateTimeFmtCache.get(locale);
}

export function formatDate(value, lang = 'fr') {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return dateFmtOf(lang).format(d);
}

export function formatDateTime(value, lang = 'fr') {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return dateTimeFmtOf(lang).format(d);
}

/** Libellés relatifs localisés (utilisés par `timeAgo`). */
const RELATIVE = {
  fr: {
    now: "à l'instant",
    minutes: (n) => `il y a ${n} min`,
    hours: (n) => `il y a ${n} h`,
    days: (n) => `il y a ${n} j`,
  },
  en: {
    now: 'just now',
    minutes: (n) => `${n} min ago`,
    hours: (n) => `${n} h ago`,
    days: (n) => `${n} d ago`,
  },
};

export function timeAgo(value, lang = 'fr') {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const rel = RELATIVE[lang] || RELATIVE.fr;
  const diff = Date.now() - d.getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return rel.now;
  if (min < 60) return rel.minutes(min);
  const h = Math.round(min / 60);
  if (h < 24) return rel.hours(h);
  const j = Math.round(h / 24);
  if (j < 30) return rel.days(j);
  return formatDate(value, lang);
}

export function initials(name = '') {
  const clean = String(name).trim();
  if (!clean) return '?';
  const parts = clean.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || '').join('');
}

/** Noms des niveaux de gamification, par langue. */
export const LEVEL_NAMES = {
  fr: ['Curieux·se', 'Apprenti·e', 'Éclaireur·se', 'Guide', 'Mentor·e', 'Ambassadrice/Ambassadeur'],
  en: ['Curious', 'Apprentice', 'Explorer', 'Guide', 'Mentor', 'Ambassador'],
};

export function levelName(level, lang = 'fr') {
  const names = LEVEL_NAMES[lang] || LEVEL_NAMES.fr;
  const idx = Math.max(0, Math.min(names.length - 1, (level || 1) - 1));
  return names[idx];
}

export function pluralize(count, singular, plural) {
  return `${count} ${count > 1 ? plural : singular}`;
}
