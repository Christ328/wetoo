// Modération et sécurité des contenus WeToo.
// - Détection de crise (idées suicidaires, détresse) → orienter vers de l'aide.
// - Détection de mots interdits / insultes → passer le contenu en 'pending'.
import { normalize } from './helpers.js';

// Mots-clés / expressions signalant une situation de détresse (FR + variantes).
export const CRISIS_KEYWORDS = [
  'suicide',
  'me suicider',
  'suicidaire',
  'mourir',
  'je veux mourir',
  'me tuer',
  'je vais me tuer',
  'me faire du mal',
  'automutilation',
  'en finir',
  'en finir avec la vie',
  'passer a l acte',
  'plus envie de vivre',
  'je ne veux plus vivre',
  'je veux disparaitre',
  'plus la force de vivre',
  'mettre fin a mes jours',
  'me pendre',
  'avaler des medicaments',
  'overdose',
  'je n en peux plus de vivre',
  'je veux en finir',
];

// Mots/insultes interdits → contenu mis en attente de modération.
export const BANNED_WORDS = [
  'connard',
  'connasse',
  'salope',
  'pute',
  'putain de',
  'enculé',
  'encule',
  'batard',
  'bâtard',
  'imbecile heureux',
  'nique',
  'va te faire',
  'sale chien',
  'espece de',
  'viol',
];

// Ressources d'urgence renvoyées automatiquement en cas de détresse.
export const CRISIS_RESOURCES = [
  {
    label: "Ligne verte d'écoute Bénin : 137 (gratuit, 24h/24)",
    type: 'helpline',
    url: null,
  },
  {
    label: "SOS Santé Bénin : 112 / Appel d'urgence",
    type: 'helpline',
    url: null,
  },
  {
    label: 'Parle immédiatement à un adulte de confiance : parent, enseignant, infirmier·ère, agent de santé.',
    type: 'advice',
    url: null,
  },
  {
    label: 'Rends-toi au centre de santé le plus proche ou contacte un expert WeToo.',
    type: 'advice',
    url: null,
  },
];

/**
 * Détecte si un texte comporte un signal de crise / détresse.
 */
export function detectCrisis(text = '') {
  const t = normalize(text);
  return CRISIS_KEYWORDS.some((kw) => t.includes(kw));
}

/**
 * Détecte les mots interdits/insultes présents dans un texte. Renvoie la liste des correspondances.
 */
export function detectBanned(text = '') {
  const t = normalize(text);
  return BANNED_WORDS.filter((w) => t.includes(normalize(w)));
}

/**
 * Analyse complète d'un contenu.
 * @returns {{ flags:string[], crisis:boolean, banned:string[], status:'published'|'pending' }}
 */
export function moderate(text = '') {
  const crisis = detectCrisis(text);
  const banned = detectBanned(text);
  const flags = [];
  if (crisis) flags.push('crisis');
  if (banned.length) flags.push('language');
  // Un contenu signalé crise reste publié (utile pour l'orientation) mais est fléché.
  // Un contenu avec mots interdits est mis en attente.
  const status = banned.length ? 'pending' : 'published';
  return { flags, crisis, banned, status };
}
