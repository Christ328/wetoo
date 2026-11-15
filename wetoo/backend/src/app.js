// Configuration de l'application Express WeToo.
import express from 'express';
import cors from 'cors';

import { notFound, errorHandler } from './middleware/error.js';
import { autoTranslate } from './middleware/i18n.js';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import learnRoutes from './routes/learn.js';
import communityRoutes from './routes/community.js';
import expertRoutes from './routes/experts.js';
import campaignRoutes from './routes/campaigns.js';
import gamificationRoutes from './routes/gamification.js';
import statsRoutes from './routes/stats.js';

/**
 * Construit et renvoie l'application Express.
 * Les données vivent dans la base PostgreSQL : aucun état serveur à initialiser.
 */
export function createApp() {
  const app = express();

  // CORS ouvert, avec cookies : la session circule dans un cookie « httpOnly ».
  app.use(cors({ origin: true, credentials: true }));
  // Parsing JSON des corps de requête.
  app.use(express.json({ limit: '1mb' }));

  // Traduction automatique du contenu éditorial quand `lang=en` (rien en base).
  app.use(autoTranslate());

  // Journalisation minimale des requêtes (utile en démo).
  app.use((req, res, next) => {
    const started = Date.now();
    res.on('finish', () => {
      // eslint-disable-next-line no-console
      console.log(`[WeToo] ${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - started}ms)`);
    });
    next();
  });

  // Monte les routes sous le préfixe /api/*.
  app.use('/api/auth', authRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/learn', learnRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/experts', expertRoutes);
  app.use('/api/campaigns', campaignRoutes);
  app.use('/api/gamification', gamificationRoutes);
  app.use('/api', statsRoutes); // /api/stats, /api/resources/helplines, /api/health

  // 404 puis gestion d'erreurs centralisée.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

// Export par défaut pour un import direct éventuel.
export default createApp;
