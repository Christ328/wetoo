import { Link } from 'react-router-dom';
import { ShieldCheck, MessageCircle, LifeBuoy, Globe } from 'lucide-react';
import { Logo } from '../brand/Logo.jsx';
import { APP_NAV } from './nav.js';

export function SiteFooter({ compact = false }) {
  return (
    <footer className={`site-footer ${compact ? 'site-footer--compact' : ''}`.trim()}>
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <Logo size={32} />
          <p className="site-footer__tagline">
            Parler sans tabou, apprendre sans jugement. Une plateforme pensée par et pour les jeunes.
          </p>
          <p className="site-footer__note">
            <ShieldCheck size={15} aria-hidden="true" /> Espace sécurisé · Modéré par une équipe formée
          </p>
          <p className="site-footer__note">
            <Globe size={15} aria-hidden="true" /> Disponible au Bénin et partout dans le monde
          </p>
        </div>

        <nav className="site-footer__nav" aria-label="Plan de la plateforme">
          <h2 className="site-footer__heading">La plateforme</h2>
          <ul>
            {APP_NAV.slice(1).map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__nav">
          <h2 className="site-footer__heading">Besoin d'aide maintenant ?</h2>
          <ul>
            <li>
              <Link to="/app/ressources">
                <LifeBuoy size={15} aria-hidden="true" /> Numéros d'écoute
              </Link>
            </li>
            <li>
              <Link to="/app/expertes">
                <MessageCircle size={15} aria-hidden="true" /> Contacter un professionnel
              </Link>
            </li>
            <li>
              <Link to="/app/mythes">Mythes & vraies infos</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>
          Projet <strong>WeToo</strong> - candidature au Défi mondial d'innovation YTH Live 2026, présenté par
          ETR.
        </p>
        <p>Contenu éducatif. En cas d'urgence médicale, contacte un professionnel de santé.</p>
      </div>
    </footer>
  );
}
