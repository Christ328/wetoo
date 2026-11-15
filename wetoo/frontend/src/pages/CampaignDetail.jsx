import { Link, useParams } from 'react-router-dom';
import {
  ChevronRight,
  Lightbulb,
  CalendarDays,
  Users,
  ArrowRight,
  Copy,
  Share2,
  MessagesSquare,
  FileText,
  ExternalLink,
} from 'lucide-react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  LoadingState,
  ErrorState,
} from '../components/ui/index.js';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useRequireAuth } from '../lib/useRequireAuth.js';
import { useLang } from '../context/LangContext.jsx';
import './CampaignDetail.css';

/** Page de détail d'une campagne : programme, ressources et partage. */
export default function CampaignDetail() {
  const { id } = useParams();
  const toast = useToast();
  const requireAuth = useRequireAuth();
  const { t } = useLang();

  const campaignApi = useApi(`/campaigns/${id}`, { auth: false });
  const campaign = campaignApi.data;

  // ------------------------------ Rejoindre ------------------------------
  function handleJoin() {
    requireAuth(async () => {
      try {
        const result = await api.post(`/campaigns/${campaign.id}/join`, {});
        toast.success(
          result?.joined
            ? t('campaigns.toastJoined')(campaign.title)
            : t('campaigns.toastAlready')
        );
        campaignApi.setData((prev) =>
          prev && prev.id === campaign.id
            ? { ...prev, participants: result?.participants ?? prev.participants }
            : prev
        );
      } catch (err) {
        toast.error(t('campaigns.joinError')(err?.message));
      }
    });
  }

  // ------------------------------- Partage -------------------------------
  async function copyLink() {
    const url = `${window.location.origin}/app/campagnes/${id}`;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('unsupported');
      await navigator.clipboard.writeText(url);
      toast.success(t('campaignDetail.toastCopied'));
    } catch {
      toast.error(t('campaignDetail.toastCopyError'));
    }
  }

  // ------------------------------- Rendu -------------------------------
  if (campaignApi.loading) {
    return (
      <div className="campaign-detail">
        <LoadingState label={t('campaignDetail.loading')} />
      </div>
    );
  }

  if (campaignApi.error) {
    return (
      <div className="campaign-detail">
        <ErrorState error={campaignApi.error} onRetry={campaignApi.refetch} />
      </div>
    );
  }

  if (!campaign) return null;

  const schedule = Array.isArray(campaign.schedule) ? campaign.schedule : [];
  const facts = Array.isArray(campaign.facts) ? campaign.facts : [];
  const resources = Array.isArray(campaign.resources) ? campaign.resources : [];

  const shareText = t('campaignDetail.shareText')(campaign.title);
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${shareText} ${window.location.origin}/app/campagnes/${campaign.id}`
  )}`;

  return (
    <div className="campaign-detail">
      <nav className="campaign-detail__breadcrumb" aria-label={t('common.breadcrumbAria')}>
        <Link to="/app/campagnes">{t('campaigns.title')}</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page" className="clamp-1">
          {campaign.title}
        </span>
      </nav>

      {/* --------------------------- Bandeau d'en-tête --------------------------- */}
      <header className="campaign-detail__hero">
        <div className="campaign-detail__hero-emoji" aria-hidden="true">
          {campaign.emoji}
        </div>
        <div className="campaign-detail__hero-body">
          <p className="campaign-detail__hero-theme">{campaign.theme}</p>
          <h1 className="campaign-detail__hero-title">{campaign.title}</h1>
          {campaign.hashtags?.length ? (
            <p className="campaign-detail__hero-hashtags">{campaign.hashtags.join(' ')}</p>
          ) : null}
          <ul className="campaign-detail__hero-meta">
            <li>
              <CalendarDays size={16} aria-hidden="true" /> {campaign.dateLabel}
            </li>
            <li>
              <Users size={16} aria-hidden="true" /> {t('campaigns.participants')(campaign.participants)}
            </li>
          </ul>
          <div className="campaign-detail__hero-actions">
            <Button variant="soft" onClick={handleJoin}>
              {t('campaigns.joinBtn')}
            </Button>
          </div>
        </div>
      </header>

      {/* ------------------------------ Description ------------------------------ */}
      <Card padding="lg">
        <h2 className="campaign-detail__section-title">{t('campaignDetail.aboutTitle')}</h2>
        <p className="campaign-detail__description">{campaign.description}</p>
      </Card>

      {/* -------------------------------- Le savais-tu ? -------------------------------- */}
      {facts.length > 0 ? (
        <Card tone="warm">
          <CardHeader title={t('campaignDetail.factsTitle')} icon={Lightbulb} />
          <CardBody>
            <ul className="campaign-detail__facts">
              {facts.map((fact) => (
                <li key={fact}>
                  <Lightbulb size={16} aria-hidden="true" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : null}

      {/* --------------------------------- Planning --------------------------------- */}
      {schedule.length > 0 ? (
        <section className="campaign-detail__schedule" aria-labelledby="schedule-title">
          <h2 id="schedule-title" className="campaign-detail__section-title">
            {t('campaignDetail.scheduleTitle')}
          </h2>
          <ol className="campaign-detail__timeline">
            {schedule.map((step, index) => (
              <li key={`${step.day}-${step.label}`} className="campaign-detail__timeline-item">
                <span className="campaign-detail__timeline-marker" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="campaign-detail__timeline-content">
                  <span className="campaign-detail__timeline-day">{step.day}</span>
                  <h3 className="campaign-detail__timeline-label">{step.label}</h3>
                  {step.activity ? (
                    <p className="campaign-detail__timeline-activity">{step.activity}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* -------------------------------- Ressources -------------------------------- */}
      {resources.length > 0 ? (
        <Card>
          <CardHeader title={t('campaignDetail.resourcesTitle')} icon={FileText} />
          <CardBody>
            <div className="tag-row campaign-detail__resources">
              {resources.map((resource) => (
                <Chip key={resource.label} icon={FileText}>
                  {resource.label}
                </Chip>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}

      {/* ---------------------------------- Partage ---------------------------------- */}
      <Card tone="soft">
        <CardHeader title={t('campaignDetail.shareTitle')} icon={Share2} />
        <CardBody>
          <p className="campaign-detail__share-text">
            {t('campaignDetail.shareDesc')}
          </p>
          <div className="campaign-detail__share-actions">
            <Button variant="outline" icon={Copy} onClick={copyLink}>
              {t('campaignDetail.copyLink')}
            </Button>
            <Button href={shareUrl} variant="accent" icon={ExternalLink}>
              {t('campaignDetail.shareWhatsapp')}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* ------------------------------ Appels à l'action ------------------------------ */}
      <div className="campaign-detail__cta grid grid-2">
        <Card tone="accent">
          <div className="campaign-detail__cta-inner">
            <MessagesSquare size={28} aria-hidden="true" />
            <h2 className="campaign-detail__cta-title">{t('campaignDetail.cta1Title')}</h2>
            <p className="campaign-detail__cta-text">
              {t('campaignDetail.cta1Desc')}
            </p>
            <Button variant="soft" to="/app/chat" iconRight={ArrowRight}>
              {t('campaignDetail.openChat')}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="campaign-detail__cta-inner">
            <Users size={28} aria-hidden="true" />
            <h2 className="campaign-detail__cta-title">{t('campaignDetail.cta2Title')}</h2>
            <p className="campaign-detail__cta-text">
              {t('campaignDetail.cta2Desc')}
            </p>
            <Button variant="soft" to="/app/communaute" iconRight={ArrowRight}>
              {t('campaignDetail.goToForum')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
