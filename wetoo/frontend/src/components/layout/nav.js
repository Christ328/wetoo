import {
  Home,
  MessageCircle,
  GraduationCap,
  Users,
  Megaphone,
  Stethoscope,
  Sparkles,
  LifeBuoy,
  User,
} from 'lucide-react';

/** Navigation principale de la plateforme. */
export function getAppNav(t) {
  return [
    { to: '/app',            label: t('nav.home'),        short: t('nav.home'),         icon: Home,         end: true },
    { to: '/app/chat',       label: t('nav.askQuestion'), short: t('nav.chat'),          icon: MessageCircle },
    { to: '/app/apprendre',  label: t('nav.learn'),       short: t('nav.learn'),         icon: GraduationCap },
    { to: '/app/communaute', label: t('nav.community'),   short: t('nav.community'),     icon: Users },
    { to: '/app/campagnes',  label: t('nav.campaigns'),   short: t('nav.campaigns'),     icon: Megaphone },
    { to: '/app/expertes',   label: t('nav.experts'),     short: t('nav.expertsShort'),  icon: Stethoscope },
    { to: '/app/mythes',     label: t('nav.myths'),       short: t('nav.mythsShort'),    icon: Sparkles },
    { to: '/app/ressources', label: t('nav.help'),        short: t('nav.helpShort'),     icon: LifeBuoy },
  ];
}

/** Barre de navigation basse (mobile) - 5 entrées maximum. */
export function getBottomNav(t) {
  return [
    { to: '/app',            label: t('nav.home'),      icon: Home,         end: true },
    { to: '/app/apprendre',  label: t('nav.learn'),     icon: GraduationCap },
    { to: '/app/chat',       label: t('nav.chat'),      icon: MessageCircle },
    { to: '/app/communaute', label: t('nav.forum'),     icon: Users },
    { to: '/app/profil',     label: t('nav.profile'),   icon: User,         end: true },
  ];
}

/** Liens du site vitrine. */
export function getMarketingNav(t) {
  return [
    { href: '#probleme', label: t('nav.marketing.problem') },
    { href: '#solution', label: t('nav.marketing.solution') },
    { href: '#piliers',  label: t('nav.marketing.pillars') },
    { href: '#impact',   label: t('nav.marketing.impact') },
  ];
}

/* Backwards-compatible static exports (used only as fallbacks where t() is unavailable) */
export const APP_NAV = [
  { to: '/app',            label: 'Accueil',                     short: 'Accueil',  icon: Home,         end: true },
  { to: '/app/chat',       label: 'Poser une question',          short: 'Chat',     icon: MessageCircle },
  { to: '/app/apprendre',  label: 'Apprendre',                   short: 'Apprendre',icon: GraduationCap },
  { to: '/app/communaute', label: 'Communauté',                  short: 'Communauté',icon: Users },
  { to: '/app/campagnes',  label: 'Campagnes',                   short: 'Campagnes',icon: Megaphone },
  { to: '/app/expertes',   label: 'Professionnel·les de santé',  short: 'Experts',  icon: Stethoscope },
  { to: '/app/mythes',     label: 'Mythes & vraies infos',       short: 'Mythes',   icon: Sparkles },
  { to: '/app/ressources', label: "Besoin d'aide",               short: 'Aide',     icon: LifeBuoy },
];

export const BOTTOM_NAV = [
  { to: '/app',            label: 'Accueil',    icon: Home,         end: true },
  { to: '/app/apprendre',  label: 'Apprendre',  icon: GraduationCap },
  { to: '/app/chat',       label: 'Chat',       icon: MessageCircle },
  { to: '/app/communaute', label: 'Forum',      icon: Users },
  { to: '/app/profil',     label: 'Profil',     icon: User,         end: true },
];

export const MARKETING_NAV = [
  { href: '#probleme', label: 'Le problème' },
  { href: '#solution', label: 'La solution' },
  { href: '#piliers',  label: 'Les 4 piliers' },
  { href: '#impact',   label: 'Impact' },
];
