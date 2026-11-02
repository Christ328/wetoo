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
      title: t('landing.problemEyebrow') === 'The problem'
        ? 'The taboo and silence'
        : 'Le tabou et le silence',
      text: t('landing.problemEyebrow') === 'The problem'
        ? "At home, nobody talks about it. At school, no structured programme. Teenagers grow up alone with their questions."
        : "À la maison, on n'en parle pas. À l'école, pas de programme structuré. Les adolescents grandissent seuls avec leurs questions.",
    },
    {
      icon: Eye,
      tone: 'warning',
      title: t('landing.problemEyebrow') === 'The problem'
        ? 'Misinformation'
        : 'Les fausses informations',
      text: t('landing.problemEyebrow') === 'The problem'
        ? "Myths, prejudices and fake news spread faster than facts. \"The pill causes infertility\", \"you can't get pregnant the first time\"..."
        : "Mythes, préjugés et « fake news » circulent plus vite que les faits. « La pilule rend stérile », « on ne tombe pas enceinte la première fois »...",
    },
    {
      icon: Smartphone,
      tone: 'info',
      title: t('landing.problemEyebrow') === 'The problem'
        ? 'Inadequate tools'
        : 'Des outils inadaptés',
      text: t('landing.problemEyebrow') === 'The problem'
        ? "The few digital spaces available are often aimed at girls, too text-heavy, and require a costly connection."
        : "Les rares espaces numériques sont souvent réservés aux filles, trop centrés sur le texte, et exigent une connexion coûteuse.",
    },
    {
      icon: HeartHandshake,
      tone: 'danger',
      title: t('landing.problemEyebrow') === 'The problem'
        ? 'Loneliness and distress'
        : 'La solitude et la détresse',
      text: t('landing.problemEyebrow') === 'The problem'
        ? "Early pregnancies, STIs, anxiety, depression. Without a safe space, shame and stigma set in and cut young people off from any help."
        : "Grossesses précoces, IST, anxiété, dépression. Sans espace sûr, la honte et la stigmatisation s'installent et coupent les jeunes de toute aide.",
    },
  ];

  const TRUST = [
    {
      icon: ShieldCheck,
      title: t('landing.problemEyebrow') === 'The problem'
        ? 'Privacy first'
        : 'Confidentialité d\'abord',
      text: t('landing.problemEyebrow') === 'The problem'
        ? 'Anonymity available everywhere, minimal data, no resale of information. You decide what you share.'
        : 'Anonymat possible partout, données minimisées, aucune revente d\'information. Tu décides de ce que tu partages.',
    },
    {
      icon: Lock,
      title: t('landing.problemEyebrow') === 'The problem'
        ? 'Moderation and safety'
        : 'Modération et sécurité',
      text: t('landing.problemEyebrow') === 'The problem'
        ? 'A trained team moderates exchanges, detects at-risk situations and directs towards real help.'
        : 'Une équipe formée modère les échanges, détecte les situations à risque et oriente vers de l\'aide réelle.',
    },
    {
      icon: WifiOff,
      title: t('landing.problemEyebrow') === 'The problem'
        ? 'Designed for low connectivity'
        : 'Pensé pour la faible connexion',
      text: t('landing.problemEyebrow') === 'The problem'
        ? 'Lightweight, data-efficient web app, usable even with a small data plan. Full offline mode, SMS and USSD are upcoming features.'
        : 'Application web légère et économe en données, utilisable même avec un petit forfait. Le mode hors ligne complet, le SMS et l\'USSD sont des perspectives que nous voulons développer pour les zones sans internet.',
    },
    {
      icon: Globe,
      title: t('landing.problemEyebrow') === 'The problem'
        ? 'Inclusive by design'
        : 'Inclusif par construction',
      text: t('landing.problemEyebrow') === 'The problem'
        ? 'Girls and boys, in and out of school, French speakers and local language speakers. Nobody is left behind.'
        : 'Filles et garçons, scolarisés et non scolarisés, francophones et locuteurs de langues locales. Personne n\'est laissé de côté.',
    },
  ];

  const PLAN = [
    {
      title: t('landing.problemEyebrow') === 'The problem'
        ? 'Finalise the product'
        : 'Finaliser le produit',
      text: t('landing.problemEyebrow') === 'The problem'
        ? 'Stabilise the chatbot, lessons and forum, then make offline mode - currently just a vision - a reality on low-end Android devices.'
        : 'Stabiliser le chatbot, les cours et le forum, puis faire du mode hors ligne - aujourd\'hui encore une perspective - une réalité sur Android bas de gamme.',
    },
    {
      title: t('landing.problemEyebrow') === 'The problem'
        ? 'Train and equip the team'
        : 'Former et outiller l\'équipe',
      text: t('landing.problemEyebrow') === 'The problem'
        ? 'Train 6 young moderators and 4 young content creators in sexual health and psychological first aid.'
        : 'Former 6 jeunes modérateurs et 4 jeunes créateurs de contenu à la santé sexuelle et aux premiers secours psychologiques.',
    },
    {
      title: t('landing.problemEyebrow') === 'The problem'
        ? 'Deploy in 3 cities'
        : 'Déployer dans 3 villes',
      text: t('landing.problemEyebrow') === 'The problem'
        ? 'Pilot the platform in Cotonou, Parakou and Porto-Novo with youth clubs, health centres and local radio stations.'
        : 'Piloter la plateforme à Cotonou, Parakou et Porto-Novo avec des clubs jeunes, des centres de santé et des radios locales.',
    },
    {
      title: t('landing.problemEyebrow') === 'The problem'
        ? 'Measure and share'
        : 'Mesurer et partager',
      text: t('landing.problemEyebrow') === 'The problem'
        ? 'Track usage, measure knowledge changes and publish an open report so other countries can replicate the model.'
        : 'Suivre l\'usage, mesurer les changements de connaissances et publier un rapport ouvert pour que d\'autres pays puissent répliquer.',
    },
  ];

  const PILLARS = [
    {
      id: 'chatbot',
      icon: MessageCircle,
      emoji: '💬',
      tone: 'purple',
      title: t('landing.problemEyebrow') === 'The problem'
        ? '1. The chatbot that busts misinformation'
        : '1. Le chatbot qui démonte les fausses infos',
      tagline: t('landing.problemEyebrow') === 'The problem'
        ? 'A first point of contact, 24/7, without judgment'
        : 'Une première écoute, 24 h/24, sans jugement',
      description: t('landing.problemEyebrow') === 'The problem'
        ? "A conversational assistant trained to answer the questions young people dare not ask anyone. It demystifies the most common rumours and always links sexual health to mental well-being."
        : "Un assistant conversationnel entraîné pour répondre aux questions que les jeunes n'osent poser à personne. Il démystifie les rumeurs les plus répandues et relie toujours la santé sexuelle au bien-être mental.",
      bullets: t('landing.problemEyebrow') === 'The problem'
        ? [
            'Simple answers, in French and local languages',
            'Detection of distress situations and immediate referral to help',
            'Knows how to say "I don\'t know" and refers to a professional',
          ]
        : [
            'Réponses simples, en français et en langues locales',
            'Détection des situations de détresse et orientation immédiate vers de l\'aide',
            'Sait dire « je ne sais pas » et transfère à un professionnel',
          ],
      outro: t('landing.problemEyebrow') === 'The problem'
        ? 'Example: "Fear of an unwanted pregnancy causes anxiety. Here\'s how to talk about it."'
        : 'Exemple : « La peur d\'une grossesse non désirée provoque de l\'anxiété. Voici comment en parler. »',
    },
    {
      id: 'apprendre',
      icon: GraduationCap,
      emoji: '🎮',
      tone: 'accent',
      title: t('landing.problemEyebrow') === 'The problem'
        ? '2. The gamified learning space'
        : '2. L\'espace d\'apprentissage gamifié',
      tagline: t('landing.problemEyebrow') === 'The problem'
        ? 'Learn like you play'
        : 'Apprendre comme on joue',
      description: t('landing.problemEyebrow') === 'The problem'
        ? "Short mini-courses, quizzes, badges and a leaderboard. Learning becomes a rewarding experience, even for young people no longer in school - with digital certificates at the end."
        : "Des mini-cours courts, des quiz, des badges et un classement. L'apprentissage devient une expérience valorisante, y compris pour les jeunes qui ne sont plus à l'école - avec des certificats numériques à la clé.",
      bullets: t('landing.problemEyebrow') === 'The problem'
        ? [
            '3 to 7 minute courses, readable even on a small data plan',
            'Points, badges and leaderboard to stay motivated',
            'Digital certificate at the end of each course',
          ]
        : [
            'Cours de 3 à 7 minutes, lisibles même sur un petit forfait',
            'Points, badges et classement pour garder la motivation',
            'Certificat numérique à la fin de chaque parcours',
          ],
      outro: t('landing.problemEyebrow') === 'The problem'
        ? 'Result: young people who come back, finish and share what they\'ve learned.'
        : 'Résultat : des jeunes qui reviennent, terminent et repartagent ce qu\'ils ont appris.',
    },
    {
      id: 'communaute',
      icon: Users,
      emoji: '🤝',
      tone: 'warm',
      title: t('landing.problemEyebrow') === 'The problem'
        ? '3. The community and peer support space'
        : '3. L\'espace communautaire et d\'écoute',
      tagline: t('landing.problemEyebrow') === 'The problem'
        ? 'Breaking isolation, together'
        : 'Briser l\'isolement, ensemble',
      description: t('landing.problemEyebrow') === 'The problem'
        ? "A moderated forum where you can share anonymously, share your experience and find support. And above all: privately contact a midwife, psychologist or nurse without going to a health centre."
        : "Un forum modéré où l'on peut se confier en anonyme, partager son expérience et trouver du soutien. Et surtout : contacter en privé une sage-femme, une psychologue ou un infirmier sans se déplacer au centre de santé.",
      bullets: t('landing.problemEyebrow') === 'The problem'
        ? [
            'Anonymous questions and stable pseudonyms',
            'Human moderation + one-click reporting',
            'Confidential connection with health professionals',
          ]
        : [
            'Questions anonymes et pseudonymes stables',
            'Modération humaine formée + signalement en un clic',
            'Mise en relation confidentielle avec des professionnels de santé',
          ],
      outro: t('landing.problemEyebrow') === 'The problem'
        ? '"I\'m no longer alone facing my doubts."'
        : '« Je ne suis plus seul·e face à mes doutes. »',
    },
    {
      id: 'campagnes',
      icon: Megaphone,
      emoji: '📣',
      tone: 'info',
      title: t('landing.problemEyebrow') === 'The problem'
        ? '4. Community engagement, beyond the screen'
        : '4. L\'engagement communautaire, hors de l\'écran',
      tagline: t('landing.problemEyebrow') === 'The problem'
        ? 'A continuous presence in real life'
        : 'Une présence continue dans la vraie vie',
      description: t('landing.problemEyebrow') === 'The problem'
        ? "A WhatsApp group animated daily with partner professionals, and a monthly thematic awareness campaign: contraception, mental health, screening, consent... relayed on radio and social media."
        : "Un groupe WhatsApp animé chaque jour avec des professionnels partenaires, et une campagne de sensibilisation thématique chaque mois : contraception, santé mentale, dépistage, consentement... relayée à la radio et sur les réseaux sociaux.",
      bullets: t('landing.problemEyebrow') === 'The problem'
        ? [
            'WhatsApp peer support group animated daily',
            'One national campaign per month with young leaders',
            'Radio relay and posters in schools and health centres',
          ]
        : [
            'Groupe WhatsApp d\'entraide animé quotidiennement',
            'Une campagne nationale chaque mois avec les jeunes leaders',
            'Relais radio et affiches dans les lycées et centres de santé',
          ],
      outro: t('landing.problemEyebrow') === 'The problem'
        ? 'We talk to young people where they already live.'
        : 'Nous parlons aux jeunes là où ils vivent déjà.',
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
