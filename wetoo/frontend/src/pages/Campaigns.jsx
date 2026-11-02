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
import './Campaigns.css';

const STATUS_TABS = [
  { id: 'active', label: 'En cours' },
  { id: 'upcoming', label: 'À venir' },
  { id: 'past', label: 'Passées' },
];

const STATUS_LABELS = {
  active: { label: 'En cours', tone: 'success' },
  upcoming: { label: 'À venir', tone: 'info' },
  past: { label: 'Passée', tone: 'neutral' },
};

/** Page des campagnes mensuelles de sensibilisation. */
export default function Campaigns() {
  const toast = useToast();
  const requireAuth = useRequireAuth();

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
            ? `Merci ! Tu participes maintenant à « ${campaign.title} ».`
            : 'Tu participes déjà à cette campagne.'
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
        toast.error(err?.message || 'Impossible de rejoindre la campagne pour le moment.');
      }
    });
  }

  // ------------------------------ Rendu ------------------------------
  return (
    <div className="campaigns-page">
      <PageHeader
        eyebrow="Mobilisation mensuelle"
        title="Campagnes"
        description="Chaque mois, un thème, une mobilisation - en ligne et dans la vraie vie."
        icon={Megaphone}
      />

      {campaignsApi.loading ? (
        <LoadingState label="Chargement des campagnes…" />
      ) : campaignsApi.error ? (
        <ErrorState error={campaignsApi.error} onRetry={campaignsApi.refetch} />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Aucune campagne pour le moment"
          description="De nouvelles mobilisations arriveront très bientôt. Reviens vite !"
        />
      ) : (
        <>
          {/* ---------------------- Campagne du moment ---------------------- */}
          {featured ? (
            <section className="campaigns-page__featured" aria-label="Campagne du moment">
              <div className="campaigns-page__featured-emoji" aria-hidden="true">
                {featured.emoji}
              </div>
              <div className="campaigns-page__featured-body">
                <Badge tone="warning" size="md" className="campaigns-page__featured-badge">
                  Campagne du moment
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
                    <Users size={16} aria-hidden="true" /> {featured.participants} participants
                  </li>
                </ul>
                <div className="campaigns-page__featured-actions">
                  <Button variant="soft" onClick={() => handleJoin(featured)}>
                    Rejoindre la campagne
                  </Button>
                  <Button variant="outline" to={`/app/campagnes/${featured.id}`} iconRight={ArrowRight}>
                    En savoir plus
                  </Button>
                </div>
              </div>
            </section>
          ) : null}

          {/* ------------------------- Onglets de statut ------------------------- */}
          <Tabs
            items={STATUS_TABS}
            value={status}
            onChange={setStatus}
            ariaLabel="Filtrer les campagnes par statut"
            variant="underline"
            className="campaigns-page__tabs"
          />

          {filtered.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="Aucune campagne dans cette section"
              description="Change d’onglet pour découvrir d’autres mobilisations."
            />
          ) : (
            <div className="grid grid-3 campaigns-page__grid stagger">
              {filtered.map((campaign) => {
                const statusInfo = STATUS_LABELS[campaign.status] || STATUS_LABELS.past;
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
                        <Users size={14} aria-hidden="true" /> {campaign.participants} participants
                      </span>
                    </div>

                    <div className="campaigns-page__card-actions">
                      <Button variant="soft" size="sm" onClick={() => handleJoin(campaign)}>
                        Rejoindre
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        to={`/app/campagnes/${campaign.id}`}
                        iconRight={ArrowRight}
                      >
                        En savoir plus
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
          title="Rejoins la communauté WhatsApp"
          subtitle="Ne manque aucune mobilisation et échange avec d’autres jeunes."
          icon={Users}
        />
        <CardBody>
          {whatsappApi.loading ? (
            <LoadingState label="Chargement du groupe…" />
          ) : whatsappApi.error ? (
            <ErrorState error={whatsappApi.error} onRetry={whatsappApi.refetch} />
          ) : whatsapp ? (
            <>
              <ul className="campaigns-page__whatsapp-list">
                {(whatsapp.groups || []).map((group) => (
                  <li key={group.id}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>
                      <strong>{group.name}</strong> - {group.members} membres
                    </span>
                  </li>
                ))}
              </ul>
              <Button href={whatsapp.link} variant="accent" icon={ExternalLink}>
                Rejoindre le groupe
              </Button>
            </>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
