// Moteur de chatbot WeToo : recherche par mots-clés scorée, SANS IA externe.
// Technologie frugale, fonctionne hors-ligne avec la base de connaissances locale.
import { KNOWLEDGE } from '../data/knowledge.js';
import { detectCrisis } from '../utils/moderation.js';
import { normalize } from '../utils/helpers.js';

// Thèmes proposés à l'utilisateur (6 à 8).
export const TOPICS = [
  {
    id: 'puberte',
    label: 'Puberté & corps',
    icon: '🌱',
    sampleQuestions: [
      'Quels changements mon corps va-t-il connaître ?',
      'Est-ce normal d’avoir des sautes d’humeur ?',
      'À quel âge commence la puberté ?',
    ],
  },
  {
    id: 'contraception',
    label: 'Contraception',
    icon: '💊',
    sampleQuestions: [
      'Quelles sont les méthodes de contraception ?',
      'La pilule rend-elle stérile ?',
      'Où trouver une contraception au Bénin ?',
    ],
  },
  {
    id: 'ist',
    label: 'IST / VIH',
    icon: '🩺',
    sampleQuestions: [
      'Comment se protéger des IST ?',
      'Le VIH se transmet-il par le baiser ?',
      'Où se faire dépister ?',
    ],
  },
  {
    id: 'consentement',
    label: 'Consentement & relations',
    icon: '🤝',
    sampleQuestions: [
      'C’est quoi le consentement ?',
      'Comment reconnaître une relation toxique ?',
      'Comment fixer mes limites ?',
    ],
  },
  {
    id: 'sante-mentale',
    label: 'Santé mentale',
    icon: '🧠',
    sampleQuestions: [
      'Comment gérer le stress ?',
      'Suis-je déprimé·e ?',
      'Je me sens seul·e, que faire ?',
    ],
  },
  {
    id: 'grossesse',
    label: 'Grossesse',
    icon: '🤰',
    sampleQuestions: [
      'Comment savoir si je suis enceinte ?',
      'Que faire en cas de rapport non protégé ?',
      'Quelles options en cas de grossesse non désirée ?',
    ],
  },
  {
    id: 'regles',
    label: 'Règles & hygiène',
    icon: '🩸',
    sampleQuestions: [
      'Comment se passent les règles ?',
      'Comment soulager les douleurs ?',
      'Quelle protection choisir ?',
    ],
  },
  {
    id: 'orientation',
    label: 'Orientation sexuelle',
    icon: '🌈',
    sampleQuestions: [
      'Comment comprendre mon orientation ?',
      'Comment me sentir accepté·e ?',
      'Où trouver un espace sûr ?',
    ],
  },
];

// Questions suggérées proposées en accueil du chat.
const SUGGESTIONS = [
  'Comment se protéger des IST ?',
  'La pilule rend-elle stérile ?',
  'J’ai eu un rapport non protégé, que faire ?',
  'Comment gérer le stress et l’anxiété ?',
  'C’est quoi le consentement ?',
  'Comment se passent les règles ?',
  'Le VIH se transmet-il par le baiser ?',
  'Où trouver de l’aide au Bénin ?',
];

export function listTopics() {
  return TOPICS;
}

export function getSuggestions() {
  return SUGGESTIONS;
}

/**
 * Score de correspondance d'une entrée pour un message donné.
 * Les mots-clés plus longs pèsent davantage (plus spécifiques).
 */
function scoreEntry(entry, normalizedMessage) {
  let score = 0;
  for (const kw of entry.keywords) {
    const k = normalize(kw);
    if (!k) continue;
    if (normalizedMessage.includes(k)) {
      score += 1 + k.length / 20;
    }
  }
  return score;
}

/**
 * Sélectionne la meilleure entrée de connaissances pour un message.
 * @returns {{ entry: object|null, score:number, alternatives:object[] }}
 */
export function matchKnowledge(message = '') {
  const normalized = normalize(message);
  const scored = KNOWLEDGE
    .map((entry) => ({ entry, score: scoreEntry(entry, normalized) }))
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  return {
    entry: best && best.score > 0 ? best.entry : null,
    score: best ? best.score : 0,
    alternatives: scored.slice(1, 4).map((s) => s.entry),
  };
}

/** Actions proposées dans chaque réponse (navigation front). */
function defaultActions(urgent = false) {
  const actions = [
    { type: 'navigate', label: 'Voir les cours', to: '/learn' },
    { type: 'navigate', label: 'Parler à un expert', to: '/experts' },
  ];
  if (urgent) {
    actions.unshift({ type: 'urgent', label: 'Contacter une ligne d’écoute', to: '/resources' });
  }
  return actions;
}

/** Construit l'objet réponse standard à partir d'une entrée. */
function buildReplyFromEntry(entry, confidence) {
  return {
    id: `rep-${entry.id}`,
    text: entry.answer,
    category: entry.category,
    confidence: Math.max(0, Math.min(1, confidence)),
    sources: entry.sources || [],
    followUps: entry.followUps || [],
    urgent: Boolean(entry.urgent),
    resources: entry.resources || [],
    actions: defaultActions(Boolean(entry.urgent)),
  };
}

/** Réponse de repli bienveillante quand aucun sujet ne correspond. */
function fallbackReply() {
  return {
    id: 'rep-fallback',
    text:
      "Je ne suis pas certain·e d’avoir bien compris ta question, mais je suis là pour t’aider. Tu peux reformuler, ou choisir un thème ci-dessous. Si ta question est sensible ou urgente, un expert WeToo peut te répondre en toute confidentialité, et la ligne verte 137 est disponible 24h/24 au Bénin.",
    category: 'Général',
    confidence: 0.2,
    sources: [{ title: 'WeToo — Espace d’aide', label: 'WeToo', url: null }],
    followUps: [
      'Comment se protéger des IST ?',
      'Comment gérer le stress ?',
      'Où trouver de l’aide au Bénin ?',
      'Comment contacter un expert ?',
    ],
    urgent: false,
    resources: [
      { label: 'Parle à un expert WeToo, en toute confidentialité.', type: 'advice', url: null },
      { label: 'Ligne verte d’écoute au Bénin : 137 (gratuit, 24h/24).', type: 'helpline', url: null },
    ],
    actions: defaultActions(false),
  };
}

/**
 * Réponse prioritaire en cas de détresse / crise.
 * Ne donne JAMAIS de contenu dangereux : oriente immédiatement vers de l'aide.
 */
function crisisReply() {
  const entry = KNOWLEDGE.find((e) => e.id === 'k-suicide');
  const base = entry
    ? buildReplyFromEntry(entry, 1)
    : {
        id: 'rep-crisis',
        text: 'Ta souffrance compte et tu mérites de l’aide tout de suite.',
        category: 'Prévention & urgence',
        sources: [],
        followUps: [],
        resources: [],
      };
  return {
    ...base,
    id: 'rep-crisis',
    urgent: true,
    confidence: 1,
    category: 'Prévention & urgence',
    resources: [
      { label: 'Ligne verte d’écoute Bénin : 137 (gratuit, 24h/24).', type: 'helpline', url: null },
      { label: 'Urgences : 112.', type: 'helpline', url: null },
      { label: 'Parle immédiatement à un adulte de confiance (parent, enseignant, soignant).', type: 'advice', url: null },
      { label: 'Rends-toi aux urgences du centre de santé le plus proche.', type: 'advice', url: null },
    ],
    followUps: ['Qui peut m’écouter tout de suite ?', 'Comment en parler à un proche ?'],
    actions: [
      { type: 'urgent', label: 'Appeler la ligne d’écoute (137)', to: 'tel:137' },
      { type: 'navigate', label: 'Voir les ressources d’aide', to: '/resources' },
      { type: 'navigate', label: 'Parler à un psychologue', to: '/experts' },
    ],
  };
}

/**
 * Point d'entrée principal : génère la réponse du chatbot à un message.
 * @param {string} message
 * @returns {object} reply
 */
export function answer(message = '') {
  const text = String(message || '').trim();

  // 1. Priorité absolue : détection de crise.
  if (detectCrisis(text)) {
    return crisisReply();
  }

  // 2. Recherche par mots-clés dans la base de connaissances.
  const { entry, score } = matchKnowledge(text);
  if (entry) {
    // Confidence calibrée sur le nombre de correspondances.
    const confidence = Math.min(0.95, 0.55 + score * 0.12);
    return buildReplyFromEntry(entry, confidence);
  }

  // 3. Repli bienveillant.
  return fallbackReply();
}

export default { answer, listTopics, getSuggestions, matchKnowledge, TOPICS };
