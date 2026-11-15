// Gestion centralisée des erreurs : 404 et error handler global.
// Toutes les réponses d'erreur respectent le format { error: { message, code } }.
import { ApiError } from '../utils/helpers.js';

/** Handler 404 : aucune route ne correspond. */
export function notFound(req, res, next) {
  next(new ApiError(404, `Route introuvable : ${req.method} ${req.originalUrl}`, 'not_found'));
}

/** Error handler global Express (doit avoir 4 arguments). */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err instanceof ApiError ? err.status : err.status || 500;
  const code = err.code || (status === 500 ? 'internal_error' : 'error');
  const message =
    err instanceof ApiError || err.expose
      ? err.message
      : 'Une erreur interne est survenue. Merci de réessayer.';

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error('[WeToo][error]', err);
  }

  res.status(status).json({ error: { message, code } });
}

export default { notFound, errorHandler };
