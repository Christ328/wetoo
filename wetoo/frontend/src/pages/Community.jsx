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
import { useLang } from '../context/LangContext.jsx';
import { useRequireAuth } from '../lib/useRequireAuth.js';
import './Community.css';

const EMPTY_FORM = { title: '', category: '', body: '', anonymous: false };

/** Page du forum communautaire : liste, filtres, création et signalement. */
export default function Community() {
  const toast = useToast();
  const { t } = useLang();
  const requireAuth = useRequireAuth();

  const sortTabs = [
    { id: 'recent', label: t('community.sortRecent'), icon: Clock },
    { id: 'popular', label: t('community.sortPopular'), icon: Flame },
  ];

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
      toast.error(t('community.validTitleMin'));
      return;
    }
    if (!form.category) {
      toast.error(t('community.validCatReq'));
      return;
    }
    if (form.body.trim().length < 10) {
      toast.error(t('community.validBodyMin'));
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
      toast.success(t('community.toastPublished')(result?.message));
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
        toast.success(type === 'support' ? t('community.toastSupport') : t('community.toastVote'));
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
      toast.error(t('community.validReportMin'));
      return;
    }
    setReporting(true);
    try {
      const result = await api.post(`/community/posts/${reportTarget.id}/report`, {
        reason: reportReason.trim(),
      });
      toast.success(t('community.toastReported')(result?.message));
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
        eyebrow={t('community.eyebrow')}
        title={t('community.title')}
        description={t('community.desc')}
        icon={MessageCircle}
        actions={
          <Button icon={Plus} onClick={openComposer}>
            {t('community.newPost')}
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
            placeholder={t('community.searchPlaceholder')}
            aria-label={t('community.searchAria')}
            className="community-page__search-input"
          />
        </div>

        <div className="community-page__chips tag-row" role="group" aria-label={t('community.filterByCat')}>
          <Chip selected={category === ''} onClick={() => setCategory('')}>
            {t('community.filterAll')}
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
            items={sortTabs}
            value={sort}
            onChange={setSort}
            ariaLabel={t('community.sortAria')}
          />

          {postsApi.loading ? (
            <LoadingState label={t('community.loadingPosts')} />
          ) : postsApi.error ? (
            <ErrorState error={postsApi.error} onRetry={postsApi.refetch} />
          ) : posts.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title={t('community.noPostTitle')}
              description={t('community.noPostDesc')}
              action={
                <Button icon={Plus} onClick={openComposer}>
                  {t('community.launchPost')}
                </Button>
              }
            />
          ) : (
            <ul className="community-page__posts stack stagger" aria-label={t('community.listAria')}>
              {posts.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} onReact={handleReact} onReport={openReport} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="community-page__sidebar stack" aria-label={t('community.sidebarAria')}>
          <Card tone="soft">
            <CardHeader
              title={t('community.whatsappTitle')}
              subtitle={t('community.whatsappSub')}
              icon={Users}
            />
            <CardBody>
              {whatsappApi.loading ? (
                <LoadingState label={t('community.loadingGroup')} />
              ) : whatsappApi.error ? (
                <ErrorState error={whatsappApi.error} onRetry={whatsappApi.refetch} />
              ) : whatsapp ? (
                <>
                  <ul className="community-page__groups stack">
                    {(whatsapp.groups || []).map((group) => (
                      <li key={group.id} className="community-page__group">
                        <span className="community-page__group-name">{group.name}</span>
                        <span className="text-subtle community-page__group-meta">
                          {t('community.members')(group.members)}
                        </span>
                        <p className="community-page__group-desc clamp-2">{group.description}</p>
                      </li>
                    ))}
                  </ul>

                  {whatsapp.rules?.length ? (
                    <>
                      <p className="community-page__subtitle">{t('community.groupRules')}</p>
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
                    {t('community.joinGroup')}
                  </Button>
                </>
              ) : null}
            </CardBody>
          </Card>

          <Card tone="outline">
            <CardHeader
              title={t('community.modTitle')}
              subtitle={t('community.modSub')}
              icon={ShieldCheck}
            />
            <CardBody>
              <ul className="community-page__rules stack">
                <li>
                  <strong>{t('community.modAnon')}</strong> {t('community.modAnonText')}
                </li>
                <li>
                  <strong>{t('community.modReport')}</strong> {t('community.modReportText')}
                </li>
                <li>
                  <strong>{t('community.modHuman')}</strong> {t('community.modHumanText')}
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
        title={t('community.composerTitle')}
        description={t('community.composerDesc')}
      >
        <form className="community-page__form stack" onSubmit={submitPost}>
          <Field label={t('community.fieldTitle')} htmlFor="post-title" required>
            <Input
              id="post-title"
              data-autofocus
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder={t('community.fieldTitlePH')}
              maxLength={140}
            />
          </Field>

          <Field label={t('community.fieldCat')} htmlFor="post-category" required>
            <Select
              id="post-category"
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            >
              <option value="">{t('community.fieldCatPH')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label={t('community.fieldBody')}
            htmlFor="post-body"
            required
            hint={t('community.fieldBodyHint')}
          >
            <Textarea
              id="post-body"
              rows={6}
              value={form.body}
              onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
              placeholder={t('community.fieldBodyPH')}
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
            <span>{t('community.checkAnon')}</span>
          </label>

          <div className="community-page__note">
            <HeartHandshake size={18} aria-hidden="true" />
            <p>{t('community.kindnessNote')}</p>
          </div>

          <div className="community-page__form-actions">
            <Button variant="ghost" onClick={() => setComposerOpen(false)}>
              {t('community.cancel')}
            </Button>
            <Button type="submit" loading={submitting} icon={Plus}>
              {t('community.publish')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ------------------------- Modal : signalement ------------------------- */}
      <Modal
        open={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        title={t('community.reportTitle')}
        description={t('community.reportDesc')}
        size="sm"
      >
        <form className="community-page__form stack" onSubmit={submitReport}>
          <Field
            label={t('community.reportField')}
            htmlFor="report-reason"
            required
            hint={t('community.reportHint')}
          >
            <Textarea
              id="report-reason"
              data-autofocus
              rows={4}
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              placeholder={t('community.reportPH')}
              maxLength={500}
            />
          </Field>

          <div className="community-page__form-actions">
            <Button variant="ghost" onClick={() => setReportTarget(null)}>
              {t('community.cancel')}
            </Button>
            <Button type="submit" variant="danger" loading={reporting}>
              {t('community.reportSend')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
