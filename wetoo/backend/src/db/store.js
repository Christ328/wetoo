// Store applicatif adossé à la base de données PostgreSQL (Supabase).
// Toutes les lectures et écritures passent par la base : rien n'est conservé
// en mémoire ni sur le disque du serveur, la donnée survit donc aux
// redémarrages (y compris en environnement serverless comme Vercel).
import crypto from 'node:crypto';
import { getSupabase } from './supabase.js';

// Collection applicative (camelCase) → table PostgreSQL (snake_case).
const TABLES = {
  users: 'users',
  categories: 'categories',
  posts: 'posts',
  replies: 'replies',
  reactions: 'reactions',
  reports: 'reports',
  experts: 'experts',
  expertRequests: 'expert_requests',
  lessons: 'lessons',
  quizzes: 'quizzes',
  myths: 'myths',
  badges: 'badges',
  campaigns: 'campaigns',
  campaignJoins: 'campaign_joins',
  testimonials: 'testimonials',
  helplines: 'helplines',
  chatSessions: 'chat_sessions',
  counters: 'counters',
};

const toSnake = (key) => key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const toCamel = (key) => key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

/** Ligne PostgreSQL → document applicatif (camelCase). */
function rowToDoc(row) {
  if (!row) return null;
  const doc = {};
  for (const [key, value] of Object.entries(row)) doc[toCamel(key)] = value;
  return doc;
}

/** Document applicatif → ligne PostgreSQL (snake_case). */
function docToRow(doc) {
  const row = {};
  for (const [key, value] of Object.entries(doc)) row[toSnake(key)] = value;
  return row;
}

/** Nom de table correspondant à une collection applicative. */
function tableOf(collection) {
  const table = TABLES[collection];
  if (!table) throw new Error(`Collection inconnue : « ${collection} ».`);
  return table;
}

/** Transforme une erreur Supabase en exception remontée à la gestion d'erreurs. */
function fail(error) {
  if (error) throw new Error(`[base de données] ${error.message}`);
}

export const store = {
  /** Renvoie le tableau complet d'une collection. */
  async get(collection) {
    const { data, error } = await getSupabase().from(tableOf(collection)).select('*');
    fail(error);
    return (data || []).map(rowToDoc);
  },

  /** Récupère un document par id (null si absent). */
  async getById(collection, docId) {
    if (!docId) return null;
    const { data, error } = await getSupabase()
      .from(tableOf(collection))
      .select('*')
      .eq('id', docId)
      .maybeSingle();
    fail(error);
    return rowToDoc(data);
  },

  /** Recherche les documents correspondant à un prédicat. */
  async find(collection, predicate) {
    const docs = await store.get(collection);
    return typeof predicate === 'function' ? docs.filter(predicate) : docs;
  },

  /** Recherche le premier document correspondant à un prédicat. */
  async findOne(collection, predicate) {
    const docs = await store.get(collection);
    return docs.find(predicate) || null;
  },

  /** Insère un document et renvoie la version enregistrée. */
  async insert(collection, doc = {}) {
    const row = docToRow(doc);
    if (!row.id) row.id = crypto.randomUUID();
    const { data, error } = await getSupabase()
      .from(tableOf(collection))
      .insert(row)
      .select()
      .single();
    fail(error);
    return rowToDoc(data);
  },

  /** Met à jour un document par id (patch partiel). Renvoie le document ou null. */
  async update(collection, docId, patch = {}) {
    if (!docId) return null;
    if (Object.keys(patch).length === 0) return store.getById(collection, docId);
    const { data, error } = await getSupabase()
      .from(tableOf(collection))
      .update(docToRow(patch))
      .eq('id', docId)
      .select()
      .maybeSingle();
    fail(error);
    return rowToDoc(data);
  },
};

export default store;
