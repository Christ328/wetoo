import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '../brand/Logo.jsx';
import { Button, IconButton } from '../ui/Button.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';
import { LangToggle } from './LangToggle.jsx';
import { UserMenu } from './UserMenu.jsx';
import { getAppNav, getMarketingNav } from './nav.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLang } from '../../context/LangContext.jsx';

/**
 * En-tête du site.
 * `variant="marketing"` : navigation vitrine (ancres + accès plateforme).
 * `variant="app"` : navigation de la plateforme.
 */
export function SiteHeader({ variant = 'app' }) {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useLang();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const drawerRef = useRef(null);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    function onKeyDown(e) {
      if (e.key === 'Escape') setDrawerOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const appNav = getAppNav(t);
  const marketingNav = getMarketingNav(t);
  const navItems = variant === 'marketing' ? marketingNav : appNav;

  return (
    <header className="site-header">
      <div className="site-header__inner container">
        <NavLink
          to={variant === 'marketing' ? '/' : '/app'}
          className="site-header__brand"
          aria-label={t('header.ariaHome')}
        >
          <Logo size={36} />
        </NavLink>

        <nav className="site-header__nav" aria-label={t('nav.ariaMain')}>
          {variant === 'marketing'
            ? marketingNav.map((item) => (
                <a key={item.href} href={item.href} className="site-header__link">
                  {item.label}
                </a>
              ))
            : appNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `site-header__link ${isActive ? 'is-active' : ''}`}
                >
                  {item.short || item.label}
                </NavLink>
              ))}
        </nav>

        <div className="site-header__actions">
          <ThemeToggle />
          <LangToggle />

          {!loading &&
            (isAuthenticated ? (
              <UserMenu />
            ) : variant === 'marketing' ? (
              <>
                <Button to="/connexion" variant="ghost" size="sm" className="hide-sm">
                  {t('header.signIn')}
                </Button>
                <Button to="/app" size="sm" className="hide-xs">
                  {t('header.openApp')}
                </Button>
              </>
            ) : (
              <>
                <Button to="/connexion" variant="outline" size="sm" className="hide-xs">
                  {t('header.signIn')}
                </Button>
                <Button to="/inscription" size="sm" className="hide-xs">
                  {t('header.createAccount')}
                </Button>
              </>
            ))}

          <IconButton
            label={drawerOpen ? t('header.closeMenu') : t('header.openMenu')}
            icon={drawerOpen ? X : Menu}
            className="site-header__burger"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((o) => !o)}
          />
        </div>
      </div>

      {drawerOpen
        ? createPortal(
            <div className="drawer" ref={drawerRef}>
              <div className="drawer__overlay" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
              <nav className="drawer__panel" aria-label={t('nav.ariaMenu')}>
            {/* Sur le site vitrine : les sections de la page puis tout le menu de la plateforme. */}
            {variant === 'marketing' ? (
              <>
                <p className="drawer__section-title">{t('header.menuSections')}</p>
                <ul className="drawer__list">
                  {marketingNav.map((item) => (
                    <li key={item.href}>
                      <a href={item.href} className="drawer__link" onClick={() => setDrawerOpen(false)}>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="drawer__section-title">{t('header.menuPlatform')}</p>
                <ul className="drawer__list">
                  {appNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) => `drawer__link ${isActive ? 'is-active' : ''}`}
                        >
                          {Icon ? <Icon size={18} aria-hidden="true" /> : null}
                          {item.label}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <ul className="drawer__list">
                {appNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) => `drawer__link ${isActive ? 'is-active' : ''}`}
                      >
                        {Icon ? <Icon size={18} aria-hidden="true" /> : null}
                        {item.label}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="drawer__footer">
              {!isAuthenticated ? (
                <>
                  <Button to="/connexion" variant="outline" block>
                    {t('header.signIn')}
                  </Button>
                  <Button to="/inscription" block>
                    {t('header.createAccount')}
                  </Button>
                </>
              ) : (
                <>
                  <Button to="/app/profil" variant="outline" block>
                    {t('header.myProfile')}
                  </Button>
                  <Button to="/app/campagnes" block>
                    {t('header.seeCampaigns')}
                  </Button>
                </>
              )}
            </div>
          </nav>
            </div>,
            document.body
          )
        : null}
    </header>
  );
}
