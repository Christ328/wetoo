import { NavLink } from 'react-router-dom';
import { getBottomNav } from './nav.js';
import { useLang } from '../../context/LangContext.jsx';

/** Barre de navigation basse (mobile uniquement, via CSS). */
export function BottomNav() {
  const { t } = useLang();
  const items = getBottomNav(t);

  return (
    <nav className="bottom-nav" aria-label={t('nav.ariaMobile')}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
          >
            <Icon size={21} aria-hidden="true" />
            <span className="bottom-nav__label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
