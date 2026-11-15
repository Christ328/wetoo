import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Medal,
  Crown,
  Star,
  Flame,
  BookOpen,
  MessageSquare,
  Heart,
  LogIn,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { Button } from '../components/ui/Button.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States.jsx';
import { useApi } from '../lib/useApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import { levelName } from '../lib/format.js';
import './Leaderboard.css';

/** Comment on gagne des points (règle affichée aux utilisateurs). */
function getPointRules(t) {
  return [
    { icon: BookOpen, label: t('leaderboard.ruleLesson'), value: t('leaderboard.ruleLessonVal') },
    { icon: Sparkles, label: t('leaderboard.ruleQuiz'), value: t('leaderboard.ruleQuizVal') },
    { icon: MessageSquare, label: t('leaderboard.rulePost'), value: t('leaderboard.rulePostVal') },
    { icon: Heart, label: t('leaderboard.ruleReact'), value: t('leaderboard.ruleReactVal') },
    { icon: Flame, label: t('leaderboard.ruleStreak'), value: t('leaderboard.ruleStreakVal') },
  ];
}

/** Petite ligne de classement (à partir de la 4e place). */
function RankRow({ entry }) {
  const { t, lang } = useLang();
  return (
    <li
      className={`leaderboard-page__row ${entry.isMe ? 'is-me' : ''}`}
      aria-current={entry.isMe ? 'true' : undefined}
    >
      <span className="leaderboard-page__row-rank">{entry.rank}</span>
      <Avatar name={entry.name} avatar={entry.avatar} size="sm" />
      <span className="leaderboard-page__row-name">
        {entry.name}
        {entry.isMe ? (
          <span className="leaderboard-page__you" aria-label={t('leaderboard.itsYou')}>
            {t('leaderboard.you')}
          </span>
        ) : null}
      </span>
      <span className="leaderboard-page__row-level">{levelName(entry.level, lang)}</span>
      <span className="leaderboard-page__row-points">
        <strong>{entry.points}</strong>
        <span>pts</span>
      </span>
    </li>
  );
}

/** Bloc du podium (top 3). */
function PodiumBlock({ entry, place }) {
  const { t, lang } = useLang();
  const placeLabel = `#${entry.rank}`;
  return (
    <div
      className={`leaderboard-page__podium-item is-place-${place} ${
        entry.isMe ? 'is-me' : ''
      }`}
      aria-current={entry.isMe ? 'true' : undefined}
    >
      <span className="leaderboard-page__podium-crown" aria-hidden="true">
        {place === 1 ? <Crown size={24} /> : <Medal size={20} />}
      </span>
      <Avatar name={entry.name} avatar={entry.avatar} size="xl" />
      <span className="leaderboard-page__podium-rank">{placeLabel}</span>
      <span className="leaderboard-page__podium-name">{entry.name}</span>
      <span className="leaderboard-page__podium-level">{levelName(entry.level, lang)}</span>
      <span className="leaderboard-page__podium-points">
        <strong>{entry.points}</strong> pts
      </span>
      {entry.isMe ? (
        <Badge tone="primary" size="sm">
          {t('leaderboard.itsYou')}
        </Badge>
      ) : null}
    </div>
  );
}

export default function Leaderboard() {
  const { isAuthenticated } = useAuth();
  const { t, lang } = useLang();
  const pointRules = getPointRules(t);

  // Le classement est public, mais l'en-tête d'autorisation permet d'identifier « moi ».
  const { data, loading, error, refetch } = useApi('/gamification/leaderboard', {
    auth: true,
    deps: [isAuthenticated],
  });

  const entries = data?.entries || [];
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // Ordre d'affichage du podium : 2e à gauche, 1er au centre, 3e à droite.
  const podiumOrder = useMemo(() => {
    const byPlace = [top3[1], top3[0], top3[2]].filter(Boolean);
    return byPlace.map((entry) => ({ entry, place: top3.indexOf(entry) + 1 }));
  }, [top3]);

  const meNotListed = data?.me && data.me.rank > entries.length ? data.me : null;

  return (
    <div className="leaderboard-page">
      <PageHeader
        eyebrow={t('nav.community')}
        title={t('leaderboard.title')}
        description={t('leaderboard.desc')}
        icon={Trophy}
      />

      {/* Invitation à se connecter (le classement reste consultable). */}
      {!isAuthenticated ? (
        <Card tone="soft" padding="md" className="leaderboard-page__note">
          <div className="leaderboard-page__note-body">
            <LogIn size={22} aria-hidden="true" />
            <p>{t('leaderboard.notAuthNote')}</p>
          </div>
          <Button to="/connexion" size="sm" icon={LogIn}>
            {t('header.signIn')}
          </Button>
        </Card>
      ) : null}

      {/* États de chargement / erreur / vide. */}
      {loading ? (
        <LoadingState label={t('leaderboard.loading')} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={t('leaderboard.emptyTitle')}
          description={t('leaderboard.emptyDesc')}
          action={
            <Button to="/app/apprendre" icon={BookOpen}>
              {t('leaderboard.startLearning')}
            </Button>
          }
        />
      ) : (
        <>
          {/* ------------------------------- Podium ------------------------------- */}
          <section className="leaderboard-page__podium" aria-label={t('leaderboard.podiumAria')}>
            {podiumOrder.map(({ entry, place }) => (
              <PodiumBlock key={entry.rank} entry={entry} place={place} />
            ))}
          </section>

          {/* -------------------- Ma position (si hors du top 10) -------------------- */}
          {meNotListed ? (
            <Card tone="accent" padding="md" className="leaderboard-page__me-card">
              <span className="leaderboard-page__me-rank">#{meNotListed.rank}</span>
              <Avatar name={meNotListed.name} avatar={meNotListed.avatar} size="md" />
              <div className="leaderboard-page__me-info">
                <strong>{t('leaderboard.myPosition')}</strong>
                <span className="text-muted">{levelName(meNotListed.level, lang)}</span>
              </div>
              <span className="leaderboard-page__me-points">
                <strong>{meNotListed.points}</strong> pts
              </span>
            </Card>
          ) : null}

          {/* ----------------------------- Liste classée ----------------------------- */}
          {rest.length > 0 ? (
            <Card padding="sm" className="leaderboard-page__list-card">
              <ol className="leaderboard-page__list">
                {rest.map((entry) => (
                  <RankRow key={entry.rank} entry={entry} />
                ))}
              </ol>
            </Card>
          ) : null}

          {/* --------------------------- Règle des points --------------------------- */}
          <Card tone="outline" padding="lg" className="leaderboard-page__points">
            <div className="leaderboard-page__points-head">
              <span className="icon-tile" aria-hidden="true">
                <Star size={20} />
              </span>
              <div>
                <h2 className="leaderboard-page__points-title">{t('leaderboard.howToTitle')}</h2>
                <p className="text-muted">{t('leaderboard.howToDesc')}</p>
              </div>
            </div>
            <ul className="leaderboard-page__points-list">
              {pointRules.map((rule) => (
                <li key={rule.label} className="leaderboard-page__points-item">
                  <span className="leaderboard-page__points-icon" aria-hidden="true">
                    <rule.icon size={18} />
                  </span>
                  <span className="leaderboard-page__points-label">{rule.label}</span>
                  <span className="leaderboard-page__points-value">{rule.value}</span>
                </li>
              ))}
            </ul>
            <div className="leaderboard-page__points-cta">
              <Button to="/app/apprendre" variant="soft" size="sm" icon={BookOpen}>
                {t('leaderboard.firstPoints')}
              </Button>
            </div>
          </Card>

          {/* Lien doux vers les ressources si la comparaison pèse. */}
          <p className="leaderboard-page__footnote text-muted">
            <Link to="/app/ressources">{t('leaderboard.footnote')}</Link>
          </p>
        </>
      )}
    </div>
  );
}
