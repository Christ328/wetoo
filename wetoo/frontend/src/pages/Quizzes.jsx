import { Link } from 'react-router-dom';
import { ClipboardCheck, Star, Layers, ArrowRight, HelpCircle } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import {
  Button,
  Card,
  Badge,
  SkeletonCards,
  ErrorState,
  EmptyState,
} from '../components/ui/index.js';
import { useApi } from '../lib/useApi.js';
import { useLang } from '../context/LangContext.jsx';
import { pluralize } from '../lib/format.js';
import './Quizzes.css';

export default function Quizzes() {
  const { t } = useLang();
  // Liste publique des quiz (mise en cache pour un usage hors ligne).
  const { data, loading, error, refetch } = useApi('/learn/quizzes', { auth: false, cache: true });
  const quizzes = data || [];

  return (
    <div className="container section quizzes-page">
      <PageHeader
        eyebrow={t('learn.eyebrow')}
        title={t('learn.quizTitle')}
        description={t('quizzes.desc')}
        icon={ClipboardCheck}
      />

      {loading ? (
        <SkeletonCards count={6} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title={t('quizzes.noTitle')}
          description={t('quizzes.noDesc')}
          action={
            <Button to="/app/apprendre" variant="outline">
              {t('quizzes.seeLessons')}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-3 quizzes-page__grid stagger">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} padding="md" className="quizzes-page__card">
              <div className="quizzes-page__top">
                <span className="quizzes-page__emoji" aria-hidden="true">
                  {quiz.emoji}
                </span>
                <Badge tone="accent" icon={Layers}>
                  {quiz.topic}
                </Badge>
              </div>

              <h2 className="quizzes-page__title">{quiz.title}</h2>
              <p className="quizzes-page__desc clamp-2">{quiz.description}</p>

              <div className="meta-row quizzes-page__meta">
                <span className="meta-item">
                  <HelpCircle size={14} aria-hidden="true" />
                  {pluralize(quiz.questionsCount, 'question', 'questions')}
                </span>
                <span className="meta-item">
                  <Star size={14} aria-hidden="true" />
                  {quiz.points} points
                </span>
              </div>

              <div className="quizzes-page__action">
                <Button to={`/app/quiz/${quiz.id}`} block iconRight={ArrowRight}>
                  {t('learn.quizStart')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Raccourci vers les cours */}
      <div className="quizzes-page__footer">
        <Link to="/app/apprendre" className="quizzes-page__footer-link">
          {t('quizzes.footerLink')}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
