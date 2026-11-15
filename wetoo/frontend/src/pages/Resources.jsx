import {
  LifeBuoy,
  Phone,
  AlertTriangle,
  ShieldCheck,
  HeartHandshake,
  Users,
  MessageCircle,
  Clock,
  Globe,
  ExternalLink,
  Info,
  Siren,
  UserRoundCheck,
  MessagesSquare,
  Sparkles,
} from 'lucide-react';

import { PageHeader } from '../components/layout/PageHeader.jsx';
import {
  Button,
  Card,
  Badge,
  SectionHeading,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../components/ui/index.js';
import { useApi } from '../lib/useApi.js';
import { useLang } from '../context/LangContext.jsx';
import './Resources.css';

/** Extrait un numéro appelable depuis un libellé de contact (« 137 (appel gratuit) »). */
function phoneFromContact(contact = '') {
  const match = String(contact).match(/(\+?\d[\d\s().-]{1,})/);
  if (!match) return null;
  const clean = match[1].replace(/[^\d+]/g, '');
  return clean.length >= 3 ? clean : null;
}

/** Contenu éducatif de secours si l'API ne renvoie aucune ligne d'aide. */
const FALLBACK_HELPLINES = [
  {
    country: 'Bénin',
    name: 'Ligne verte d’écoute et d’orientation',
    contact: '137 (appel gratuit)',
    hours: '24h/24, 7j/7',
    description: 'Écoute, information et orientation pour les jeunes en détresse ou en questionnement.',
    url: null,
  },
  {
    country: 'Bénin',
    name: 'Urgences santé (SAMU)',
    contact: '112',
    hours: '24h/24, 7j/7',
    description: 'Numéro d’urgence pour toute situation médicale grave ou danger immédiat.',
    url: null,
  },
  {
    country: 'Internationale',
    name: 'Centre de ressources ONUSIDA',
    contact: 'En ligne',
    hours: 'Consultation permanente',
    description: 'Informations internationales fiables sur le VIH, la prévention et les droits.',
    url: 'https://www.unaids.org/fr',
  },
];

/** « Ressources & aide » : numéros d'écoute et repères éducatifs. */
export default function Resources() {
  const { t } = useLang();
  const { data, loading, error, refetch } = useApi('/resources/helplines', {
    auth: false,
    cache: true,
  });

  const apiHelplines = Array.isArray(data) ? data : [];
  const helplines = apiHelplines.length > 0 ? apiHelplines : FALLBACK_HELPLINES;
  const callable = helplines.filter((h) => phoneFromContact(h.contact));

  return (
    <div className="resources-page">
      <PageHeader
        eyebrow={t('resources.eyebrow')}
        title={t('resources.title')}
        description={t('resources.desc')}
        icon={LifeBuoy}
      />

      {/* --------------------------- Bloc d'urgence immédiat --------------------------- */}
      {loading ? (
        <LoadingState label={t('resources.loading')} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <section className="resources-page__emergency" aria-labelledby="resources-emergency-title">
          <div className="resources-page__emergency-head">
            <span className="resources-page__emergency-icon" aria-hidden="true">
              <Siren size={24} />
            </span>
            <div>
              <h2 id="resources-emergency-title" className="resources-page__emergency-title">
                {t('resources.emergencyTitle')}
              </h2>
              <p className="resources-page__emergency-text">{t('resources.emergencySubtitle')}</p>
            </div>
          </div>

          {callable.length > 0 ? (
            <div className="resources-page__emergency-calls">
              {callable.map((h) => {
                const phone = phoneFromContact(h.contact);
                return (
                  <a
                    key={`${h.name}-${phone}`}
                    className="resources-page__call"
                    href={`tel:${phone}`}
                    aria-label={t('resources.callLabel')(phone)}
                  >
                    <span className="resources-page__call-icon" aria-hidden="true">
                      <Phone size={22} />
                    </span>
                    <span className="resources-page__call-body">
                      <span className="resources-page__call-number">{phone}</span>
                      <span className="resources-page__call-name">{h.name}</span>
                      {h.hours ? (
                        <span className="resources-page__call-hours">{h.hours}</span>
                      ) : null}
                    </span>
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="resources-page__emergency-text">{t('resources.emergencyFallback')}</p>
          )}

          <p className="resources-page__emergency-note">
            <AlertTriangle size={16} aria-hidden="true" />
            {t('resources.emergencyNote')}
          </p>
        </section>
      )}

      {/* ------------------------------ Lignes d'aide ------------------------------ */}
      <section className="resources-page__section" aria-labelledby="resources-lines-title">
        <SectionHeading
          eyebrow={t('resources.linesEyebrow')}
          title={t('resources.linesTitle')}
          description={t('resources.linesDesc')}
        />
        {loading ? null : error ? null : helplines.length === 0 ? (
          <EmptyState
            icon={LifeBuoy}
            title={t('resources.emptyTitle')}
            description={t('resources.emptyDesc')}
            action={<Button variant="outline" onClick={refetch}>{t('common.retry')}</Button>}
          />
        ) : (
          <ul className="resources-page__grid">
            {helplines.map((h, i) => (
              <HelplineCard key={`${h.name}-${i}`} line={h} />
            ))}
          </ul>
        )}
      </section>

      {/* --------------------- Repères éducatifs (contenu en dur) --------------------- */}
      <section className="resources-page__section" aria-label={t('resources.guidesEyebrow')}>
        <SectionHeading
          eyebrow={t('resources.guidesEyebrow')}
          title={t('resources.guidesTitle')}
          description={t('resources.guidesDesc')}
        />

        <div className="resources-page__guides">
          {/* 1. Détresse et pensées suicidaires */}
          <Card as="article" tone="default" padding="md" className="resources-page__guide">
            <div className="resources-page__guide-head">
              <span className="resources-page__guide-icon resources-page__guide-icon--danger" aria-hidden="true">
                <HeartHandshake size={20} />
              </span>
              <h3 className="resources-page__guide-title">{t('resources.guide1Title')}</h3>
            </div>
            <ol className="resources-page__steps">
              <li>{t('resources.guide1Step1')}</li>
              <li>{t('resources.guide1Step2')}</li>
              <li>{t('resources.guide1Step3')}</li>
              <li>{t('resources.guide1Step4')}</li>
            </ol>
            <p className="resources-page__guide-emphasis">{t('resources.guide1Emphasis')}</p>
          </Card>

          {/* 2. Soutenir un proche */}
          <Card as="article" tone="default" padding="md" className="resources-page__guide">
            <div className="resources-page__guide-head">
              <span className="resources-page__guide-icon" aria-hidden="true">
                <Users size={20} />
              </span>
              <h3 className="resources-page__guide-title">{t('resources.guide2Title')}</h3>
            </div>
            <ul className="resources-page__bullets">
              <li>{t('resources.guide2Bullet1')}</li>
              <li>{t('resources.guide2Bullet2')}</li>
              <li>{t('resources.guide2Bullet3')}</li>
              <li>{t('resources.guide2Bullet4')}</li>
            </ul>
          </Card>

          {/* 3. Santé sexuelle */}
          <Card as="article" tone="default" padding="md" className="resources-page__guide">
            <div className="resources-page__guide-head">
              <span className="resources-page__guide-icon" aria-hidden="true">
                <MessageCircle size={20} />
              </span>
              <h3 className="resources-page__guide-title">{t('resources.guide3Title')}</h3>
            </div>
            <p className="resources-page__guide-text">{t('resources.guide3Text')}</p>
            <div className="resources-page__guide-actions">
              <Button to="/app/chat" variant="accent" size="sm" icon={Sparkles}>
                {t('resources.openChatbot')}
              </Button>
              <Button to="/app/communaute" variant="outline" size="sm" icon={MessagesSquare}>
                {t('resources.goToCommunity')}
              </Button>
            </div>
          </Card>

          {/* 4. Violence ou abus */}
          <Card as="article" tone="default" padding="md" className="resources-page__guide">
            <div className="resources-page__guide-head">
              <span className="resources-page__guide-icon resources-page__guide-icon--danger" aria-hidden="true">
                <ShieldCheck size={20} />
              </span>
              <h3 className="resources-page__guide-title">{t('resources.guide4Title')}</h3>
            </div>
            <ul className="resources-page__bullets">
              <li>{t('resources.guide4Bullet1')}</li>
              <li>{t('resources.guide4Bullet2')}</li>
              <li>{t('resources.guide4Bullet3')}</li>
            </ul>
            <div className="resources-page__guide-actions">
              <Button to="/app/expertes" variant="soft" size="sm" icon={UserRoundCheck}>
                {t('resources.talkToExpert')}
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* ------------------------------ Accès rapides ------------------------------ */}
      <section className="resources-page__section">
        <Card tone="soft" padding="md" className="resources-page__cta">
          <div className="resources-page__cta-text">
            <h2 className="resources-page__cta-title">{t('resources.ctaTitle')}</h2>
            <p className="text-muted">{t('resources.ctaDesc')}</p>
          </div>
          <div className="resources-page__cta-actions">
            <Button to="/app/chat" variant="primary" icon={MessageCircle}>
              {t('resources.askChatbot')}
            </Button>
            <Button to="/app/expertes" variant="outline" icon={UserRoundCheck}>
              {t('resources.talkToExpert')}
            </Button>
            <Button to="/app/communaute" variant="outline" icon={MessagesSquare}>
              {t('resources.joinCommunity')}
            </Button>
          </div>
        </Card>
      </section>

      <p className="resources-page__disclaimer">
        <Info size={15} aria-hidden="true" />
        {t('resources.disclaimer')}
      </p>
    </div>
  );
}

/* ============================ Carte d'une ligne d'aide ============================ */
function HelplineCard({ line }) {
  const { t } = useLang();
  const phone = phoneFromContact(line.contact);

  return (
    <Card as="li" padding="md" className="resources-line">
      <div className="resources-line__top">
        <h3 className="resources-line__name">{line.name}</h3>
        {line.country ? (
          <Badge tone="neutral" size="sm" icon={Globe}>
            {line.country}
          </Badge>
        ) : null}
      </div>

      <p className="resources-line__contact">{line.contact}</p>

      {line.hours ? (
        <p className="resources-line__meta">
          <Clock size={15} aria-hidden="true" />
          {line.hours}
        </p>
      ) : null}

      {line.description ? <p className="resources-line__description">{line.description}</p> : null}

      <div className="resources-line__actions">
        {phone ? (
          <Button href={`tel:${phone}`} variant="danger" size="sm" icon={Phone} block>
            {t('resources.callLabel')(phone)}
          </Button>
        ) : null}
        {line.url ? (
          <Button href={line.url} variant="outline" size="sm" icon={ExternalLink} block>
            {t('resources.openSite')}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
