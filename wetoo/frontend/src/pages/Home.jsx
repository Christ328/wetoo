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
import { timeAgo } from '../lib/format.js';
import './Home.css';

/** Raccourcis vers les grands modules de la plateforme. */
const QUICK_ACTIONS = [
  {
    to: '/app/chat',
    icon: MessageCircle,
    tone: 'primary',
    title: 'Poser une question',
    text: 'Le chatbot répond 24 h/24, en anonyme.',
  },
  {
    to: '/app/apprendre',
    icon: GraduationCap,
    tone: 'accent',
    title: 'Apprendre',
    text: 'Des cours courts et des quiz pour progresser.',
  },
  {
    to: '/app/communaute',
    icon: Users,
    tone: 'warm',
    title: 'Communauté',
    text: 'Le forum bienveillant et modéré des jeunes.',
  },
  {
    to: '/app/expertes',
    icon: Stethoscope,
    tone: 'info',
    title: 'Professionnel·les',
    text: 'Sage-femme, psy, infirmier·e : en toute confiance.',
  },
];

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

  // Données personnelles (uniquement si connecté).
  const { data: gamify } = useApi(isAuthenticated ? '/gamification/me' : null, { auth: true });

  // Données publiques du tableau de bord.
  const lessons = useApi('/learn/lessons', { auth: false, cache: true });
  const campaigns = useApi('/campaigns', { auth: false, cache: true });
  const myths = useApi('/chat/myths', { auth: false, cache: true });
  const posts = useApi('/community/posts?sort=recent', { auth: false, cache: true });

  // Index du mythe affiché (départ varié selon le jour).
  const dayIndex = Math.floor(Date.now() / 86400000);
  const [mythStep, setMythStep] = useState(0);

  const points = gamify?.points ?? user?.points ?? 0;
  const levelName = gamify?.levelName ?? user?.levelName ?? 'Débutant·e';
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
              <span className="home-page__ring-level">Niv. {level}</span>
              <span className="home-page__ring-name">{levelName}</span>
            </ProgressRing>
          </div>
          <div className="home-page__level-body">
            <p className="eyebrow">Ton tableau de bord</p>
            <h1 className="home-page__hello">
              Bonjour {user?.name} <span aria-hidden="true">👋</span>
            </h1>
            <p className="home-page__level-text">
              {progressPct > 0
                ? `Tu progresses bien : encore un effort pour atteindre le niveau suivant !`
                : `Commence une leçon pour gagner tes premiers points et débloquer des badges.`}
            </p>
            <div className="home-page__stats">
              <Stat icon={Star} value={points} label="points" tone="primary" />
              <Stat icon={Flame} value={streak} label="jours de série" tone="warm" />
              <Stat icon={Trophy} value={rank ? `#${rank}` : '—'} label="au classement" tone="accent" />
              <Stat icon={BookOpen} value={lessonsCount} label="cours terminés" tone="info" />
            </div>
            <div className="home-page__level-actions">
              <Button to="/app/classement" variant="outline" size="sm" icon={Trophy}>
                Voir le classement
              </Button>
              <Button to="/app/profil" variant="ghost" size="sm">
                Mon profil
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card tone="soft" padding="lg" className="home-page__welcome animate-up">
          <Badge tone="primary" icon={Sparkles}>
            Bienvenue sur WeToo
          </Badge>
          <h1 className="home-page__welcome-title">
            Un espace sûr pour parler de <span className="gradient-text">santé et de bien-être</span>.
          </h1>
          <p className="lead">
            Pose tes questions sans tabou, apprends à ton rythme et échange avec d'autres jeunes - en
            anonyme si tu le souhaites.
          </p>
          <div className="home-page__welcome-actions">
            <Button to="/inscription" size="lg" icon={ArrowRight}>
              Créer un compte
            </Button>
            <Button to="/app/chat" variant="outline" size="lg" icon={MessageCircle}>
              Poser une question anonymement
            </Button>
          </div>
        </Card>
      )}

      {/* ============================ Actions rapides ============================ */}
      <section className="home-page__section">
        <SectionHeading eyebrow="Actions rapides" title="Par où veux-tu commencer ?" as="h2" />
        <div className="grid grid-4 home-page__quick stagger">
          {QUICK_ACTIONS.map((action) => {
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
          eyebrow="Apprentissage"
          title="Reprendre l'apprentissage"
          description={isAuthenticated ? 'Reprends là où tu t’es arrêté·e.' : 'Quelques cours pour découvrir.'}
          as="h2"
        />
        <div>
          {lessons.loading ? (
            <LoadingState label="Chargement des cours…" />
          ) : lessons.error ? (
            <ErrorState error={lessons.error} onRetry={lessons.refetch} />
          ) : resumeList.length === 0 ? (
            <EmptyState
              icon={BookMarked}
              title="Aucun cours disponible"
              description="Reviens bientôt, de nouveaux contenus arrivent."
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
                      <Clock size={14} aria-hidden="true" /> {lesson.durationMin} min
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
        <SectionHeading eyebrow="Engagement" title="La campagne du mois" as="h2" />
        <div>
          {campaigns.loading ? (
            <LoadingState label="Chargement de la campagne…" />
          ) : campaigns.error ? (
            <ErrorState error={campaigns.error} onRetry={campaigns.refetch} />
          ) : !campaign ? (
            <EmptyState
              icon={Megaphone}
              title="Pas de campagne en cours"
              description="Une nouvelle campagne thématique arrive chaque mois."
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
                  <span>participant·es</span>
                </div>
                <Button to={`/app/campagnes/${campaign.id}`} variant="accent" iconRight={ArrowRight}>
                  Voir la campagne
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
          <SectionHeading eyebrow="Vraies infos" title="Le mythe du jour" as="h2" />
          <div>
            {myths.loading ? (
              <LoadingState label="Chargement des mythes…" />
            ) : myths.error ? (
              <ErrorState error={myths.error} onRetry={myths.refetch} />
            ) : !currentMyth ? (
              <EmptyState icon={Sparkles} title="Aucun mythe pour l'instant" />
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
                  <strong>La vérité</strong>
                  <p>{currentMyth.truth}</p>
                </div>
                <div className="home-page__myth-footer">
                  <span className="text-subtle">Source : {currentMyth.source}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={RefreshCw}
                    onClick={() => setMythStep((s) => s + 1)}
                  >
                    Un autre mythe
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </section>

        {/* Dernières discussions */}
        <section className="home-page__section">
          <SectionHeading
            eyebrow="Communauté"
            title="Dernières discussions"
            as="h2"
            className="home-page__posts-heading"
          />
          <div>
            {posts.loading ? (
              <LoadingState label="Chargement des discussions…" />
            ) : posts.error ? (
              <ErrorState error={posts.error} onRetry={posts.refetch} />
            ) : recentPosts.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="Pas encore de discussion"
                description="Sois la première personne à lancer un sujet."
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
                          {post.author?.name} · {timeAgo(post.createdAt)} · {post.repliesCount} réponse
                          {post.repliesCount > 1 ? 's' : ''}
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
                Voir toutes les discussions
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
              Tu ne vas pas bien ?
            </h2>
            <p>Parle à quelqu'un maintenant : lignes d'écoute, contacts d'urgence et ressources fiables.</p>
          </div>
          <Button to="/app/ressources" variant="warm" iconRight={ArrowRight}>
            Trouver de l'aide
          </Button>
        </Card>
      </section>
    </div>
  );
}
