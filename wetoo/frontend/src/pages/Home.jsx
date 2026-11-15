import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  GraduationCap,
  Users,
  Stethoscope,
  ArrowRight,
  Sparkles,
  Flame,
  Trophy,
  Star,
  BookOpen,
  Clock,
  Megaphone,
  RefreshCw,
  Quote,
  LifeBuoy,
  MessageSquare,
  BookMarked,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Badge, Chip } from '../components/ui/Badge.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { ProgressRing } from '../components/ui/ProgressBar.jsx';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States.jsx';
import { useApi } from '../lib/useApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import { timeAgo } from '../lib/format.js';
import './Home.css';

/** Raccourcis vers les grands modules de la plateforme. */
function getQuickActions(t) {
  return [
    {
      to: '/app/chat',
      icon: MessageCircle,
      tone: 'primary',
      title: t('quickActions.chatTitle'),
      text: t('quickActions.chatText'),
    },
    {
      to: '/app/apprendre',
      icon: GraduationCap,
      tone: 'accent',
      title: t('quickActions.learnTitle'),
      text: t('quickActions.learnText'),
    },
    {
      to: '/app/communaute',
      icon: Users,
      tone: 'warm',
      title: t('quickActions.communityTitle'),
      text: t('quickActions.communityText'),
    },
    {
      to: '/app/expertes',
      icon: Stethoscope,
      tone: 'info',
      title: t('quickActions.expertsTitle'),
      text: t('quickActions.expertsText'),
    },
  ];
}

/** Petite tuile de statistique (points, série, rang…). */
function Stat({ icon: Icon, value, label, tone = 'primary' }) {
  return (
    <div className="home-page__stat">
      <span className={`home-page__stat-icon home-page__stat-icon--${tone}`} aria-hidden="true">
        <Icon size={18} />
      </span>
      <span className="home-page__stat-value">{value}</span>
      <span className="home-page__stat-label">{label}</span>
    </div>
  );
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { t, lang } = useLang();
  const quickActions = getQuickActions(t);

  // Données personnelles (uniquement si connecté).
  const { data: gamify } = useApi(isAuthenticated ? '/gamification/me' : null, { auth: true });

  // Données publiques du tableau de bord.
  const lessons = useApi('/learn/lessons');
  const campaigns = useApi('/campaigns');
  const myths = useApi('/chat/myths');
  const posts = useApi('/community/posts?sort=recent');

  // Index du mythe affiché (départ varié selon le jour).
  const dayIndex = Math.floor(Date.now() / 86400000);
  const [mythStep, setMythStep] = useState(0);

  const points = gamify?.points ?? user?.points ?? 0;
  const levelName = gamify?.levelName ?? user?.levelName ?? t('learn.levelBeginner');
  const level = gamify?.level ?? user?.level ?? 1;
  const progressPct = gamify?.progressPct ?? user?.progressPct ?? 0;
  const streak = gamify?.streak ?? user?.streak ?? 0;
  const rank = gamify?.rank;
  const lessonsCount = gamify?.completedLessonsCount ?? (user?.completedLessons?.length || 0);

  const campaign = (campaigns.data || []).find((c) => c.status === 'active') || (campaigns.data || [])[0];

  // Leçons à reprendre : celles non terminées en priorité.
  const completed = new Set(user?.completedLessons || []);
  const allLessons = lessons.data || [];
  const notDone = allLessons.filter((l) => !completed.has(l.id));
  const resumeList = (notDone.length ? notDone : allLessons).slice(0, 3);

  // Mythes : petit carrousel.
  const mythList = myths.data || [];
  const currentMyth = mythList.length ? mythList[(dayIndex + mythStep) % mythList.length] : null;

  const recentPosts = (posts.data || []).slice(0, 3);

  return (
    <div className="home-page">
      {/* ============================= En-tête ============================= */}
      {isAuthenticated ? (
        <Card tone="soft" padding="lg" className="home-page__level-card animate-up">
          <div className="home-page__level-ring">
            <ProgressRing value={progressPct} max={100} size={124} stroke={10}>
              <span className="home-page__ring-level">{t('learn.levelPrefix')}{level}</span>
              <span className="home-page__ring-name">{levelName}</span>
            </ProgressRing>
          </div>
          <div className="home-page__level-body">
            <p className="eyebrow">{t('home.dashboardEyebrow')}</p>
            <h1 className="home-page__hello">
              {t('home.hello')(user?.name)} <span aria-hidden="true">👋</span>
            </h1>
            <p className="home-page__level-text">
              {progressPct > 0 ? t('home.progressGood') : t('home.progressStart')}
            </p>
            <div className="home-page__stats">
              <Stat icon={Star} value={points} label={t('home.statPoints')} tone="primary" />
              <Stat icon={Flame} value={streak} label={t('home.statStreak')} tone="warm" />
              <Stat icon={Trophy} value={rank ? `#${rank}` : '—'} label={t('home.statRank')} tone="accent" />
              <Stat icon={BookOpen} value={lessonsCount} label={t('home.statLessons')} tone="info" />
            </div>
            <div className="home-page__level-actions">
              <Button to="/app/classement" variant="outline" size="sm" icon={Trophy}>
                {t('home.seeLeaderboard')}
              </Button>
              <Button to="/app/profil" variant="ghost" size="sm">
                {t('home.myProfile')}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card tone="soft" padding="lg" className="home-page__welcome animate-up">
          <Badge tone="primary" icon={Sparkles}>
            {t('home.welcomeBadge')}
          </Badge>
          <h1 className="home-page__welcome-title">
            {t('home.welcomeTitle1')}<span className="gradient-text">{t('home.welcomeTitle2')}</span>{t('home.welcomeTitle3')}
          </h1>
          <p className="lead">{t('home.welcomeLead')}</p>
          <div className="home-page__welcome-actions">
            <Button to="/inscription" size="lg" icon={ArrowRight}>
              {t('home.welcomeCreate')}
            </Button>
            <Button to="/app/chat" variant="outline" size="lg" icon={MessageCircle}>
              {t('home.welcomeAskAnon')}
            </Button>
          </div>
        </Card>
      )}

      {/* ============================ Actions rapides ============================ */}
      <section className="home-page__section">
        <SectionHeading eyebrow={t('home.quickEyebrow')} title={t('home.quickTitle')} as="h2" />
        <div className="grid grid-4 home-page__quick stagger">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.to} to={action.to} className="home-page__tile">
                <span className={`icon-tile home-page__tile-icon home-page__tile-icon--${action.tone}`} aria-hidden="true">
                  <Icon size={22} />
                </span>
                <strong className="home-page__tile-title">{action.title}</strong>
                <span className="home-page__tile-text">{action.text}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ====================== Reprendre l'apprentissage ====================== */}
      <section className="home-page__section">
        <SectionHeading
          eyebrow={t('home.learnEyebrow')}
          title={t('home.learnTitle')}
          description={isAuthenticated ? t('home.learnDescAuth') : t('home.learnDescAnon')}
          as="h2"
        />
        <div>
          {lessons.loading ? (
            <LoadingState label={t('home.loadingLessons')} />
          ) : lessons.error ? (
            <ErrorState error={lessons.error} onRetry={lessons.refetch} />
          ) : resumeList.length === 0 ? (
            <EmptyState
              icon={BookMarked}
              title={t('home.noLessonsTitle')}
              description={t('home.noLessonsDesc')}
            />
          ) : (
            <div className="grid grid-3 home-page__lessons">
              {resumeList.map((lesson) => (
                <Card key={lesson.id} interactive padding="md" as={Link} to={`/app/apprendre/${lesson.id}`}>
                  <div className="home-page__lesson-top">
                    <span className="home-page__lesson-emoji" aria-hidden="true">
                      {lesson.emoji}
                    </span>
                    <Badge tone="neutral" size="sm">
                      {lesson.category}
                    </Badge>
                  </div>
                  <h3 className="home-page__lesson-title">{lesson.title}</h3>
                  <p className="home-page__lesson-summary clamp-2">{lesson.summary}</p>
                  <div className="meta-row home-page__lesson-meta">
                    <span className="meta-item">
                      <Clock size={14} aria-hidden="true" /> {lesson.durationMin} {t('common.min')}
                    </span>
                    <span className="meta-item">
                      <Star size={14} aria-hidden="true" /> {lesson.points} pts
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================= Campagne du mois ========================= */}
      <section className="home-page__section">
        <SectionHeading eyebrow={t('home.campaignEyebrow')} title={t('home.campaignTitle')} as="h2" />
        <div>
          {campaigns.loading ? (
            <LoadingState label={t('home.loadingCampaign')} />
          ) : campaigns.error ? (
            <ErrorState error={campaigns.error} onRetry={campaigns.refetch} />
          ) : !campaign ? (
            <EmptyState
              icon={Megaphone}
              title={t('home.noCampaignTitle')}
              description={t('home.noCampaignDesc')}
            />
          ) : (
            <Card tone="accent" padding="lg" className="home-page__campaign">
              <div className="home-page__campaign-main">
                <span className="home-page__campaign-emoji" aria-hidden="true">
                  {campaign.emoji}
                </span>
                <div>
                  <Badge tone="accent" icon={Megaphone}>
                    {campaign.month} · {campaign.theme}
                  </Badge>
                  <h3 className="home-page__campaign-title">{campaign.title}</h3>
                  <p className="home-page__campaign-text">{campaign.description}</p>
                  {campaign.hashtags?.length ? (
                    <div className="tag-row home-page__campaign-tags">
                      {campaign.hashtags.map((tag) => (
                        <Chip key={tag} tone="accent">
                          {tag}
                        </Chip>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="home-page__campaign-side">
                <div className="home-page__campaign-count">
                  <strong>{campaign.participants}</strong>
                  <span>{t('home.participants')}</span>
                </div>
                <Button to={`/app/campagnes/${campaign.id}`} variant="accent" iconRight={ArrowRight}>
                  {t('home.seeCampaign')}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* ==================== Le mythe du jour + discussions ==================== */}
      <div className="home-page__split">
        {/* Mythe du jour */}
        <section className="home-page__section">
          <SectionHeading eyebrow={t('home.mythEyebrow')} title={t('home.mythTitle')} as="h2" />
          <div>
            {myths.loading ? (
              <LoadingState label={t('home.loadingMyths')} />
            ) : myths.error ? (
              <ErrorState error={myths.error} onRetry={myths.refetch} />
            ) : !currentMyth ? (
              <EmptyState icon={Sparkles} title={t('home.noMythTitle')} />
            ) : (
              <Card padding="lg" className="home-page__myth">
                <span className="home-page__myth-mark" aria-hidden="true">
                  <Quote size={26} />
                </span>
                <Badge tone="neutral" size="sm">
                  {currentMyth.category}
                </Badge>
                <p className="home-page__myth-statement">« {currentMyth.myth} »</p>
                <div className="home-page__myth-truth">
                  <strong>{t('home.mythTruth')}</strong>
                  <p>{currentMyth.truth}</p>
                </div>
                <div className="home-page__myth-footer">
                  <span className="text-subtle">{t('home.mythSource')(currentMyth.source)}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={RefreshCw}
                    onClick={() => setMythStep((s) => s + 1)}
                  >
                    {t('home.anotherMyth')}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* Dernières discussions */}
        <section className="home-page__section">
          <SectionHeading
            eyebrow={t('home.postsEyebrow')}
            title={t('home.postsTitle')}
            as="h2"
            className="home-page__posts-heading"
          />
          <div>
            {posts.loading ? (
              <LoadingState label={t('home.loadingPosts')} />
            ) : posts.error ? (
              <ErrorState error={posts.error} onRetry={posts.refetch} />
            ) : recentPosts.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title={t('home.noPostsTitle')}
                description={t('home.noPostsDesc')}
              />
            ) : (
              <ul className="home-page__posts">
                {recentPosts.map((post) => (
                  <li key={post.id}>
                    <Link to={`/app/communaute/${post.id}`} className="home-page__post">
                      <Avatar name={post.author?.name} avatar={post.author?.avatar} size="sm" />
                      <span className="home-page__post-body">
                        <strong className="clamp-1">{post.title}</strong>
                        <span className="home-page__post-meta">
                          {post.author?.name} · {timeAgo(post.createdAt, lang)} · {t('home.postReplies')(post.repliesCount)}
                        </span>
                      </span>
                      <ArrowRight size={18} aria-hidden="true" className="home-page__post-arrow" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="home-page__posts-more">
              <Button to="/app/communaute" variant="ghost" size="sm" iconRight={ArrowRight}>
                {t('home.seeAllPosts')}
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* ============================ Bloc d'aide ============================ */}
      <section className="home-page__section" aria-labelledby="home-help-title">
        <Card tone="warm" padding="lg" className="home-page__help">
          <span className="icon-tile icon-tile--warm" aria-hidden="true">
            <LifeBuoy size={22} />
          </span>
          <div className="home-page__help-text">
            <h2 className="home-page__help-title" id="home-help-title">
              {t('home.helpTitle')}
            </h2>
            <p>{t('home.helpText')}</p>
          </div>
          <Button to="/app/ressources" variant="warm" iconRight={ArrowRight}>
            {t('home.helpCta')}
          </Button>
        </Card>
      </section>
    </div>
  );
}
