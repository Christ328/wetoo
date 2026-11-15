import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Trophy,
  Star,
  Lightbulb,
  Lock,
  Info,
} from 'lucide-react';
import {
  Button,
  Card,
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
import './QuizRunner.css';

/** Message adapté au score obtenu. */
function scoreMessage(pct, t) {
  if (pct >= 100) return t('quizRunner.score100');
  if (pct >= 75) return t('quizRunner.score75');
  if (pct >= 50) return t('quizRunner.score50');
  return t('quizRunner.score0');
}

export default function QuizRunner() {
  const { id } = useParams();
  const { isAuthenticated, refreshUser } = useAuth();
  const toast = useToast();
  const { t } = useLang();
  const requireAuth = useRequireAuth();

  const quizApi = useApi(`/learn/quizzes/${id}`, { deps: [id] });
  const quiz = quizApi.data;
  const questions = useMemo(() => quiz?.questions || [], [quiz]);

  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [newBadges, setNewBadges] = useState(null);

  const optionRefs = useRef([]);

  // Repart d'une liste de références vide à chaque nouvelle question.
  useEffect(() => {
    optionRefs.current = [];
  }, [current]);

  function selectOption(questionId, optionId) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  // Navigation clavier dans le groupe de boutons radio (rôle radiogroup).
  function handleOptionKeyDown(event, question, index) {
    const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const last = question.options.length - 1;
    let next = index;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    selectOption(question.id, question.options[next].id);
    optionRefs.current[next]?.focus();
  }

  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  function handleSubmit() {
    requireAuth(async () => {
      setSubmitting(true);
      try {
        const payload = {
          answers: questions.map((q) => ({ questionId: q.id, optionId: answers[q.id] || null })),
        };
        const res = await api.post(`/learn/quizzes/${id}/submit`, payload);
        setResult(res);
        if (res.newBadges?.length) setNewBadges(res.newBadges);
        await refreshUser();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        toast.error(err?.message || t('quizRunner.submitError'));
      } finally {
        setSubmitting(false);
      }
    });
  }

  function restart() {
    setResult(null);
    setAnswers({});
    setCurrent(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ------------------------------- États ---------------------------------- */
  if (quizApi.loading) {
    return (
      <div className="container section quiz-runner">
        <LoadingState label={t('quizRunner.loading')} />
      </div>
    );
  }

  if (quizApi.error) {
    return (
      <div className="container section quiz-runner">
        <ErrorState error={quizApi.error} onRetry={quizApi.refetch} />
        <div className="quiz-runner__back">
          <Button to="/app/quiz" variant="outline" icon={ChevronLeft}>
            {t('quizRunner.backToQuizzes')}
          </Button>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="container section quiz-runner">
        <EmptyState
          icon={ClipboardCheck}
          title={t('quizRunner.noQuestionsTitle')}
          description={t('quizRunner.noQuestionsDesc')}
          action={
            <Button to="/app/quiz" variant="outline">
              {t('learn.seeAllQuizzes')}
            </Button>
          }
        />
      </div>
    );
  }

  /* ----------------------------- Résultats -------------------------------- */
  if (result) {
    const pct = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;
    return (
      <div className="container section quiz-runner">
        <nav className="quiz-runner__breadcrumb" aria-label={t('common.breadcrumbAria')}>
          <Link to="/app/quiz" className="quiz-runner__breadcrumb-link">
            {t('quizRunner.breadcrumb')}
          </Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span aria-current="page">{quiz.title}</span>
        </nav>

        {/* Bandeau de score */}
        <Card tone="soft" padding="lg" className="quiz-runner__score animate-pop">
          <p className="eyebrow">{t('quizRunner.resultEyebrow')}</p>
          <p className="quiz-runner__score-value">
            <span className="quiz-runner__score-number">{result.correct}</span>
            <span className="quiz-runner__score-sep">/</span>
            <span className="quiz-runner__score-total">{result.total}</span>
          </p>
          <p className="quiz-runner__score-message">{scoreMessage(pct, t)}</p>
          <div className="quiz-runner__score-stats">
            <span className="quiz-runner__score-chip">
              <CheckCircle2 size={16} aria-hidden="true" />
              {t('quizRunner.correctCount')(result.correct)}
            </span>
            <span className="quiz-runner__score-chip">
              <Trophy size={16} aria-hidden="true" />
              {t('quizRunner.awardedPoints')(result.awardedPoints)}
            </span>
          </div>
          <div className="quiz-runner__score-actions">
            <Button variant="outline" icon={RotateCcw} onClick={restart}>
              {t('quizRunner.restart')}
            </Button>
            <Button to="/app/quiz" iconRight={ArrowRight}>
              {t('quizRunner.seeOthers')}
            </Button>
          </div>
        </Card>

        {/* Corrections détaillées */}
        <section className="quiz-runner__corrections" aria-labelledby="quiz-corrections-title">
          <h2 id="quiz-corrections-title" className="quiz-runner__corrections-title">
            {t('quizRunner.corrections')}
          </h2>

          {questions.map((question, index) => {
            const correction = (result.corrections || []).find((c) => c.questionId === question.id);
            if (!correction) return null;
            const correctIds = correction.correctOptionIds || [];
            const userChoice = answers[question.id];
            const userWrong = !correction.isCorrect && userChoice;

            return (
              <Card key={question.id} padding="md" className="quiz-runner__correction">
                <div className="quiz-runner__correction-head">
                  <span className="quiz-runner__correction-index">{t('quizRunner.correctionIndex')(index + 1)}</span>
                  {correction.isCorrect ? (
                    <Badge tone="success" icon={CheckCircle2}>
                      {t('quizRunner.correct')}
                    </Badge>
                  ) : (
                    <Badge tone="danger" icon={XCircle}>
                      {t('quizRunner.wrong')}
                    </Badge>
                  )}
                </div>

                <h3 className="quiz-runner__correction-question">{question.question}</h3>

                <ul className="quiz-runner__options quiz-runner__options--result">
                  {question.options.map((option) => {
                    const isCorrect = correctIds.includes(option.id);
                    const isUserWrong = userWrong && option.id === userChoice;
                    const classes = [
                      'quiz-runner__option',
                      'quiz-runner__option--static',
                      isCorrect ? 'is-correct' : '',
                      isUserWrong ? 'is-wrong' : '',
                    ]
                      .filter(Boolean)
                      .join(' ');
                    return (
                      <li key={option.id} className={classes}>
                        <span className="quiz-runner__option-text">{option.text}</span>
                        {isCorrect ? (
                          <CheckCircle2 size={16} aria-hidden="true" className="quiz-runner__option-icon" />
                        ) : isUserWrong ? (
                          <XCircle size={16} aria-hidden="true" className="quiz-runner__option-icon" />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>

                {correction.explanation ? (
                  <p className="quiz-runner__explanation">
                    <Lightbulb size={16} aria-hidden="true" />
                    <span>{correction.explanation}</span>
                  </p>
                ) : null}
              </Card>
            );
          })}
        </section>

        {/* Modale de félicitations */}
        <Modal
          open={Boolean(newBadges && newBadges.length)}
          onClose={() => setNewBadges(null)}
          title={t('quizRunner.badgesTitle')}
          description={t('quizRunner.badgesDesc')}
          size="sm"
          footer={<Button onClick={() => setNewBadges(null)}>{t('quizRunner.badgesOk')}</Button>}
        >
          <ul className="quiz-runner__badges">
            {(newBadges || []).map((badge) => (
              <li key={badge.id} className="quiz-runner__badge">
                <span className="quiz-runner__badge-emoji" aria-hidden="true">
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

  /* ---------------------------- Question en cours -------------------------- */
  const question = questions[current];
  const isLast = current === questions.length - 1;
  const selectedOption = answers[question.id];
  const questionHeadingId = `quiz-question-${question.id}`;

  return (
    <div className="container-narrow section quiz-runner">
      <nav className="quiz-runner__breadcrumb" aria-label={t('common.breadcrumbAria')}>
        <Link to="/app/quiz" className="quiz-runner__breadcrumb-link">
          {t('quizRunner.breadcrumb')}
        </Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{quiz.title}</span>
      </nav>

      <header className="quiz-runner__header">
        <span className="quiz-runner__header-emoji" aria-hidden="true">
          {quiz.emoji}
        </span>
        <div>
          <h1 className="quiz-runner__title">{quiz.title}</h1>
          <div className="tag-row">
            <Badge tone="accent">{quiz.topic}</Badge>
            <Badge icon={Star}>
              {t('quizRunner.pointsToWin')(quiz.points)}
            </Badge>
          </div>
        </div>
      </header>

      {/* Progression dans le quiz */}
      <div className="quiz-runner__progress">
        <div className="quiz-runner__progress-meta">
          <span className="quiz-runner__progress-step">
            {t('quizRunner.questionStep')(current + 1, questions.length)}
          </span>
          <span className="quiz-runner__progress-answered">
            {t('quizRunner.answeredCount')(answeredCount, questions.length)}
          </span>
        </div>
        <ProgressBar value={current + 1} max={questions.length} tone="primary" />
      </div>

      <Card padding="lg" className="quiz-runner__question-card">
        <h2 id={questionHeadingId} className="quiz-runner__question">
          {question.question}
        </h2>

        <div className="quiz-runner__options" role="radiogroup" aria-labelledby={questionHeadingId}>
          {question.options.map((option, index) => {
            const checked = selectedOption === option.id;
            const tabIndex = checked ? 0 : selectedOption ? -1 : index === 0 ? 0 : -1;
            return (
              <div
                key={option.id}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                role="radio"
                aria-checked={checked}
                tabIndex={tabIndex}
                className={`quiz-runner__option ${checked ? 'is-selected' : ''}`}
                onClick={() => selectOption(question.id, option.id)}
                onKeyDown={(event) => handleOptionKeyDown(event, question, index)}
              >
                <span className="quiz-runner__option-marker" aria-hidden="true">
                  {checked ? <CheckCircle2 size={18} /> : null}
                </span>
                <span className="quiz-runner__option-text">{option.text}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Navigation dans le quiz */}
      <div className="quiz-runner__nav">
        <Button
          variant="outline"
          icon={ChevronLeft}
          disabled={current === 0}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
        >
          {t('quizRunner.prev')}
        </Button>

        {isLast ? (
          <Button
            variant="primary"
            icon={CheckCircle2}
            loading={submitting}
            disabled={!allAnswered}
            onClick={handleSubmit}
          >
            {t('quizRunner.finish')}
          </Button>
        ) : (
          <Button
            variant="primary"
            iconRight={ChevronRight}
            onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
          >
            {t('quizRunner.next')}
          </Button>
        )}
      </div>

      {/* Aides contextuelles */}
      <div className="quiz-runner__hints">
        {isLast && !allAnswered ? (
          <p className="quiz-runner__hint quiz-runner__hint--warning" role="status">
            <Info size={16} aria-hidden="true" />
            {t('quizRunner.hintAllRequired')}
          </p>
        ) : null}
        {isAuthenticated ? null : (
          <p className="quiz-runner__hint" role="status">
            <Lock size={16} aria-hidden="true" />
            {t('quizRunner.hintAnon')}
          </p>
        )}
      </div>
    </div>
  );
}
