import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  MessageCircle,
  ShieldCheck,
  Users,
  Clock,
  Flame,
  HeartHandshake,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Tabs,
  Modal,
  Field,
  Input,
  Textarea,
  Select,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../components/ui/index.js';
import { PostCard } from '../components/domain/PostCard.jsx';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useRequireAuth } from '../lib/useRequireAuth.js';
import './Community.css';

const SORT_TABS = [
  { id: 'recent', label: 'Récentes', icon: Clock },
  { id: 'popular', label: 'Populaires', icon: Flame },
];

const EMPTY_FORM = { title: '', category: '', body: '', anonymous: false };

/** Page du forum communautaire : liste, filtres, création et signalement. */
export default function Community() {
  const toast = useToast();
  const requireAuth = useRequireAuth();

  // --- Filtres de la liste ---
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('recent');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // --- Composition d'une nouvelle discussion ---
  const [composerOpen, setComposerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // --- Signalement ---
  const [reportTarget, setReportTarget] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  // Débounce de la recherche pour limiter les appels réseau.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const categoriesApi = useApi('/community/categories', { auth: false, cache: true });
  const whatsappApi = useApi('/community/whatsapp', { auth: false, cache: true });

  const postsPath = useMemo(() => {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    params.set('sort', sort);
    if (debouncedQuery) params.set('q', debouncedQuery);
    return `/community/posts?${params.toString()}`;
  }, [category, sort, debouncedQuery]);

  const postsApi = useApi(postsPath, { auth: false });

  const categories = Array.isArray(categoriesApi.data) ? categoriesApi.data : [];
  const posts = Array.isArray(postsApi.data) ? postsApi.data : [];
  const whatsapp = whatsappApi.data;

  // ------------------------------ Actions ------------------------------
  function openComposer() {
    requireAuth(() => {
      setForm((prev) => ({
        ...prev,
        category: prev.category || categories[0]?.id || '',
      }));
      setComposerOpen(true);
    });
  }

  async function submitPost(event) {
    event.preventDefault();
    if (submitting) return;
    if (form.title.trim().length < 5) {
      toast.error('Le titre doit contenir au moins 5 caractères.');
      return;
    }
    if (!form.category) {
      toast.error('Choisis une catégorie.');
      return;
    }
    if (form.body.trim().length < 10) {
      toast.error('Le message doit contenir au moins 10 caractères.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.post('/community/posts', {
        title: form.title.trim(),
        body: form.body.trim(),
        category: form.category,
        anonymous: form.anonymous,
      });
      toast.success(result?.message || 'Ta discussion a été publiée. Merci pour ta contribution !');
      setComposerOpen(false);
      setForm(EMPTY_FORM);
      postsApi.refetch();
    } catch (err) {
      toast.error(err?.message || 'Impossible de publier ta discussion pour le moment.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReact(post, type) {
    requireAuth(async () => {
      try {
        await api.post(`/community/posts/${post.id}/react`, { type });
        toast.success(type === 'support' ? 'Merci pour ton soutien !' : 'Merci, ton avis compte !');
        postsApi.refetch();
      } catch (err) {
        toast.error(err?.message || 'Action impossible pour le moment.');
      }
    });
  }

  function openReport(post) {
    requireAuth(() => {
      setReportTarget(post);
      setReportReason('');
    });
  }

  async function submitReport(event) {
    event.preventDefault();
    if (!reportTarget || reporting) return;
    if (reportReason.trim().length < 3) {
      toast.error('Merci d’indiquer la raison du signalement.');
      return;
    }
    setReporting(true);
    try {
      const result = await api.post(`/community/posts/${reportTarget.id}/report`, {
        reason: reportReason.trim(),
      });
      toast.success(result?.message || 'Merci, ton signalement a été transmis à notre équipe.');
      setReportTarget(null);
      setReportReason('');
    } catch (err) {
      toast.error(err?.message || 'Le signalement n’a pas pu être envoyé.');
    } finally {
      setReporting(false);
    }
  }

  // ------------------------------ Rendu ------------------------------
  return (
    <div className="community-page">
      <PageHeader
        eyebrow="Entraide entre jeunes"
        title="Communauté"
        description="Pose ta question, partage ton expérience, soutiens les autres - en anonyme si tu préfères."
        icon={MessageCircle}
        actions={
          <Button icon={Plus} onClick={openComposer}>
            Nouvelle discussion
          </Button>
        }
      />

      <div className="community-page__toolbar">
        <div className="community-page__search">
          <Search size={18} aria-hidden="true" className="community-page__search-icon" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une discussion…"
            aria-label="Rechercher une discussion"
            className="community-page__search-input"
          />
        </div>

        <div className="community-page__chips tag-row" role="group" aria-label="Filtrer par catégorie">
          <Chip selected={category === ''} onClick={() => setCategory('')}>
            Toutes
          </Chip>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              selected={category === cat.id}
              onClick={() => setCategory(cat.id)}
            >
              <span aria-hidden="true">{cat.emoji}</span> {cat.label}
              <span className="community-page__chip-count">{cat.count}</span>
            </Chip>
          ))}
        </div>
      </div>

      <div className="community-page__layout">
        <div className="community-page__main">
          <Tabs
            items={SORT_TABS}
            value={sort}
            onChange={setSort}
            ariaLabel="Trier les discussions"
          />

          {postsApi.loading ? (
            <LoadingState label="Chargement des discussions…" />
          ) : postsApi.error ? (
            <ErrorState error={postsApi.error} onRetry={postsApi.refetch} />
          ) : posts.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="Aucune discussion pour l’instant"
              description="Sois la première personne à lancer un sujet. Ton message peut vraiment aider quelqu’un."
              action={
                <Button icon={Plus} onClick={openComposer}>
                  Lancer une discussion
                </Button>
              }
            />
          ) : (
            <ul className="community-page__posts stack stagger" aria-label="Liste des discussions">
              {posts.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} onReact={handleReact} onReport={openReport} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="community-page__sidebar stack" aria-label="Informations complémentaires">
          <Card tone="soft">
            <CardHeader
              title="Rejoins le groupe WhatsApp"
              subtitle="Une entraide quotidienne, près de chez toi."
              icon={Users}
            />
            <CardBody>
              {whatsappApi.loading ? (
                <LoadingState label="Chargement du groupe…" />
              ) : whatsappApi.error ? (
                <ErrorState error={whatsappApi.error} onRetry={whatsappApi.refetch} />
              ) : whatsapp ? (
                <>
                  <ul className="community-page__groups stack">
                    {(whatsapp.groups || []).map((group) => (
                      <li key={group.id} className="community-page__group">
                        <span className="community-page__group-name">{group.name}</span>
                        <span className="text-subtle community-page__group-meta">
                          {group.members} membres
                        </span>
                        <p className="community-page__group-desc clamp-2">{group.description}</p>
                      </li>
                    ))}
                  </ul>

                  {whatsapp.rules?.length ? (
                    <>
                      <p className="community-page__subtitle">Règles du groupe</p>
                      <ul className="community-page__rules stack">
                        {whatsapp.rules.map((rule) => (
                          <li key={rule}>{rule}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}

                  <Button
                    href={whatsapp.link}
                    variant="accent"
                    icon={ExternalLink}
                    block
                  >
                    Rejoindre le groupe
                  </Button>
                </>
              ) : null}
            </CardBody>
          </Card>

          <Card tone="outline">
            <CardHeader
              title="Modération et sécurité"
              subtitle="Ta sécurité passe avant tout."
              icon={ShieldCheck}
            />
            <CardBody>
              <ul className="community-page__rules stack">
                <li>
                  <strong>Anonymat&nbsp;:</strong> tu peux publier sans donner ton nom.
                </li>
                <li>
                  <strong>Signalement&nbsp;:</strong> signale toute publication qui te semble
                  irrespectueuse ou dangereuse.
                </li>
                <li>
                  <strong>Modération humaine&nbsp;:</strong> une équipe relit les contenus
                  sensibles et intervient si besoin.
                </li>
              </ul>
            </CardBody>
          </Card>
        </aside>
      </div>

      {/* --------------------- Modal : nouvelle discussion --------------------- */}
      <Modal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        title="Nouvelle discussion"
        description="Partage ce que tu veux, en anonyme si tu préfères. Reste bienveillant·e."
      >
        <form className="community-page__form stack" onSubmit={submitPost}>
          <Field label="Titre" htmlFor="post-title" required>
            <Input
              id="post-title"
              data-autofocus
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Résume ta question en une phrase"
              maxLength={140}
            />
          </Field>

          <Field label="Catégorie" htmlFor="post-category" required>
            <Select
              id="post-category"
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            >
              <option value="">Choisir une catégorie…</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Message"
            htmlFor="post-body"
            required
            hint="Minimum 10 caractères. Ne partage pas d’informations personnelles identifiantes."
          >
            <Textarea
              id="post-body"
              rows={6}
              value={form.body}
              onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
              placeholder="Explique ta situation ou ta question…"
              maxLength={2000}
            />
          </Field>

          <label className="community-page__check" htmlFor="post-anonymous">
            <input
              id="post-anonymous"
              type="checkbox"
              checked={form.anonymous}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, anonymous: event.target.checked }))
              }
            />
            <span>Publier en anonyme</span>
          </label>

          <div className="community-page__note">
            <HeartHandshake size={18} aria-hidden="true" />
            <p>
              Bienveillance&nbsp;: pas de jugement, pas de diagnostic médical, pas de données
              personnelles sur les autres.
            </p>
          </div>

          <div className="community-page__form-actions">
            <Button variant="ghost" onClick={() => setComposerOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" loading={submitting} icon={Plus}>
              Publier
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------------- Modal : signalement ------------------------- */}
      <Modal
        open={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        title="Signaler cette publication"
        description="Ton signalement est anonyme et sera étudié par notre équipe de modération."
        size="sm"
      >
        <form className="community-page__form stack" onSubmit={submitReport}>
          <Field
            label="Raison du signalement"
            htmlFor="report-reason"
            required
            hint="Exemple : propos irrespectueux, contenu dangereux, harcèlement…"
          >
            <Textarea
              id="report-reason"
              data-autofocus
              rows={4}
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              placeholder="Explique en quelques mots…"
              maxLength={500}
            />
          </Field>

          <div className="community-page__form-actions">
            <Button variant="ghost" onClick={() => setReportTarget(null)}>
              Annuler
            </Button>
            <Button type="submit" variant="danger" loading={reporting}>
              Envoyer le signalement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
