import { Link } from 'react-router-dom';
import { ShieldCheck, MessageCircle, LifeBuoy, Globe } from 'lucide-react';
import { Logo } from '../brand/Logo.jsx';
import { getAppNav } from './nav.js';
import { useLang } from '../../context/LangContext.jsx';

export function SiteFooter({ compact = false }) {
  const { t } = useLang();

  return (
    <footer className={`site-footer ${compact ? 'site-footer--compact' : ''}`.trim()}>
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <Logo size={32} />
          <p className="site-footer__tagline">{t('footer.tagline')}</p>
          <p className="site-footer__note">
            <ShieldCheck size={15} aria-hidden="true" /> {t('footer.noteSafe')}
          </p>
          <p className="site-footer__note">
            <Globe size={15} aria-hidden="true" /> {t('footer.noteGlobal')}
          </p>
        </div>

        <nav className="site-footer__nav" aria-label={t('footer.navAria')}>
          <h2 className="site-footer__heading">{t('footer.navHeading')}</h2>
          <ul>
            {getAppNav(t).slice(1).map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__nav">
          <h2 className="site-footer__heading">{t('footer.helpHeading')}</h2>
          <ul>
            <li>
              <Link to="/app/ressources">
                <LifeBuoy size={15} aria-hidden="true" /> {t('footer.helplines')}
              </Link>
            </li>
            <li>
              <Link to="/app/expertes">
                <MessageCircle size={15} aria-hidden="true" /> {t('footer.contactPro')}
              </Link>
            </li>
            <li>
              <Link to="/app/mythes">{t('nav.myths')}</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>{t('footer.disclaimer')}</p>
      </div>
    </footer>
  );
}
