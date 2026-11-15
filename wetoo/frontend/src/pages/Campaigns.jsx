import { useMemo, useState } from 'react';
import {
  Megaphone,
  Users,
  CalendarDays,
  ArrowRight,
  ExternalLink,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Badge,
  Chip,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../components/ui/index.js';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useRequireAuth } from '../lib/useRequireAuth.js';
import { useLang } from '../context/LangContext.jsx';
import './Campaigns.css';

/** Page des campagnes mensuelles de sensibilisation. */
export default function Campaigns() {
  const toast = useToast();
  const requireAuth = useRequireAuth();
  const { t } = useLang();

  const statusTabs = [
    { id: 'active', label: t('campaigns.tabActive') },
    { id: 'upcoming', label: t('campaigns.tabUpcoming') },
    { id: 'past', label: t('campaigns.tabPast') },
  ];

  const statusLabels = {
    active: { label: t('campaigns.statusActive'), tone: 'success' },
    upcoming: { label: t('campaigns.statusUpcoming'), tone: 'info' },
    past: { label: t('campaigns.statusPast'), tone: 'neutral' },
  };

  const campaignsApi = useApi('/campaigns', { auth: false });
  const whatsappApi = useApi('/community/whatsapp', { auth: false, cache: true });

  const [status, setStatus] = useState('active');

  const campaigns = Array.isArray(campaignsApi.data) ? campaignsApi.data : [];
  const whatsapp = whatsappApi.data;

  const featured = useMemo(
    () => campaigns.find((campaign) => campaign.status === 'active') || null,
    [campaigns]
  );

  const filtered = useMemo(
    () => campaigns.filter((campaign) => campaign.status === status),
    [campaigns, status]
  );

  // ------------------------------ Actions ------------------------------
  function handleJoin(campaign) {
    requireAuth(async () => {
      try {
        const result = await api.post(`/campaigns/${campaign.id}/join`, {});
        toast.success(
          result?.joined
            ? t('campaigns.toastJoined')(campaign.title)
            : t('campaigns.toastAlready')
        );
        // Met à jour le compteur de participants sans recharger toute la liste.
        campaignsApi.setData((list) =>
          Array.isArray(list)
            ? list.map((item) =>
                item.id === campaign.id
                  ? { ...item, participants: result?.participants ?? item.participants }
                  : item
              )
            : list
        );
      } catch (err) {
        toast.error(t('campaigns.joinError')(err?.message));
      }
    });
  }

  // ------------------------------ Rendu ------------------------------
  return (
    <div className="campaigns-page">
      <PageHeader
        eyebrow={t('campaigns.eyebrow')}
        title={t('campaigns.title')}
        description={t('campaigns.desc')}
        icon={Megaphone}
      />

      {campaignsApi.loading ? (
        <LoadingState label={t('campaigns.loading')} />
      ) : campaignsApi.error ? (
        <ErrorState error={campaignsApi.error} onRetry={campaignsApi.refetch} />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={t('campaigns.noTitle')}
          description={t('campaigns.noDesc')}
        />
      ) : (
        <>
          {/* ---------------------- Campagne du moment ---------------------- */}
          {featured ? (
            <section className="campaigns-page__featured" aria-label={t('campaigns.featuredAria')}>
              <div className="campaigns-page__featured-emoji" aria-hidden="true">
                {featured.emoji}
              </div>
              <div className="campaigns-page__featured-body">
                <Badge tone="warning" size="md" className="campaigns-page__featured-badge">
                  {t('campaigns.featuredLabel')}
                </Badge>
                <p className="campaigns-page__featured-theme">{featured.theme}</p>
                <h2 className="campaigns-page__featured-title">{featured.title}</h2>
                {featured.hashtags?.length ? (
                  <p className="campaigns-page__featured-hashtags">
                    {featured.hashtags.join(' ')}
                  </p>
                ) : null}
                <ul className="campaigns-page__featured-meta">
                  <li>
                    <CalendarDays size={16} aria-hidden="true" /> {featured.dateLabel}
                  </li>
                  <li>
                    <Users size={16} aria-hidden="true" /> {t('campaigns.participants')(featured.participants)}
                  </li>
                </ul>
                <div className="campaigns-page__featured-actions">
                  <Button variant="soft" onClick={() => handleJoin(featured)}>
                    {t('campaigns.joinBtn')}
                  </Button>
                  <Button variant="outline" to={`/app/campagnes/${featured.id}`} iconRight={ArrowRight}>
                    {t('campaigns.learnMore')}
                  </Button>
                </div>
              </div>
            </section>
          ) : null}

          {/* ------------------------- Onglets de statut ------------------------- */}
          <Tabs
            items={statusTabs}
            value={status}
            onChange={setStatus}
            ariaLabel={t('campaigns.tabAria')}
            variant="underline"
            className="campaigns-page__tabs"
          />

          {filtered.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title={t('campaigns.noTabTitle')}
              description={t('campaigns.noTabDesc')}
            />
          ) : (
            <div className="grid grid-3 campaigns-page__grid stagger">
              {filtered.map((campaign) => {
                const statusInfo = statusLabels[campaign.status] || statusLabels.past;
                return (
                  <Card key={campaign.id} className="campaigns-page__card">
                    <div className="campaigns-page__card-head">
                      <span className="campaigns-page__card-emoji" aria-hidden="true">
                        {campaign.emoji}
                      </span>
                      <div className="campaigns-page__card-id">
                        <span className="campaigns-page__month">{campaign.month}</span>
                        <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
                      </div>
                    </div>

                    <h3 className="campaigns-page__card-title">{campaign.title}</h3>
                    <p className="campaigns-page__card-desc clamp-3">{campaign.description}</p>

                    {campaign.hashtags?.length ? (
                      <div className="tag-row campaigns-page__hashtags">
                        {campaign.hashtags.map((hashtag) => (
                          <Chip key={hashtag}>{hashtag}</Chip>
                        ))}
                      </div>
                    ) : null}

                    {campaign.resources?.length ? (
                      <ul className="campaigns-page__resources">
                        {campaign.resources.map((resource) => (
                          <li key={resource.label}>
                            <FileText size={14} aria-hidden="true" />
                            {resource.label}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className="meta-row campaigns-page__card-meta">
                      <span className="meta-item">
                        <CalendarDays size={14} aria-hidden="true" /> {campaign.dateLabel}
                      </span>
                      <span className="meta-item">
                        <Users size={14} aria-hidden="true" /> {t('campaigns.participants')(campaign.participants)}
                      </span>
                    </div>

                    <div className="campaigns-page__card-actions">
                      <Button variant="soft" size="sm" onClick={() => handleJoin(campaign)}>
                        {t('campaigns.joinShort')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        to={`/app/campagnes/${campaign.id}`}
                        iconRight={ArrowRight}
                      >
                        {t('campaigns.learnMore')}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ------------------------- Communauté WhatsApp ------------------------- */}
      <Card tone="soft" className="campaigns-page__whatsapp">
        <CardHeader
          title={t('campaigns.whatsappTitle')}
          subtitle={t('campaigns.whatsappSub')}
          icon={Users}
        />
        <CardBody>
          {whatsappApi.loading ? (
            <LoadingState label={t('campaigns.whatsappLoading')} />
          ) : whatsappApi.error ? (
            <ErrorState error={whatsappApi.error} onRetry={whatsappApi.refetch} />
          ) : whatsapp ? (
            <>
              <ul className="campaigns-page__whatsapp-list">
                {(whatsapp.groups || []).map((group) => (
                  <li key={group.id}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>{t('campaigns.whatsappMembers')(group.members, group.name)}</span>
                  </li>
                ))}
              </ul>
              <Button href={whatsapp.link} variant="accent" icon={ExternalLink}>
                {t('campaigns.whatsappJoin')}
              </Button>
            </>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
