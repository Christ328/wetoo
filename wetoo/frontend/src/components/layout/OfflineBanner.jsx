import { WifiOff } from 'lucide-react';
import { useOnline } from '../../lib/useOnline.js';
import { useLang } from '../../context/LangContext.jsx';

/**
 * Bandeau d'information hors ligne.
 * La plateforme nécessite une connexion : on signale simplement l'absence de réseau.
 * (Le mode hors ligne complet reste une perspective de développement.)
 */
export function OfflineBanner() {
  const { t } = useLang();
  const online = useOnline();
  if (online) return null;

  return (
    <div className="offline-banner" role="status">
      <WifiOff size={16} aria-hidden="true" />
      <span>{t('common.offlineBanner')}</span>
    </div>
  );
}
