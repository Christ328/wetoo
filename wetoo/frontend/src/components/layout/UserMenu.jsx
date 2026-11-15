import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, User as UserIcon, Trophy, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLang } from '../../context/LangContext.jsx';
import { Avatar } from '../ui/Avatar.jsx';
import { levelName } from '../../lib/format.js';

export function UserMenu() {
  const { user, logout } = useAuth();
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-menu__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar name={user.name} avatar={user.avatar} size="sm" />
        <span className="user-menu__name">{user.name?.split(' ')[0]}</span>
        <ChevronDown size={16} aria-hidden="true" className="user-menu__chevron" />
      </button>

      {open ? (
        <div className="user-menu__panel" role="menu">
          <div className="user-menu__header">
            <Avatar name={user.name} avatar={user.avatar} size="md" />
            <div>
              <p className="user-menu__title">{user.name}</p>
              <p className="user-menu__meta">
                {levelName(user.level, lang)} · {user.points ?? 0} pts
              </p>
            </div>
          </div>
          <Link to="/app/profil" className="user-menu__item" role="menuitem" onClick={() => setOpen(false)}>
            <UserIcon size={17} aria-hidden="true" />
            {t('profile.tabProfile')}
          </Link>
          <Link to="/app/classement" className="user-menu__item" role="menuitem" onClick={() => setOpen(false)}>
            <Trophy size={17} aria-hidden="true" />
            {t('leaderboard.title')}
          </Link>
          <Link to="/app/profil#reglages" className="user-menu__item" role="menuitem" onClick={() => setOpen(false)}>
            <Settings size={17} aria-hidden="true" />
            {t('profile.tabSettings')}
          </Link>
          <button type="button" className="user-menu__item user-menu__item--danger" role="menuitem" onClick={logout}>
            <LogOut size={17} aria-hidden="true" />
            {t('profile.logoutBtn')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
