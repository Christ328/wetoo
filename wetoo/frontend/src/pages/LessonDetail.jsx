import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  ExternalLink,
  MessageCircle,
  ClipboardCheck,
  BookOpen,
} from 'lucide-react';
import {
  Button,
  Card,
  CardBody,
  Badge,
  ProgressBar,
  Modal,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../components/ui/index.js';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import { useRequireAuth } from '../lib/useRequireAuth.js';
import './LessonDetail.css';

export default function LessonDetail() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const { t } = useLang();
  const requireAuth = useRequireAuth();

  /** Libellés lisibles des niveaux renvoyés par l'API, selon la langue active. */
  const LEVEL_LABELS = {
    débutant: t('learn.levelBeginner'),
    intermédiaire: t('learn.levelIntermed'),
    avancé: t('learn.levelAdvanced'),
  };

  // Leçon courante + liste complète (pour la navigation précédent/suivant) + quiz liés.
  const lessonApi = useApi(`/learn/lessons/${id}`, { auth: false, cache: true, deps: [id] });
  const lessonsApi = useApi('/learn/lessons', { auth: false, cache: true });
  const quizzesApi = useApi('/learn/quizzes', { auth: false, cache: true });

  const lesson = lessonApi.data;

  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newBadges, setNewBadges] = useState(null);

  // Progression de lecture calculée sur le défilement de la page.
  const articleRef = useRef(null);
  const [readPct, setReadPct] = useState(0);

  // Synchronise l'état « terminé » avec le profil utilisateur.
  useEffect(() => {
    if (user?.completedLessons?.includes(id)) setDone(true);
  }, [user, id]);

  // Réinitialise la progression de lecture au changement de leçon.
  useEffect(() => {
    setReadPct(0);
  }, [id]);

  useEffect(() => {
    function update() {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        setReadPct(100);
        return;
      }
      const pct = (-rect.top / scrollable) * 100;
      setReadPct(Math.max(0, Math.min(100, pct)));
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [id, lesson]);

  // Voisins dans la liste complète des cours.
  const { prev, next } = useMemo(() => {
    const list = lessonsApi.data || [];
    const index = list.findIndex((l) => l.id === id);
    if (index < 0) return { prev: null, next: null };
    return {
      prev: index > 0 ? list[index - 1] : null,
      next: index < list.length - 1 ? list[index + 1] : null,
    };
  }, [lessonsApi.data, id]);

  // Quiz en lien avec la catégorie du cours.
  const relatedQuiz = useMemo(() => {
    if (!lesson) return null;
    return (quizzesApi.data || []).find((q) => q.topic === lesson.category) || null;
  }, [quizzesApi.data, lesson]);

  // Enregistrement de la complétion (nécessite un compte).
  function handleComplete() {
    requireAuth(async () => {
      setSubmitting(true);
      try {
        const res = await api.post(`/learn/lessons/${id}/complete`, {});
        setDone(true);
        if (res.newBadges?.length) setNewBadges(res.newBadges);
        if (res.awardedPoints > 0) {
          toast.success(t('lessonDetail.toastPoints')(res.awardedPoints));
        } else if (res.alreadyDone) {
          toast.info(t('lessonDetail.toastAlreadyDone'));
        }
        await refreshUser();
      } catch (err) {
        toast.error(err?.message || t('lessonDetail.toastError'));
      } finally {
        setSubmitting(false);
      }
    });
  }

  /* ------------------------------- États ---------------------------------- */
  if (lessonApi.loading) {
    return (
      <div className="container section lesson-detail">
        <LoadingState label={t('lessonDetail.loading')} />
      </div>
    );
  }

  if (lessonApi.error) {
    return (
      <div className="container section lesson-detail">
        <ErrorState error={lessonApi.error} onRetry={lessonApi.refetch} />
        <div className="lesson-detail__back">
          <Button to="/app/apprendre" variant="outline" icon={ChevronLeft}>
            {t('lessonDetail.backToLearn')}
          </Button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container section lesson-detail">
        <EmptyState
          icon={BookOpen}
          title={t('lessonDetail.notFoundTitle')}
          description={t('lessonDetail.notFoundDesc')}
          action={
            <Button to="/app/apprendre" variant="outline">
              {t('lessonDetail.seeAll')}
            </Button>
          }
        />
      </div>
    );
  }

  const sections = lesson.sections || [];
  const sources = lesson.sources || [];

  return (
    <div className="container section lesson-detail">
      {/* Fil d'Ariane */}
      <nav className="lesson-detail__breadcrumb" aria-label={t('common.breadcrumbAria')}>
        <Link to="/app/apprendre" className="lesson-detail__breadcrumb-link">
          {t('learn.title')}
        </Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span className="lesson-detail__breadcrumb-current" aria-current="page">
          {lesson.title}
        </span>
      </nav>

      {/* En-tête de la leçon */}
      <header className="lesson-detail__header">
        <span className="lesson-detail__emoji" aria-hidden="true">
          {lesson.emoji}
        </span>
        <div className="lesson-detail__header-text">
          <h1 className="lesson-detail__title">{lesson.title}</h1>
          <p className="lesson-detail__summary">{lesson.summary}</p>
          <div className="tag-row">
            <Badge tone="primary">{lesson.category}</Badge>
            <Badge tone="info">{LEVEL_LABELS[lesson.level] || lesson.level}</Badge>
            <Badge icon={Clock}>{lesson.durationMin} min</Badge>
            <Badge tone="accent" icon={Star}>
              {lesson.points} pts
            </Badge>
            {done ? (
              <Badge tone="success" icon={CheckCircle2}>
                {t('learn.doneBadge')}
              </Badge>
            ) : null}
          </div>
        </div>
      </header>

      {/* Barre de progression de lecture (collante) */}
      <div className="lesson-detail__progress">
        <ProgressBar value={readPct} max={100} label={t('lessonDetail.readProgress')} showValue tone="accent" />
      </div>

      {/* Corps du cours */}
      <article ref={articleRef} className="lesson-detail__article">
        {sections.map((section, index) => (
          <Card key={section.heading || index} padding="lg" className="lesson-detail__section">
            <h2 className="lesson-detail__section-title">{section.heading}</h2>
            {String(section.body || '')
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragraph, pIndex) => (
                <p key={pIndex} className="lesson-detail__paragraph">
                  {paragraph}
                </p>
              ))}

            {section.keyPoints?.length ? (
              <aside className="lesson-detail__keypoints" aria-label={t('lessonDetail.keyPointsAria')}>
                <div className="lesson-detail__keypoints-head">
                  <Lightbulb size={18} aria-hidden="true" />
                  <span>{t('lessonDetail.toRemember')}</span>
                </div>
                <ul className="lesson-detail__keypoints-list">
                  {section.keyPoints.map((point) => (
                    <li key={point}>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </Card>
        ))}
      </article>

      {/* Action principale */}
      <div className="lesson-detail__action">
        <Button
          variant="primary"
          size="lg"
          icon={CheckCircle2}
          loading={submitting}
          disabled={done}
          onClick={handleComplete}
        >
          {done ? t('learn.doneBadge') : t('lessonDetail.markDone')}
        </Button>
        {!done ? (
          <p className="lesson-detail__action-hint">
            {t('lessonDetail.willEarnPoints')(lesson.points)}
          </p>
        ) : null}
      </div>

      {/* Navigation précédent / suivant */}
      <nav className="lesson-detail__nav" aria-label={t('lessonDetail.navAria')}>
        {prev ? (
          <Button
            to={`/app/apprendre/${prev.id}`}
            variant="outline"
            icon={ChevronLeft}
            className="lesson-detail__nav-btn lesson-detail__nav-btn--prev"
          >
            {prev.title}
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button
            to={`/app/apprendre/${next.id}`}
            variant="outline"
            iconRight={ChevronRight}
            className="lesson-detail__nav-btn lesson-detail__nav-btn--next"
          >
            {next.title}
          </Button>
        ) : null}
      </nav>

      {/* Sources */}
      {sources.length ? (
        <section className="lesson-detail__sources" aria-labelledby="lesson-sources-title">
          <h2 id="lesson-sources-title" className="lesson-detail__sources-title">
            {t('lessonDetail.sourcesTitle')}
          </h2>
          <ul className="lesson-detail__sources-list">
            {sources.map((source) => (
              <li key={source.url || source.title} className="lesson-detail__source">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lesson-detail__source-link"
                >
                  <ExternalLink size={15} aria-hidden="true" />
                  <span>{source.title}</span>
                </a>
                {source.label ? <span className="lesson-detail__source-label">{source.label}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Encart de bas de page */}
      <Card tone="accent" padding="md" className="lesson-detail__cta">
        <CardBody className="lesson-detail__cta-body">
          <span className="icon-tile icon-tile--accent" aria-hidden="true">
            <MessageCircle size={22} />
          </span>
          <div className="lesson-detail__cta-text">
            <h2 className="lesson-detail__cta-title">{t('lessonDetail.ctaTitle')}</h2>
            <p className="lesson-detail__cta-desc">
              {t('lessonDetail.ctaDesc')}
            </p>
          </div>
          <div className="lesson-detail__cta-actions">
            <Button to="/app/chat" icon={MessageCircle}>
              {t('lessonDetail.openChatbot')}
            </Button>
            {relatedQuiz ? (
              <Button to={`/app/quiz/${relatedQuiz.id}`} variant="outline" icon={ClipboardCheck}>
                {t('lessonDetail.quizBtn')(relatedQuiz.title)}
              </Button>
            ) : null}
          </div>
        </CardBody>
      </Card>

      {/* Modale de félicitations pour les nouveaux badges */}
      <Modal
        open={Boolean(newBadges && newBadges.length)}
        onClose={() => setNewBadges(null)}
        title={t('lessonDetail.badgesTitle')}
        description={t('lessonDetail.badgesDesc')}
        size="sm"
        footer={<Button onClick={() => setNewBadges(null)}>{t('lessonDetail.badgesOk')}</Button>}
      >
        <ul className="lesson-detail__badges">
          {(newBadges || []).map((badge) => (
            <li key={badge.id} className="lesson-detail__badge">
              <span className="lesson-detail__badge-emoji" aria-hidden="true">
                {badge.emoji}
              </span>
              <div>
                <strong>{badge.name}</strong>
                <p>{badge.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}
