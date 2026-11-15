// Enveloppe un handler Express asynchrone : toute promesse rejetée est
// transmise à la gestion d'erreurs centralisée (Express 4 ne le fait pas seul
// pour les handlers async).
export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export default asyncHandler;
