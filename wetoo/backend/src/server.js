// Point d'entrée du serveur WeToo.
// Démarre l'application Express exportée par app.js et écoute sur le port configuré.
import { createApp } from './app.js';

const PORT = process.env.PORT || 4000;

// Création de l'application (le store est initialisé à l'import d'app.js).
const app = createApp();

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[WeToo] API démarrée sur http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`[WeToo] Test rapide : http://localhost:${PORT}/api/health`);
});

// Arrêt propre du serveur (Ctrl+C, redémarrage --watch, etc.).
const shutdown = (signal) => {
  // eslint-disable-next-line no-console
  console.log(`[WeToo] Signal ${signal} reçu, arrêt du serveur...`);
  server.close(() => process.exit(0));
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
