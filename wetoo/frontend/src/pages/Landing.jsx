import { useEffect, useRef, useState } from 'react';
import {
  MessageCircle,
  GraduationCap,
  Users,
  Megaphone,
  WifiOff,
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  Smartphone,
  Globe,
  ArrowRight,
  CheckCircle2,
  Quote,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Lock,
  Eye,
  Trophy,
  Stethoscope,
  MessageSquareText,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Badge, Chip } from '../components/ui/Badge.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { Card } from '../components/ui/Card.jsx';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { Skeleton } from '../components/ui/States.jsx';
import { useApi } from '../lib/useApi.js';
import { useLang } from '../context/LangContext.jsx';
import './Landing.css';

const HERO_IMG =
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=' +
  encodeURIComponent(
    'Group of smiling young West African teenagers and young adults talking together in a bright school courtyard, warm natural light, candid documentary photography, hopeful, inclusive, vibrant purple and teal color accents'
  ) +
  '&image_size=landscape_16_9';

const COMMUNITY_IMG =
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=' +
  encodeURIComponent(
    'Young West African woman sitting with a smartphone at dusk looking relieved and hopeful after finding help online, soft purple and teal cinematic lighting, respectful and empowering portrait'
  ) +
  '&image_size=portrait_4_3';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

/* --------------------------- Carrousel de témoignages --------------------------- */
function Testimonials() {
  const { t } = useLang();
  const { data, loading } = useApi('/stats', { auth: false, cache: true });
  const testimonials = data?.testimonials || [];
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reducedMotion = usePrefersReducedMotion();
  const hovering = useRef(false);

  const count = testimonials.length;

  useEffect(() => {
    if (!playing || reducedMotion || count < 2) return undefined;
    const id = setInterval(() => {
      if (!hovering.current) setIndex((i) => (i + 1) % count);
    }, 7000);
    return () => clearInterval(id);
  }, [playing, reducedMotion, count]);

  const go = (dir) => setIndex((i) => (i + dir + count) % count);

  if (loading) {
    return (
      <div className="testimonial testimonial--skeleton">
        <Skeleton width={56} height={56} radius={999} />
        <Skeleton width="80%" height={16} />
        <Skeleton width="60%" height={16} />
      </div>
    );
  }

  if (!count) return null;
  const current = testimonials[index];

  return (
    <div
      className="testimonial-carousel"
      onMouseEnter={() => { hovering.current = true; }}
      onMouseLeave={() => { hovering.current = false; }}
      onFocus={() => { hovering.current = true; }}
      onBlur={() => { hovering.current = false; }}
    >
      <figure className="testimonial" aria-live="polite">
        <Quote size={30} aria-hidden="true" className="testimonial__mark" />
        <blockquote className="testimonial__quote">« {current.quote} »</blockquote>
        <figcaption className="testimonial__author">
          <Avatar name={current.name} avatar={current.avatar} size="md" />
          <span>
            <strong>{current.name}</strong>
            <span className="testimonial__role">
              {current.role}
              {current.age ? ` · ${t('landing.testimonialAge')(current.age)}` : ''}
            </span>
          </span>
        </figcaption>
      </figure>

      <div className="testimonial__controls">
        <div className="testimonial__nav">
          <button type="button" className="testimonial__btn" onClick={() => go(-1)} aria-label={t('landing.testimonialPrev')}>
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="testimonial__btn"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? t('landing.testimonialPause') : t('landing.testimonialPlay')}
          >
            {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          </button>
          <button type="button" className="testimonial__btn" onClick={() => go(1)} aria-label={t('landing.testimonialNext')}>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="testimonial__position" aria-live="polite">
          {t('landing.testimonialPos')(index + 1, count)}
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */
export default function Landing() {
  const { t } = useLang();
  const { data: stats } = useApi('/stats', { auth: false, cache: true });

  const fallback = t('landing.statsFallback');

  const PROBLEMS = [
    {
      icon: MessageSquareText,
      tone: 'warm',
      title: t('landing.problem1Title'),
      text:  t('landing.problem1Text'),
    },
    {
      icon: Eye,
      tone: 'warning',
      title: t('landing.problem2Title'),
      text:  t('landing.problem2Text'),
    },
    {
      icon: Smartphone,
      tone: 'info',
      title: t('landing.problem3Title'),
      text:  t('landing.problem3Text'),
    },
    {
      icon: HeartHandshake,
      tone: 'danger',
      title: t('landing.problem4Title'),
      text:  t('landing.problem4Text'),
    },
  ];

  const TRUST = [
    {
      icon: ShieldCheck,
      title: t('landing.trust1Title'),
      text:  t('landing.trust1Text'),
    },
    {
      icon: Lock,
      title: t('landing.trust2Title'),
      text:  t('landing.trust2Text'),
    },
    {
      icon: WifiOff,
      title: t('landing.trust3Title'),
      text:  t('landing.trust3Text'),
    },
    {
      icon: Globe,
      title: t('landing.trust4Title'),
      text:  t('landing.trust4Text'),
    },
  ];

  const PLAN = [
    {
      title: t('landing.plan1Title'),
      text:  t('landing.plan1Text'),
    },
    {
      title: t('landing.plan2Title'),
      text:  t('landing.plan2Text'),
    },
    {
      title: t('landing.plan3Title'),
      text:  t('landing.plan3Text'),
    },
    {
      title: t('landing.plan4Title'),
      text:  t('landing.plan4Text'),
    },
  ];

  const PILLARS = [
    {
      id: 'chatbot',
      icon: MessageCircle,
      emoji: '💬',
      tone: 'purple',
      title:       t('landing.pillarChatbotTitle'),
      tagline:     t('landing.pillarChatbotTagline'),
      description: t('landing.pillarChatbotDesc'),
      bullets: [
        t('landing.pillarChatbotBullet1'),
        t('landing.pillarChatbotBullet2'),
        t('landing.pillarChatbotBullet3'),
      ],
      outro: t('landing.pillarChatbotOutro'),
    },
    {
      id: 'apprendre',
      icon: GraduationCap,
      emoji: '🎮',
      tone: 'accent',
      title:       t('landing.pillarLearnTitle'),
      tagline:     t('landing.pillarLearnTagline'),
      description: t('landing.pillarLearnDesc'),
      bullets: [
        t('landing.pillarLearnBullet1'),
        t('landing.pillarLearnBullet2'),
        t('landing.pillarLearnBullet3'),
      ],
      outro: t('landing.pillarLearnOutro'),
    },
    {
      id: 'communaute',
      icon: Users,
      emoji: '🤝',
      tone: 'warm',
      title:       t('landing.pillarCommunityTitle'),
      tagline:     t('landing.pillarCommunityTagline'),
      description: t('landing.pillarCommunityDesc'),
      bullets: [
        t('landing.pillarCommunityBullet1'),
        t('landing.pillarCommunityBullet2'),
        t('landing.pillarCommunityBullet3'),
      ],
      outro: t('landing.pillarCommunityOutro'),
    },
    {
      id: 'campagnes',
      icon: Megaphone,
      emoji: '📣',
      tone: 'info',
      title:       t('landing.pillarCampaignsTitle'),
      tagline:     t('landing.pillarCampaignsTagline'),
      description: t('landing.pillarCampaignsDesc'),
      bullets: [
        t('landing.pillarCampaignsBullet1'),
        t('landing.pillarCampaignsBullet2'),
        t('landing.pillarCampaignsBullet3'),
      ],
      outro: t('landing.pillarCampaignsOutro'),
    },
  ];

  const numbers = [
    { value: stats?.users ?? fallback, label: t('landing.statsUsers') },
    { value: stats?.lessonsCompleted ?? fallback, label: t('landing.statsLessons') },
    { value: stats?.questionsAnswered ?? fallback, label: t('landing.statsQuestions') },
    { value: stats?.mythsBusted ?? fallback, label: t('landing.statsMyths') },
  ];

  return (
    <div className="landing">
      {/* ------------------------------ Hero ------------------------------ */}
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__text stagger">
            <Badge tone="primary" icon={Sparkles}>
              {t('landing.badge')}
            </Badge>
            <h1 className="hero__title">
              {t('landing.heroTitle1')}
              <br />
              <span className="gradient-text">{t('landing.heroTitle2')}</span>
            </h1>
            <p className="hero__lead">{t('landing.heroLead')}</p>

            <div className="hero__cta">
              <Button to="/app" size="lg" icon={ArrowRight}>
                {t('landing.ctaOpen')}
              </Button>
              <Button href="#piliers" variant="outline" size="lg">
                {t('landing.ctaPillars')}
              </Button>
            </div>

            <ul className="hero__chips">
              <li>
                <Chip icon={CheckCircle2}>{t('landing.chipFree')}</Chip>
              </li>
              <li>
                <Chip icon={Lock}>{t('landing.chipAnon')}</Chip>
              </li>
              <li>
                <Chip icon={WifiOff}>{t('landing.chipOffline')}</Chip>
              </li>
              <li>
                <Chip icon={Users}>{t('landing.chipInclusive')}</Chip>
              </li>
            </ul>
          </div>

          {/* Aperçu produit */}
          <div className="hero__visual animate-up">
            <div className="chat-preview" aria-hidden="true">
              <div className="chat-preview__header">
                <span className="chat-preview__dot" />
                <span className="chat-preview__title">{t('landing.chatPreviewTitle')}</span>
              </div>
              <div className="chat-preview__thread">
                <p className="bubble bubble--user">{t('landing.chatBubbleUser1')}</p>
                <p className="bubble bubble--bot">
                  {t('landing.chatBubbleBotPre')} <strong>{t('landing.chatBubbleBotStrong')}</strong>
                  {t('landing.chatBubbleBotPost')}
                </p>
                <p className="bubble bubble--user">{t('landing.chatBubbleUser2')}</p>
                <p className="bubble bubble--bot bubble--typing">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </p>
              </div>
              <div className="chat-preview__chips">
                <span className="mini-chip">{t('landing.chatChip1')}</span>
                <span className="mini-chip">{t('landing.chatChip2')}</span>
              </div>
            </div>

            <div className="float-card float-card--myth animate-float">
              <Sparkles size={18} aria-hidden="true" />
              <div>
                <strong>{t('landing.floatMythTitle')}</strong>
                <span>{t('landing.floatMythText')}</span>
              </div>
            </div>

            <div className="float-card float-card--badge animate-float">
              <Trophy size={18} aria-hidden="true" />
              <div>
                <strong>{t('landing.floatBadgeTitle')}</strong>
                <span>{t('landing.floatBadgeText')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container stats-strip">
          {numbers.map((n) => (
            <div key={n.label} className="stats-strip__item">
              <span className="stats-strip__value">{n.value}</span>
              <span className="stats-strip__label">{n.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------- Le problème ---------------------------- */}
      <section id="probleme" className="section">
        <div className="container">
          <SectionHeading
            eyebrow={t('landing.problemEyebrow')}
            title={t('landing.problemTitle')}
            description={t('landing.problemDesc')}
          />
          <div className="grid grid-4 problem-grid stagger">
            {PROBLEMS.map((p) => {
              const Icon = p.icon;
              return (
                <Card key={p.title} tone="default" padding="md" className="problem-card">
                  <span className={`icon-tile icon-tile--${p.tone}`} aria-hidden="true">
                    <Icon size={22} />
                  </span>
                  <h3 className="problem-card__title">{p.title}</h3>
                  <p className="problem-card__text">{p.text}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------- La solution ---------------------------- */}
      <section id="solution" className="section section--alt">
        <div className="container solution__grid">
          <div className="solution__media">
            <img
              src={HERO_IMG}
              alt={t('landing.solutionImgAlt')}
              className="solution__img"
              width="1280"
              height="720"
              loading="lazy"
            />
            <div className="solution__media-badge">
              <Stethoscope size={18} aria-hidden="true" />
              <span>{t('landing.solutionBadge')}</span>
            </div>
          </div>
          <div className="solution__text">
            <SectionHeading
              eyebrow={t('landing.solutionEyebrow')}
              title={t('landing.solutionTitle')}
              description={t('landing.solutionDesc')}
            />
            <ul className="check-list">
              <li>
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>
                  <strong>{t('landing.solutionCheck1')}</strong>{t('landing.solutionCheck1Rest')}
                </span>
              </li>
              <li>
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>
                  <strong>{t('landing.solutionCheck2')}</strong>{t('landing.solutionCheck2Rest')}
                </span>
              </li>
              <li>
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>
                  <strong>{t('landing.solutionCheck3')}</strong>{t('landing.solutionCheck3Rest')}
                </span>
              </li>
            </ul>
            <Button to="/app/chat" icon={MessageCircle}>
              {t('landing.solutionCta')}
            </Button>
          </div>
        </div>
      </section>

      {/* ---------------------------- Les 4 piliers ---------------------------- */}
      <section id="piliers" className="section">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow={t('landing.pillarsEyebrow')}
            title={t('landing.pillarsTitle')}
            description={t('landing.pillarsDesc')}
          />

          <div className="pillars">
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <article key={pillar.id} className={`pillar ${i % 2 === 1 ? 'pillar--reverse' : ''}`}>
                  <div className="pillar__content">
                    <span className={`pillar__num pillar__num--${pillar.tone}`} aria-hidden="true">
                      <Icon size={24} />
                    </span>
                    <h3 className="pillar__title">{pillar.title}</h3>
                    <p className="pillar__tagline">{pillar.tagline}</p>
                    <p className="pillar__description">{pillar.description}</p>
                    <ul className="pillar__bullets">
                      {pillar.bullets.map((b) => (
                        <li key={b}>
                          <CheckCircle2 size={16} aria-hidden="true" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="pillar__outro">{pillar.outro}</p>
                  </div>
                  <div className="pillar__visual" aria-hidden="true">
                    <span className="pillar__emoji">{pillar.emoji}</span>
                    <span className="pillar__pattern" />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------ Impact ------------------------------ */}
      <section id="impact" className="section section--alt">
        <div className="container impact__grid">
          <div className="impact__intro">
            <SectionHeading
              eyebrow={t('landing.impactEyebrow')}
              title={t('landing.impactTitle')}
              description={t('landing.impactDesc')}
            />
            <div className="impact__points">
              <div>
                <strong>{t('landing.impactPoint1Q')}</strong>
                <span>{t('landing.impactPoint1A')}</span>
              </div>
              <div>
                <strong>{t('landing.impactPoint2Q')}</strong>
                <span>{t('landing.impactPoint2A')}</span>
              </div>
              <div>
                <strong>{t('landing.impactPoint3Q')}</strong>
                <span>{t('landing.impactPoint3A')}</span>
              </div>
            </div>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* -------------------------- Confiance & accès -------------------------- */}
      <section className="section">
        <div className="container trust__grid">
          <div className="trust__media">
            <img
              src={COMMUNITY_IMG}
              alt={t('landing.trustImgAlt')}
              className="trust__img"
              width="800"
              height="1067"
              loading="lazy"
            />
          </div>
          <div>
            <SectionHeading
              eyebrow={t('landing.trustEyebrow')}
              title={t('landing.trustTitle')}
              description={t('landing.trustDesc')}
            />
            <div className="trust__list">
              {TRUST.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="trust__item">
                    <span className="icon-tile icon-tile--accent" aria-hidden="true">
                      <Icon size={20} />
                    </span>
                    <div>
                      <h3 className="trust__item-title">{item.title}</h3>
                      <p className="trust__item-text">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------- Le plan ------------------------------- */}
      <section className="section section--alt">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow={t('landing.grantEyebrow')}
            title={t('landing.grantTitle')}
            description={t('landing.grantDesc')}
          />
          <div className="plan-grid stagger">
            {PLAN.map((step, i) => (
              <div key={step.title} className="plan-step">
                <span className="plan-step__num" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="plan-step__title">{step.title}</h3>
                <p className="plan-step__text">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- CTA -------------------------------- */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-final">
            <h2 className="cta-final__title">{t('landing.ctaFinalTitle')}</h2>
            <p className="cta-final__text">{t('landing.ctaFinalText')}</p>
            <div className="cta-final__actions">
              <Button to="/app" size="lg" variant="warm" icon={ArrowRight}>
                {t('landing.ctaFinalJoin')}
              </Button>
              <Button to="/app/ressources" size="lg" variant="outline">
                {t('landing.ctaFinalHelp')}
              </Button>
            </div>
            <p className="cta-final__note">{t('landing.ctaFinalNote')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
