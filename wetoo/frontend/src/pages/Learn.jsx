import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  X,
  Trophy,
  Flame,
  CheckCircle2,
  Clock,
  Star,
  Layers,
  ArrowRight,
  ClipboardCheck,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import {
  Button,
  IconButton,
  Card,
  Chip,
  Badge,
  Input,
  ProgressBar,
  ProgressRing,
  SectionHeading,
  Skeleton,
  SkeletonCards,
  ErrorState,
  EmptyState,
} from '../components/ui/index.js';
import { useApi } from '../lib/useApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { pluralize } from '../lib/format.js';
import './Learn.css';

/** Libellés lisibles des niveaux renvoyés par l'API. */
const LEVEL_LABELS = {
  débutant: 'Débutant',
  intermédiaire: 'Intermédiaire',
  avancé: 'Avancé',
};

/** Normalise une chaîne pour une recherche insensible à la casse et aux accents. */
function normalize(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function Learn() {
  const { t } = useLang();
  const { user, isAuthenticated } = useAuth();

  /** Libellés lisibles des niveaux renvoyés par l'API, selon la langue active. */
  const LEVEL_LABELS = {
    débutant: t('learn.levelBeginner'),
    intermédiaire: t('learn.levelIntermed'),
    avancé: t('learn.levelAdvanced'),
  };

  // Listes : cours et quiz (publics, mis en cache pour un usage hors ligne).
  const lessonsApi = useApi('/learn/lessons', { auth: false, cache: true });
  const quizzesApi = useApi('/learn/quizzes', { auth: false, cache: true });
  // Progression personnelle (uniquement si connecté).
  const progressApi = useApi(isAuthenticated ? '/gamification/me' : null, { auth: true });

  // Filtres locaux.
  const [category, setCategory] = useState('Toutes');
  const [level, setLevel] = useState('Tous');
  const [search, setSearch] = useState('');

  const lessons = lessonsApi.data || [];
  const quizzes = quizzesApi.data || [];
  const completed = user?.completedLessons || [];

  // Catégories et niveaux déduits des données réelles.
  const categories = useMemo(
    () => [...new Set(lessons.map((l) => l.category).filter(Boolean))],
    [lessons]
  );
  const levels = useMemo(
    () => [...new Set(lessons.map((l) => l.level).filter(Boolean))],
    [lessons]
  );

  // Application des filtres : catégorie, niveau et recherche plein texte.
  const filteredLessons = useMemo(() => {
    const term = normalize(search.trim());
    return lessons.filter((l) => {
      if (category !== 'Toutes' && l.category !== category) return false;
      if (level !== 'Tous' && l.level !== level) return false;
      if (term) {
        const haystack = normalize(`${l.title} ${l.summary}`);
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [lessons, category, level, search]);

  const hasFilters = category !== 'Toutes' || level !== 'Tous' || search.trim() !== '';
  function resetFilters() {
    setCategory('Toutes');
    setLevel('Tous');
    setSearch('');
  }

  return (
    <div className="container section learn-page">
      <PageHeader
        eyebrow={t('learn.eyebrow')}
        title={t('learn.title')}
        description={t('learn.desc')}
        icon={GraduationCap}
      />

      {/* ---------------- Bandeau de progression (si connecté) ---------------- */}
      {isAuthenticated ? (
        progressApi.loading ? (
          <div className="learn-page__band learn-page__band--loading">
            <Skeleton width="84px" height={84} radius={999} />
            <div className="learn-page__band-text">
              <Skeleton width="40%" height={20} />
              <Skeleton width="70%" height={14} />
              <Skeleton width="100%" height={12} />
            </div>
          </div>
        ) : progressApi.data ? (
          <Card tone="soft" padding="md" className="learn-page__band animate-up">
            <div className="learn-page__band-main">
              <ProgressRing value={progressApi.data.progressPct} max={100} size={88} stroke={8}>
                <span className="learn-page__band-level">{t('learn.levelPrefix')}{progressApi.data.level}</span>
              </ProgressRing>
              <div className="learn-page__band-text">
                <p className="eyebrow">{t('learn.progressEyebrow')}</p>
                <h2 className="learn-page__band-title">{progressApi.data.levelName}</h2>
                <ProgressBar
                  value={progressApi.data.progressPct}
                  max={100}
                  showValue
                  tone="primary"
                  label={
                    progressApi.data.nextLevelAt != null
                      ? t('learn.toNextLevel')(progressApi.data.nextLevelAt)
                      : t('learn.maxLevel')
                  }
                />
              </div>
            </div>
            <div className="learn-page__band-stats">
              <div className="learn-page__stat">
                <Trophy size={18} aria-hidden="true" />
                <strong>{progressApi.data.points}</strong>
                <span>{t('learn.statPoints')}</span>
              </div>
              <div className="learn-page__stat">
                <CheckCircle2 size={18} aria-hidden="true" />
                <strong>{progressApi.data.completedLessonsCount}</strong>
                <span>{t('learn.statDone')}</span>
              </div>
              <div className="learn-page__stat">
                <Flame size={18} aria-hidden="true" />
                <strong>{progressApi.data.streak}</strong>
                <span>{t('learn.statStreak')}</span>
              </div>
            </div>
          </Card>
        ) : null
      ) : null}

      {/* ------------------------------- Filtres ------------------------------- */}
      <div className="learn-page__filters">
        <div className="learn-page__filter-group">
          <span className="learn-page__filter-label">{t('learn.filterCategory')}</span>
          <div className="tag-row" role="group" aria-label={t('learn.filterByCat')}>
            <Chip selected={category === 'Toutes'} onClick={() => setCategory('Toutes')}>
              {t('learn.filterAll')}
            </Chip>
            {categories.map((c) => (
              <Chip key={c} selected={category === c} onClick={() => setCategory(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>

        <div className="learn-page__filter-group">
          <span className="learn-page__filter-label">{t('learn.filterLevel')}</span>
          <div className="tag-row" role="group" aria-label={t('learn.filterByLevel')}>
            <Chip selected={level === 'Tous'} onClick={() => setLevel('Tous')}>
              {t('learn.filterAllLevels')}
            </Chip>
            {levels.map((l) => (
              <Chip key={l} selected={level === l} onClick={() => setLevel(l)}>
                {LEVEL_LABELS[l] || l}
              </Chip>
            ))}
          </div>
        </div>

        <div className="learn-page__filter-group learn-page__filter-group--search">
          <label className="learn-page__filter-label" htmlFor="learn-search">
            {t('learn.filterSearch')}
          </label>
          <div className="learn-page__search">
            <Search size={18} aria-hidden="true" className="learn-page__search-icon" />
            <Input
              id="learn-search"
              type="search"
              placeholder={t('learn.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="learn-page__search-input"
            />
            {search ? (
              <span className="learn-page__search-clear">
                <IconButton label={t('learn.clearSearch')} icon={X} size="sm" onClick={() => setSearch('')} />
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* ------------------------------- Cours -------------------------------- */}
      <section aria-labelledby="learn-lessons-title">
        <h2 id="learn-lessons-title" className="sr-only">
          {t('learn.coursesSr')}
        </h2>

        {lessonsApi.loading ? (
          <SkeletonCards count={6} />
        ) : lessonsApi.error ? (
          <ErrorState error={lessonsApi.error} onRetry={lessonsApi.refetch} />
        ) : filteredLessons.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={t('learn.noMatchTitle')}
            description={t('learn.noMatchDesc')}
            action={
              hasFilters ? (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  {t('learn.resetFilters')}
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="grid grid-3 learn-page__lesson-grid stagger">
            {filteredLessons.map((lesson) => {
              const done = completed.includes(lesson.id);
              return (
                <Card
                  key={lesson.id}
                  as={Link}
                  to={`/app/apprendre/${lesson.id}`}
                  interactive
                  padding="md"
                  className="learn-page__lesson-card"
                >
                  <div className="learn-page__lesson-top">
                    <span className="learn-page__lesson-emoji" aria-hidden="true">
                      {lesson.emoji}
                    </span>
                    {done ? (
                      <Badge tone="success" icon={CheckCircle2}>
                        {t('learn.doneBadge')}
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="learn-page__lesson-title">{lesson.title}</h3>
                  <p className="learn-page__lesson-summary clamp-2">{lesson.summary}</p>
                  <div className="tag-row learn-page__lesson-badges">
                    <Badge tone="primary">{lesson.category}</Badge>
                    <Badge tone="info">{LEVEL_LABELS[lesson.level] || lesson.level}</Badge>
                    <Badge icon={Clock}>{lesson.durationMin} min</Badge>
                    <Badge tone="accent" icon={Star}>
                      {lesson.points} pts
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* -------------------------------- Quiz -------------------------------- */}
      <section className="learn-page__quiz" aria-labelledby="learn-quiz-title">
        <div className="learn-page__quiz-head">
          <SectionHeading
            eyebrow={t('learn.quizEyebrow')}
            title={t('learn.quizTitle')}
            description={t('learn.quizDesc')}
          />
          <Button variant="outline" to="/app/quiz" iconRight={ArrowRight}>
            {t('learn.seeAllQuizzes')}
          </Button>
        </div>
        <h2 id="learn-quiz-title" className="sr-only">
          {t('learn.quizTitle')}
        </h2>

        {quizzesApi.loading ? (
          <SkeletonCards count={3} />
        ) : quizzesApi.error ? (
          <ErrorState error={quizzesApi.error} onRetry={quizzesApi.refetch} />
        ) : quizzes.length === 0 ? (
          <EmptyState
            icon={ClipboardCheck}
            title={t('learn.noQuizTitle')}
            description={t('learn.noQuizDesc')}
          />
        ) : (
          <div className="grid grid-3 learn-page__quiz-grid stagger">
            {quizzes.slice(0, 6).map((quiz) => (
              <Card key={quiz.id} padding="md" className="learn-page__quiz-card">
                <div className="learn-page__quiz-top">
                  <span className="learn-page__quiz-emoji" aria-hidden="true">
                    {quiz.emoji}
                  </span>
                  <Badge tone="accent" icon={Layers}>
                    {quiz.topic}
                  </Badge>
                </div>
                <h3 className="learn-page__quiz-title">{quiz.title}</h3>
                <p className="learn-page__quiz-desc clamp-2">{quiz.description}</p>
                <div className="meta-row">
                  <span className="meta-item">{pluralize(quiz.questionsCount, 'question', 'questions')}</span>
                  <span className="meta-item">
                    <Star size={14} aria-hidden="true" />
                    {quiz.points} points
                  </span>
                </div>
                <div className="learn-page__quiz-action">
                  <Button to={`/app/quiz/${quiz.id}`} block iconRight={ArrowRight}>
                    {t('learn.quizStart')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
