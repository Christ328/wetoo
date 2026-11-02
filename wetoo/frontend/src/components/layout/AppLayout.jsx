import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SiteHeader } from './SiteHeader.jsx';
import { SiteFooter } from './SiteFooter.jsx';
import { BottomNav } from './BottomNav.jsx';
import { OfflineBanner } from './OfflineBanner.jsx';
import { useLang } from '../../context/LangContext.jsx';

/** Remet la page en haut à chaque changement de route. */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

/** Coquille de la plateforme (application connectée ou non). */
export function AppLayout() {
  const { t } = useLang();
  return (
    <div className="app-shell">
      <div className="mesh-bg" aria-hidden="true" />
      <a className="skip-link" href="#main">
        {t('layout.skipToContent')}
      </a>
      <OfflineBanner />
      <SiteHeader variant="app" />
      <main id="main" className="app-main">
        <div className="app-body">
          <Outlet />
        </div>
      </main>
      <SiteFooter compact />
      <BottomNav />
    </div>
  );
}

/** Coquille des pages vitrine (accueil, connexion, inscription). */
export function PublicLayout() {
  const { t } = useLang();
  return (
    <div className="app-shell">
      <div className="mesh-bg" aria-hidden="true" />
      <a className="skip-link" href="#main">
        {t('layout.skipToContent')}
      </a>
      <OfflineBanner />
      <SiteHeader variant="marketing" />
      <main id="main" className="marketing-main">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
