// Client PostgreSQL (Supabase) du backend.
// La clé « service_role » contourne la RLS : elle reste exclusivement côté
// serveur et n'est jamais exposée au navigateur.
//
// Le client est créé à la demande (lazy) : le serveur peut démarrer même si
// les variables d'environnement ne sont pas encore renseignées ; l'erreur
// n'apparaît que lorsqu'une requête à la base est tentée.
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/** Indique si la base de données est configurée (variables d'environnement présentes). */
export const supabaseConfigured = Boolean(url && serviceRoleKey);

let client = null;

/**
 * Renvoie le client Supabase (créé une seule fois).
 * Lève une erreur explicite si la base n'est pas configurée.
 */
export function getSupabase() {
  if (!supabaseConfigured) {
    throw new Error(
      'Base de données non configurée : renseigne SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  if (!client) {
    client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export default getSupabase;
