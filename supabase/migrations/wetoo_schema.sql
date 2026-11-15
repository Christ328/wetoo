-- =============================================================================
-- WeToo — Schéma de base de données pour Supabase (PostgreSQL)
-- Plateforme communautaire de santé sexuelle et de bien-être pour les jeunes
-- YTH Live Global Innovation Challenge 2026
--
-- À exécuter dans Supabase : Dashboard → SQL Editor → New query → Coller → Run
--
-- Conventions
--   * Identifiants : `text` (ex. 'u-awa', 'l-consentement' ou des UUID).
--   * Colonnes en snake_case ; le backend Express utilise camelCase.
--   * Structures imbriquées en `jsonb`.
--   * RLS activée sur toutes les tables — seul le backend (service_role) peut lire/écrire.
-- =============================================================================

create extension if not exists "pgcrypto";

-- =============================================================================
-- 1. UTILISATEURS
-- =============================================================================
create table if not exists public.users (
  id                text primary key,
  name              text        not null,
  email             text        not null unique,
  password_hash     text        not null,
  age               integer     check (age is null or (age >= 13 and age <= 99)),
  gender            text        check (gender is null or gender in ('fille', 'garçon', 'autre')),
  region            text,
  avatar            text        not null default '🙂',
  interests         text[]      not null default '{}',
  points            integer     not null default 0,
  badges            text[]      not null default '{}',
  completed_lessons text[]      not null default '{}',
  streak            integer     not null default 0,
  created_at        timestamptz not null default now()
);
create index if not exists users_points_idx on public.users (points desc);

-- =============================================================================
-- 2. FORUM
-- =============================================================================
create table if not exists public.categories (
  id          text primary key,
  label       text not null,
  description text,
  emoji       text,
  color       text,
  position    integer not null default 0
);

create table if not exists public.posts (
  id         text primary key,
  title      text        not null,
  body       text        not null,
  excerpt    text,
  category   text        references public.categories (id) on delete set null,
  anonymous  boolean     not null default false,
  author_id  text        references public.users (id) on delete set null,
  status     text        not null default 'published',
  flags      text[]      not null default '{}',
  reactions  jsonb       not null default '{"support": 0, "helpful": 0}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists posts_category_idx on public.posts (category);
create index if not exists posts_author_idx   on public.posts (author_id);
create index if not exists posts_created_idx  on public.posts (created_at desc);

create table if not exists public.replies (
  id             text primary key,
  post_id        text        not null references public.posts (id) on delete cascade,
  body           text        not null,
  anonymous      boolean     not null default false,
  author_id      text        references public.users (id) on delete set null,
  status         text        not null default 'published',
  flags          text[]      not null default '{}',
  is_best_answer boolean     not null default false,
  reactions      jsonb       not null default '{"support": 0, "helpful": 0}'::jsonb,
  created_at     timestamptz not null default now()
);
create index if not exists replies_post_idx   on public.replies (post_id);
create index if not exists replies_author_idx on public.replies (author_id);

create table if not exists public.reactions (
  id         text primary key,
  post_id    text        not null references public.posts (id) on delete cascade,
  user_id    text        references public.users (id) on delete set null,
  type       text        not null check (type in ('support', 'helpful')),
  created_at timestamptz not null default now()
);
create index if not exists reactions_post_idx on public.reactions (post_id);
create index if not exists reactions_user_idx on public.reactions (user_id);

create table if not exists public.reports (
  id         text primary key,
  post_id    text        references public.posts (id) on delete cascade,
  user_id    text        references public.users (id) on delete set null,
  reason     text        not null,
  status     text        not null default 'received',
  created_at timestamptz not null default now()
);
create index if not exists reports_post_idx on public.reports (post_id);

-- =============================================================================
-- 3. EXPERTS
-- =============================================================================
create table if not exists public.experts (
  id            text primary key,
  name          text    not null,
  role          text    not null,
  specialty     text,
  bio           text,
  languages     text[]  not null default '{}',
  availability  text,
  avatar        text,
  rating        numeric(2,1) not null default 5.0,
  sessions_done integer      not null default 0
);

create table if not exists public.expert_requests (
  id                 text primary key,
  user_id            text        not null references public.users (id) on delete cascade,
  expert_id          text        references public.experts (id) on delete set null,
  expert_name        text,
  question           text        not null,
  contact_preference text        not null,
  contact_value      text,
  status             text        not null default 'received',
  eta_hours          integer     not null default 48,
  created_at         timestamptz not null default now()
);
create index if not exists expert_requests_user_idx   on public.expert_requests (user_id);
create index if not exists expert_requests_expert_idx on public.expert_requests (expert_id);

-- =============================================================================
-- 4. APPRENTISSAGE
-- =============================================================================
create table if not exists public.lessons (
  id           text primary key,
  title        text    not null,
  category     text,
  level        text    not null default 'débutant',
  duration_min integer not null default 5,
  points       integer not null default 10,
  emoji        text,
  cover        text,
  summary      text,
  tags         text[]  not null default '{}',
  sections     jsonb   not null default '[]'::jsonb,
  sources      jsonb   not null default '[]'::jsonb,
  position     integer not null default 0
);
create index if not exists lessons_category_idx on public.lessons (category);

create table if not exists public.quizzes (
  id          text primary key,
  title       text    not null,
  topic       text,
  points      integer not null default 10,
  emoji       text,
  description text,
  questions   jsonb   not null default '[]'::jsonb,
  position    integer not null default 0
);

create table if not exists public.myths (
  id       text primary key,
  myth     text not null,
  truth    text not null,
  category text,
  source   text
);

create table if not exists public.badges (
  id          text primary key,
  name        text not null,
  emoji       text,
  description text,
  criteria    text,
  position    integer not null default 0
);

-- =============================================================================
-- 5. CAMPAGNES COMMUNAUTAIRES
-- =============================================================================
create table if not exists public.campaigns (
  id           text primary key,
  month        text    not null,
  title        text    not null,
  theme        text,
  emoji        text,
  date_label   text,
  description  text,
  hashtags     text[]  not null default '{}',
  participants integer not null default 0,
  status       text    not null default 'upcoming',
  resources    jsonb   not null default '[]'::jsonb,
  schedule     jsonb   not null default '[]'::jsonb,
  facts        jsonb   not null default '[]'::jsonb,
  position     integer not null default 0
);

create table if not exists public.campaign_joins (
  id          text primary key,
  campaign_id text        not null references public.campaigns (id) on delete cascade,
  user_id     text        not null references public.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (campaign_id, user_id)
);
create index if not exists campaign_joins_campaign_idx on public.campaign_joins (campaign_id);

-- =============================================================================
-- 6. CONTENU ÉDITORIAL
-- =============================================================================
create table if not exists public.testimonials (
  id       text primary key,
  name     text not null,
  role     text,
  quote    text not null,
  avatar   text,
  age      integer,
  position integer not null default 0
);

create table if not exists public.helplines (
  id          text primary key,
  country     text not null,
  name        text not null,
  contact     text not null,
  hours       text,
  description text,
  url         text,
  position    integer not null default 0
);

-- =============================================================================
-- 7. CHATBOT ET COMPTEURS
-- =============================================================================
create table if not exists public.chat_sessions (
  id         text primary key,
  user_id    text        references public.users (id) on delete set null,
  lang       text        not null default 'fr',
  messages   jsonb       not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists chat_sessions_user_idx on public.chat_sessions (user_id);

create table if not exists public.counters (
  id    text primary key,
  name  text not null unique,
  value integer not null default 0
);

-- =============================================================================
-- 8. SÉCURITÉ — RLS activée, aucune politique publique
-- =============================================================================
alter table public.users            enable row level security;
alter table public.categories       enable row level security;
alter table public.posts            enable row level security;
alter table public.replies          enable row level security;
alter table public.reactions        enable row level security;
alter table public.reports          enable row level security;
alter table public.experts          enable row level security;
alter table public.expert_requests  enable row level security;
alter table public.lessons          enable row level security;
alter table public.quizzes          enable row level security;
alter table public.myths            enable row level security;
alter table public.badges           enable row level security;
alter table public.campaigns        enable row level security;
alter table public.campaign_joins   enable row level security;
alter table public.testimonials     enable row level security;
alter table public.helplines        enable row level security;
alter table public.chat_sessions    enable row level security;
alter table public.counters         enable row level security;

-- =============================================================================
-- 9. DONNÉES INITIALES (seed massif)
-- =============================================================================
begin;

-- ---------------------------------------------------------------------------
-- UTILISATEURS (15 comptes)
-- mot de passe commun : "wetoo2026" hashé bcrypt
-- ---------------------------------------------------------------------------
insert into public.users (id, name, email, password_hash, age, gender, region, avatar, interests, points, badges, completed_lessons, streak, created_at) values
  ('u-awa',     'Awa',     'awa@wetoo.bj',     '$2a$10$kpLr0ejthUpRvAf4/RybPugyg5gDe4ikAps.sOzsbH0g9nCqQgc82', 20, 'fille',   'Littoral',  '🌸', array['santé mentale','contraception','relations']::text[],         320, array['b-first','b-curieux','b-mythes','b-soutien']::text[],                  array['l-puberte-filles','l-contraception-bases','l-consentement','l-stress']::text[], 6, '2026-09-22T10:00:00Z'::timestamptz),
  ('u-rodrigue','Rodrigue','rodrigue@wetoo.bj','$2a$10$kpLr0ejthUpRvAf4/RybPugyg5gDe4ikAps.sOzsbH0g9nCqQgc82', 23, 'garçon',  'Atlantique','⚽', array['IST','dépistage','sport']::text[],                             180, array['b-first','b-curieux','b-sante']::text[],                               array['l-ist','l-depistage-vih','l-puberte-garcons']::text[],                    3, '2026-10-04T10:00:00Z'::timestamptz),
  ('u-grace',   'Grâce',   'grace@wetoo.bj',   '$2a$10$kpLr0ejthUpRvAf4/RybPugyg5gDe4ikAps.sOzsbH0g9nCqQgc82', 19, 'fille',   'Ouémé',     '📚', array['règles','estime de soi','bien-être']::text[],                  95,  array['b-first','b-regulier']::text[],                                        array['l-regles','l-estime']::text[],                                            8, '2026-10-14T10:00:00Z'::timestamptz),
  ('u-sessi',   'Sessi',   'sessi@wetoo.bj',   '$2a$10$kpLr0ejthUpRvAf4/RybPugyg5gDe4ikAps.sOzsbH0g9nCqQgc82', 25, 'autre',   'Zou',       '🎨', array['orientation','identité','communauté']::text[],                460, array['b-first','b-curieux','b-allie','b-sans-tabou','b-expert']::text[],     array['l-relations-saines','l-consentement','l-ist','l-depression','l-estime']::text[], 4, '2026-09-07T10:00:00Z'::timestamptz),
  ('u-bio',     'Bio',     'bio@wetoo.bj',     '$2a$10$kpLr0ejthUpRvAf4/RybPugyg5gDe4ikAps.sOzsbH0g9nCqQgc82', 21, 'garçon',  'Borgou',    '🔧', array['dépistage','sport','prévention']::text[],                     145, array['b-first','b-sante']::text[],                                          array['l-depistage-vih','l-ist','l-alcool-drogues']::text[],                     2, '2026-09-15T10:00:00Z'::timestamptz),
  ('u-afi',     'Afi',     'afi@wetoo.bj',     '$2a$10$kpLr0ejthUpRvAf4/RybPugyg5gDe4ikAps.sOzsbH0g9nCqQgc82', 22, 'fille',   'Mono',      '🌻', array['grossesse','nutrition','femmes']::text[],                     210, array['b-first','b-curieux','b-soutien']::text[],                             array['l-grossesse','l-contraception-bases','l-puberte-filles']::text[],          5, '2026-09-20T10:00:00Z'::timestamptz),
  ('u-kofi',    'Kofi',    'kofi@wetoo.bj',    '$2a$10$kpLr0ejthUpRvAf4/RybPugyg5gDe4ikAps.sOzsbH0g9nCqQgc82', 18, 'garçon',  'Atacora',   '🦁', array['sport','nutrition','corps']::text[],                          60,  array['b-first']::text[],                                                    array['l-puberte-garcons']::text[],                                              1, '2026-10-20T10:00:00Z'::timestamptz),
  ('u-yemi',    'Yemi',    'yemi@wetoo.bj',    '$2a$10$kpLr0ejthUpRvAf4/RybPugyg5gDe4ikAps.sOzsbH0g9nCqQgc82', 24, 'fille',   'Collines',  '🌺', array['santé mentale','relations','art']::text[],                    380, array['b-first','b-curieux','b-allie','b-sans-tabou']::text[],                 array['l-depression','l-estime','l-stress','l-relations-saines']::text[],         7, '2026-09-01T10:00:00Z'::timestamptz),
  ('u-pascal',  'Pascal',  'pascal@wetoo.bj',  '$2a$10$kpLr0ejthUpRvAf4/RybPugyg5gDe4ikAps.sOzsbH0g9nCqQgc82', 26, 'garçon',  'Donga',     '🎸', array['musique','bien-être','prévention']::text[],                   295, array['b-first','b-curieux','b-ambassadeur']::text[],                         array['l-alcool-drogues','l-stress','l-sommeil','l-ist']::text[],                 9, '2026-08-28T10:00:00Z'::timestamptz),
  ('u-flora',   'Flora',   'flora@wetoo.bj',   '$2a$10$kpLr0ejthUpRvAf4/RybPugyg5gDe4ikAps.sOzsbH0g9nCqQgc82', 17, 'fille',   'Littoral',  '🌷', array['puberté','scolaire','corps']::text[],                         40,  array['b-first']::text[],                                                    array['l-puberte-filles']::text[],                                               0, '2026-10-28T10:00:00Z'::timestamptz),
  ('u-marc',    'Marc',    'marc@wetoo.bj',    '$2a$10$kpLr0ejthUpRvAf4/RybPugyg5gDe4ikAps.sOzsbH0g9nCqQgc82', 20, 'garçon',  'Ouémé',     '🏀', array['contraception','relations','amour']::text[],                  130, array['b-first','b-curieux']::text[],                                         array['l-preservatif','l-consentement']::text[],                                  3, '2026-10-10T10:00:00Z'::timestamptz),
  ('u-dina',    'Dina',    'dina@wetoo.bj',    '$2a$10$kpLr0ejthUpRvAf4/RybPugyg5gDe4ikAps.sOzsbH0g9nCqQgc82', 23, 'fille',   'Zou',       '💜', array['santé mentale','tabous','communauté']::text[],                 500, array['b-first','b-curieux','b-allie','b-sans-tabou','b-expert','b-ambassadeur']::text[], array['l-stress','l-depression','l-estime','l-consentement','l-relations-saines','l-ist']::text[], 14, '2026-08-15T10:00:00Z'::timestamptz),
  ('u-kemi',    'Kemi',    'kemi@wetoo.bj',    '$2a$10$kpLr0ejthUpRvAf4/RybPugyg5gDe4ikAps.sOzsbH0g9nCqQgc82', 16, 'fille',   'Atlantique','🎀', array['puberté','règles','scolaire']::text[],                         25,  array['b-first']::text[],                                                    array['l-puberte-filles','l-regles']::text[],                                     0, '2026-10-30T10:00:00Z'::timestamptz),
  ('u-david',   'David',   'david@wetoo.bj',   '$2a$10$kpLr0ejthUpRvAf4/RybPugyg5gDe4ikAps.sOzsbH0g9nCqQgc82', 27, 'garçon',  'Borgou',    '🌍', array['prévention','VIH','jeunes']::text[],                          415, array['b-first','b-curieux','b-mythes','b-sante','b-ambassadeur']::text[],    array['l-ist','l-depistage-vih','l-preservatif','l-alcool-drogues','l-grossesse']::text[], 11, '2026-08-01T10:00:00Z'::timestamptz),
  ('u-sandra',  'Sandra',  'sandra@wetoo.bj',  '$2a$10$kpLr0ejthUpRvAf4/RybPugyg5gDe4ikAps.sOzsbH0g9nCqQgc82', 21, 'fille',   'Mono',      '🌈', array['LGBTQ+','identité','soutien']::text[],                        170, array['b-first','b-allie','b-soutien']::text[],                               array['l-relations-saines','l-estime','l-stress']::text[],                        4, '2026-09-25T10:00:00Z'::timestamptz)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- CATÉGORIES DU FORUM (8)
-- ---------------------------------------------------------------------------
insert into public.categories (id, label, description, emoji, color, position) values
  ('questions',    'Questions & réponses',         'Pose toutes tes questions — il n''y a pas de question bête.',                              '❓', '#2563EB', 1),
  ('sante-mentale','Santé mentale',                'Parler de ses émotions, du stress, de l''anxiété, se sentir moins seul·e.',                '🧠', '#7C3AED', 2),
  ('relations',    'Relations & consentement',     'Amour, amitié, respect, consentement et limites.',                                         '💬', '#EC4899', 3),
  ('grossesse',    'Grossesse & contraception',    'Contraception, grossesse, tout ce qu''il faut savoir sans tabou.',                         '🤰', '#F59E0B', 4),
  ('ist',          'IST & dépistage',              'Infections sexuellement transmissibles, dépistage et traitement.',                          '🩺', '#10B981', 5),
  ('confidences',  'Confidences (anonyme)',        'Un espace 100 % anonyme pour te confier en toute sécurité.',                               '🤫', '#64748B', 6),
  ('bien-etre',    'Bien-être & nutrition',        'Sommeil, alimentation, activité physique et hygiène de vie.',                              '🥗', '#F97316', 7),
  ('aide',         'Où trouver de l''aide',        'Centres de santé, numéros d''urgence, ressources locales et en ligne.',                    '🆘', '#EF4444', 8)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- EXPERTS (10)
-- ---------------------------------------------------------------------------
insert into public.experts (id, name, role, specialty, bio, languages, availability, avatar, rating, sessions_done) values
  ('e-chantal', 'Chantal Adjovi',        'Sage-femme',             'Grossesse, contraception et santé de la femme',
   'Sage-femme depuis 12 ans au Bénin, j''accompagne les jeunes sur la contraception, la grossesse et l''hygiène menstruelle avec bienveillance et sans jugement.',
   array['français','fon','yoruba']::text[], 'Lun–Ven 9h–17h', '👩‍⚕️', 4.9, 214),
  ('e-nadege',  'Dr. Nadège Houngbédji', 'Psychologue',            'Anxiété, dépression, stress, estime de soi',
   'Psychologue clinicienne, je reçois les jeunes qui traversent des moments difficiles. Parler, c''est déjà un premier pas.',
   array['français','fon']::text[], 'Lun–Sam 10h–19h', '🧑‍⚕️', 4.8, 176),
  ('e-senan',   'Sènan Agbo',            'Infirmier',              'IST, dépistage VIH, éducation à la santé',
   'Infirmier communautaire, je fais la promotion du dépistage et de la prévention des IST. Confidentiel, gratuit dans de nombreux centres, sans jugement.',
   array['français','fon','bariba']::text[], 'Mar–Sam 8h–16h', '🧑‍⚕️', 4.7, 143),
  ('e-kossi',   'Dr. Kossi Dossou',      'Médecin généraliste',    'Santé des adolescents et jeunes adultes',
   'Médecin généraliste, j''aborde la santé sexuelle et le bien-être global des jeunes : sommeil, hygiène de vie, prévention.',
   array['français','yoruba','fon']::text[], 'Lun–Ven 8h–15h', '👨‍⚕️', 4.6, 98),
  ('e-amina',   'Amina Touré',           'Conseillère en santé',   'Soutien psychosocial, relations amoureuses',
   'Conseillère spécialisée en soutien psychosocial. Je travaille avec des jeunes depuis 8 ans, en milieu urbain et rural.',
   array['français','dendi','fon']::text[], 'Lun–Ven 10h–17h', '👩‍🔬', 4.8, 87),
  ('e-théo',    'Théophile Hounsa',      'Nutritionniste',         'Alimentation saine, santé reproductive et adolescence',
   'Nutritionniste et éducateur en santé. Je montre aux jeunes comment une bonne alimentation influence leur corps et leur humeur.',
   array['français','fon']::text[], 'Mer–Ven 9h–14h', '👨‍⚕️', 4.5, 64),
  ('e-marie',   'Dr. Marie Biokou',      'Gynécologue',            'Santé reproductive féminine, dysménorrhée, MST',
   'Gynécologue à Cotonou. Je crois qu''une jeune fille bien informée sur son corps prend de meilleures décisions pour sa santé.',
   array['français','fon','mina']::text[], 'Lun–Mer 8h–13h', '👩‍⚕️', 4.9, 302),
  ('e-olivier', 'Olivier Gbénou',        'Travailleur social',     'Prévention des violences, droits des jeunes',
   'Travailleur social dans les communautés du Bénin depuis 10 ans. J''aide les jeunes à connaître leurs droits et à accéder aux services.',
   array['français','fon','yoruba']::text[], 'Lun–Ven 8h–17h', '🧑‍💼', 4.6, 119),
  ('e-fatou',   'Fatou Diallo',          'Sage-femme',             'Planification familiale, allaitement, post-partum',
   'Sage-femme expatriée sénégalaise travaillant au Bénin depuis 5 ans. Je parle aux jeunes mères avec empathie et sans jugement.',
   array['français','wolof','fon']::text[], 'Mar–Sam 9h–16h', '👩‍⚕️', 4.7, 158),
  ('e-ibrahim', 'Dr. Ibrahim Soumaré',   'Psychiatre',             'Troubles mentaux chez les adolescents, trauma',
   'Psychiatre formé à Dakar et pratiquant au Bénin. Je traite les troubles mentaux des jeunes avec bienveillance et confidentialité.',
   array['français','dioula','fon']::text[], 'Mer–Ven 10h–16h', '👨‍⚕️', 4.8, 73)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- COURS (25)
-- ---------------------------------------------------------------------------
insert into public.lessons (id, title, category, level, duration_min, points, emoji, cover, summary, tags, sections, sources, position) values

('l-puberte-filles','La puberté chez les filles','Corps & puberté','débutant',8,30,'🌷','/assets/covers/puberte-filles.svg',
 'Comprendre les changements du corps à l''adolescence chez les filles.',
 array['puberté','corps','adolescence']::text[],
 '[{"heading":"Ce qui change dans ton corps","body":"La puberté est la période où ton corps se transforme pour devenir celui d''une adulte. Chez les filles, elle commence souvent entre 9 et 14 ans. Les seins commencent à se développer, des poils apparaissent, et les premières règles surviennent. Chaque corps a son propre rythme.","keyPoints":["Début entre 9 et 14 ans.","Rythme différent pour chaque personne.","Ces changements sont normaux et sains."]},{"heading":"Les émotions aussi changent","body":"Pendant la puberté, les hormones peuvent rendre les émotions plus fortes : tu peux te sentir joyeuse puis triste sans raison claire. C''est normal. Prendre soin de son sommeil, bouger et parler aide beaucoup.","keyPoints":["Émotions intenses sont courantes.","Dormir et bouger aident.","En parler fait du bien."]},{"heading":"Quand demander de l''aide","body":"Si tes règles ne viennent pas à 16 ans, si tu as très mal, ou si ces changements t''inquiètent, parles-en à une sage-femme. Consulter n''est pas une honte.","keyPoints":["Absence de règles à 16 ans : consulter.","Douleur très forte : anormale.","Consulter est un signe de maturité."]}]'::jsonb,
 '[{"title":"OMS — Santé de l''adolescent","url":"https://www.who.int/fr/health-topics/adolescent-health"}]'::jsonb, 1),

('l-puberte-garcons','La puberté chez les garçons','Corps & puberté','débutant',8,30,'🌱','/assets/covers/puberte-garcons.svg',
 'Comprendre les changements du corps à l''adolescence chez les garçons.',
 array['puberté','corps','adolescence']::text[],
 '[{"heading":"Des changements progressifs","body":"Chez les garçons, la puberté débute souvent entre 10 et 15 ans. La voix mue, des poils apparaissent, le corps grandit vite. Il est normal d''avoir des érections spontanées ou des émissions nocturnes.","keyPoints":["Début entre 10 et 15 ans.","Érections et émissions nocturnes normales.","Chaque corps avance à son rythme."]},{"heading":"Prendre soin de son corps","body":"La transpiration et les odeurs deviennent plus marquées. Se laver chaque jour, surtout après le sport, porter des vêtements propres et utiliser un déodorant simple suffit.","keyPoints":["Se laver quotidiennement.","Hygiène après le sport importante.","Déodorant simple suffit."]},{"heading":"Le mental compte aussi","body":"La pression de « devenir un homme » peut peser. Être un homme, c''est aussi savoir écouter, demander de l''aide et respecter les autres. Parler est une force.","keyPoints":["Attentes sociales peuvent peser.","Demander de l''aide est une force.","Le respect est essentiel."]}]'::jsonb,
 '[{"title":"OMS — Santé de l''adolescent","url":"https://www.who.int/fr/health-topics/adolescent-health"}]'::jsonb, 2),

('l-regles','Les règles et l''hygiène menstruelle','Règles & hygiène','débutant',9,35,'🩸','/assets/covers/regles.svg',
 'Tout comprendre sur les règles et une bonne hygiène menstruelle.',
 array['règles','menstrues','hygiène']::text[],
 '[{"heading":"Le cycle menstruel en bref","body":"Les règles surviennent environ une fois par mois et durent de 3 à 7 jours. Le cycle est souvent irrégulier dans les premières années. Un cycle courant dure entre 21 et 35 jours.","keyPoints":["Durée moyenne 3 à 7 jours.","Cycle entre 21 et 35 jours.","Irrégularité fréquente les premières années."]},{"heading":"Une bonne hygiène menstruelle","body":"Change de protection régulièrement (toutes les 4 à 6 heures), lave-toi à l''eau propre. Les serviettes lavables et les coupes menstruelles sont économiques et écologiques.","keyPoints":["Changer toutes les 4 à 6 heures.","Eau propre.","Protections lavables = option durable."]},{"heading":"Gérer les douleurs","body":"Des douleurs légères sont courantes. Une bouillotte, du repos et une activité douce aident. Si la douleur t''empêche d''aller à l''école, consulte.","keyPoints":["Chaleur et repos soulagent.","Douleur invalidante doit être évaluée.","Les règles ne doivent pas gâcher ta vie."]}]'::jsonb,
 '[{"title":"UNICEF — Hygiène menstruelle","url":"https://www.unicef.org/fr/wash/menstrual-hygiene"}]'::jsonb, 3),

('l-contraception-bases','La contraception : les bases','Contraception','débutant',10,40,'💊','/assets/covers/contraception.svg',
 'Découvrir les principales méthodes de contraception et leur efficacité.',
 array['contraception','prévention','grossesse']::text[],
 '[{"heading":"À quoi sert la contraception","body":"La contraception sert à éviter une grossesse non désirée. Certaines méthodes protègent aussi des IST (le préservatif), d''autres non. Le choix appartient à chacun·e.","keyPoints":["Évite une grossesse non désirée.","Seul le préservatif protège des IST.","Le meilleur choix est celui qui te convient."]},{"heading":"Les grandes familles de méthodes","body":"Il existe le préservatif, la pilule, l''implant, l''injectable, le stérilet et la pilule du lendemain en urgence. L''efficacité varie.","keyPoints":["Préservatif : grossesse ET IST.","Implant et stérilet très efficaces.","Pilule du lendemain = urgence seulement."]},{"heading":"Où en obtenir au Bénin","body":"La plupart des méthodes sont disponibles gratuitement ou à faible coût dans les centres de santé et les centres de planification familiale. Confidentialité garantie.","keyPoints":["Centres de santé et planning familial.","Souvent gratuites ou peu coûteuses.","Confidentialité garantie."]}]'::jsonb,
 '[{"title":"OMS — Planification familiale","url":"https://www.who.int/fr/news-room/fact-sheets/detail/family-planning-contraception"}]'::jsonb, 4),

('l-preservatif','Le préservatif : mode d''emploi','Contraception','débutant',8,40,'🛡️','/assets/covers/preservatif.svg',
 'Utiliser correctement le préservatif, la seule méthode qui protège des IST.',
 array['préservatif','IST','prévention']::text[],
 '[{"heading":"Pourquoi il est essentiel","body":"Le préservatif est la seule méthode qui protège à la fois d''une grossesse et des IST, y compris le VIH. Il est disponible gratuitement dans de nombreux centres.","keyPoints":["Protège IST ET grossesse.","Bien utilisé, très efficace.","Gratuit dans de nombreux centres."]},{"heading":"Comment bien l''utiliser","body":"Ouvre l''emballage avec les doigts, jamais avec les dents. Mets-le avant tout contact, en pinçant le bout pour chasser l''air. Roule-le jusqu''à la base. Après usage, retire-le et jette-le à la poubelle.","keyPoints":["Ne jamais ouvrir avec les dents.","Pincer le bout pour chasser l''air.","Un préservatif par rapport."]},{"heading":"Les erreurs fréquentes","body":"Utiliser de l''huile avec un préservatif en latex le fragilise. Ne jamais réutiliser un préservatif. Si le préservatif craque, consulte rapidement.","keyPoints":["Huile fragilise le latex.","On ne réutilise jamais un préservatif.","En cas de rupture, consulte rapidement."]}]'::jsonb,
 '[{"title":"OMS — Préservatifs","url":"https://www.who.int/fr/news-room/fact-sheets/detail/family-planning-contraception"}]'::jsonb, 5),

('l-ist','IST : comprendre et se protéger','IST & dépistage','intermédiaire',10,45,'🦠','/assets/covers/ist.svg',
 'Reconnaître les IST, savoir comment s''en protéger et où se faire soigner.',
 array['IST','VIH','prévention','dépistage']::text[],
 '[{"heading":"Qu''est-ce qu''une IST ?","body":"Les infections sexuellement transmissibles se transmettent lors de rapports sexuels non protégés. Les plus courantes : VIH, chlamydia, gonorrhée, syphilis, herpès. Beaucoup sont silencieuses.","keyPoints":["Transmission sans protection.","Beaucoup sont silencieuses.","Dépistage = clé."]},{"heading":"Comment s''en protéger","body":"Le préservatif, utilisé correctement, réduit fortement le risque. Se faire dépister régulièrement et en parler à son/sa partenaire, c''est être responsable.","keyPoints":["Préservatif = protection principale.","Dépistage régulier.","En parler avec son partenaire."]},{"heading":"Se soigner, sans honte","body":"La plupart des IST se soignent bien, surtout détectées tôt. Ne jamais s''automédiquer.","keyPoints":["La plupart des IST se soignent.","Traitement précoce évite les complications.","Ne jamais s''automédiquer."]}]'::jsonb,
 '[{"title":"OMS — IST","url":"https://www.who.int/fr/news-room/fact-sheets/detail/sexually-transmitted-infections-(stis)"}]'::jsonb, 6),

('l-depistage-vih','Le dépistage du VIH','IST & dépistage','intermédiaire',8,45,'🧪','/assets/covers/depistage.svg',
 'Pourquoi, comment et où se faire dépister du VIH en toute confidentialité.',
 array['VIH','dépistage','santé']::text[],
 '[{"heading":"Pourquoi se faire dépister","body":"Le dépistage est rapide, souvent gratuit et confidentiel. Connaître son statut permet de commencer un traitement tôt. Aujourd''hui, une personne séropositive bien suivie vit une vie longue et épanouie.","keyPoints":["Rapide, souvent gratuit et confidentiel.","Traitement précoce change tout.","On peut vivre normalement avec le VIH."]},{"heading":"Le test de dépistage","body":"Test rapide à partir d''une goutte de sang ou de salive, résultat en quelques minutes. Accompagnement et conseil avant et après.","keyPoints":["Résultat en quelques minutes.","Confirmation peut être nécessaire.","Accompagnement proposé."]},{"heading":"Confidentialité et droits","body":"Le dépistage est confidentiel. Personne ne peut te forcer à révéler ton statut. Tu as droit aux soins, à la confidentialité et au respect.","keyPoints":["Dépistage confidentiel.","Personne ne peut divulguer ton statut.","Tu as droit au respect et aux soins."]}]'::jsonb,
 '[{"title":"ONUSIDA","url":"https://www.unaids.org/fr"}]'::jsonb, 7),

('l-consentement','Consentement : dire oui, dire non','Relations & consentement','débutant',8,40,'🤝','/assets/covers/consentement.svg',
 'Comprendre le consentement, une base essentielle de toute relation.',
 array['consentement','relations','respect']::text[],
 '[{"heading":"Le consentement, c''est quoi ?","body":"Le consentement est un accord libre, clair et enthousiaste. Il doit être donné à chaque fois, pour chaque acte, et peut être retiré à tout moment. Le silence n''est jamais un oui.","keyPoints":["Libre, clair et enthousiaste.","Donné à chaque fois, réversible.","Le silence n''est pas un oui."]},{"heading":"Ce qui n''est jamais un consentement","body":"La pression, la menace, l''alcool, l''âge (mineur·e), la peur : aucun de ces éléments ne permet un vrai consentement. Forcer est puni par la loi.","keyPoints":["Pression et menace annulent le consentement.","Personne ivre ne peut consentir.","Forcer est interdit par la loi."]},{"heading":"Comment le demander","body":"Demander : « Est-ce que tu veux ? Ça te va ? ». Écouter la réponse, même une hésitation. Respecter un non renforce la confiance.","keyPoints":["Demander directement.","Écouter attentivement.","Respecter un non renforce la relation."]}]'::jsonb,
 '[{"title":"UNFPA — Consentement","url":"https://www.unfpa.org/fr"}]'::jsonb, 8),

('l-relations-saines','Relations saines et respectueuses','Relations & consentement','débutant',9,40,'💞','/assets/covers/relations-saines.svg',
 'Reconnaître les signes d''une relation saine et ceux d''une relation toxique.',
 array['relations','amour','respect']::text[],
 '[{"heading":"Les signes d''une relation saine","body":"Dans une relation saine, on se sent respecté·e, écouté·e et libre. La jalousie excessive, le contrôle et les humiliations n''ont pas leur place dans l''amour.","keyPoints":["Respect, écoute et liberté.","On peut dire non sans peur.","Le contrôle n''est pas de l''amour."]},{"heading":"Repérer les signaux d''alerte","body":"Si ton/ta partenaire te rabaisse, t''isole, te menace ou fouille ton téléphone, ce sont des signaux d''alerte. Ce n''est pas de ta faute.","keyPoints":["Rabaisser, isoler, menacer = alertes.","Ce n''est jamais ta faute.","De l''aide est disponible."]},{"heading":"Comment réagir","body":"Parle à une personne de confiance. Tu peux poser des limites claires. En cas de danger, contacte les autorités.","keyPoints":["Parle à quelqu''un de confiance.","Poser des limites est légitime.","En cas de danger, appelle de l''aide."]}]'::jsonb,
 '[{"title":"OMS — Violence à l''égard des femmes","url":"https://www.who.int/fr/news-room/fact-sheets/detail/violence-against-women"}]'::jsonb, 9),

('l-grossesse','Grossesse non désirée : que faire ?','Grossesse & contraception','intermédiaire',10,45,'🤰','/assets/covers/grossesse.svg',
 'Les options et les démarches en cas de grossesse non désirée.',
 array['grossesse','contraception','aide']::text[],
 '[{"heading":"D''abord, respirer et s''informer","body":"Une grossesse non désirée peut faire peur. Confirme la grossesse (test ou centre de santé) et informe-toi calmement sans te précipiter.","keyPoints":["Confirmer la grossesse.","S''informer avant de décider.","Le jugement n''a pas sa place."]},{"heading":"Les options possibles","body":"Plusieurs chemins existent : poursuivre la grossesse, l''adoption, ou l''interruption encadrée par la loi béninoise de 2021. Toujours passer par un professionnel.","keyPoints":["Plusieurs options existent.","La loi béninoise encadre l''IVG.","Jamais de méthode non médicale."]},{"heading":"Se faire accompagner","body":"Une sage-femme, un médecin ou un expert WeToo peut t''expliquer les options et tes droits. Tu n''es pas seul·e.","keyPoints":["Un professionnel peut t''accompagner.","Tu as droit à un choix libre.","Personne ne peut te contraindre."]}]'::jsonb,
 '[{"title":"OMS — Santé reproductive","url":"https://www.who.int/fr/health-topics/sexual-and-reproductive-health"}]'::jsonb, 10),

('l-stress','Gérer le stress et l''anxiété','Santé mentale','débutant',9,40,'🧘','/assets/covers/stress.svg',
 'Des techniques simples pour apaiser le stress et l''anxiété du quotidien.',
 array['stress','anxiété','bien-être']::text[],
 '[{"heading":"Comprendre le stress","body":"Le stress est une réaction normale face à une pression. Il devient un problème quand il dure et t''épuise. Reconnaître les signaux corporels est la première étape.","keyPoints":["Le stress est normal mais pas quand il dure.","Des signes corporels l''annoncent.","Le reconnaître aide à le gérer."]},{"heading":"Des techniques qui aident","body":"Respirer lentement (inspirer 4 secondes, expirer 6), bouger, dormir suffisamment, limiter les écrans le soir, parler à quelqu''un.","keyPoints":["Respiration lente apaise.","Sport et sommeil aident.","Parler fait baisser la pression."]},{"heading":"Quand consulter","body":"Si l''anxiété t''empêche d''étudier, de dormir ou de sortir pendant plusieurs semaines, parles-en à un psychologue. C''est un soin, pas une faiblesse.","keyPoints":["Anxiété persistante se soigne.","Psychologue peut aider.","Demander de l''aide est courageux."]}]'::jsonb,
 '[{"title":"OMS — Santé mentale","url":"https://www.who.int/fr/health-topics/mental-health"}]'::jsonb, 11),

('l-depression','Dépression et mal-être : demander de l''aide','Santé mentale','intermédiaire',10,45,'💙','/assets/covers/depression.svg',
 'Reconnaître les signes de la dépression et savoir vers qui se tourner.',
 array['dépression','santé mentale','aide']::text[],
 '[{"heading":"Reconnaître les signes","body":"La dépression, ce n''est pas juste être triste. C''est une tristesse ou un vide qui dure, avec perte d''intérêt, fatigue, troubles du sommeil, parfois des idées sombres.","keyPoints":["Ce n''est pas de la paresse.","Les symptômes durent plusieurs semaines.","Les idées sombres doivent alerter."]},{"heading":"Ce qui aide vraiment","body":"Parler à quelqu''un, consulter un psychologue, garder un sommeil régulier et un lien social. La dépression se soigne.","keyPoints":["Parler est un premier pas.","La dépression se soigne.","Traitement médical, jamais improvisé."]},{"heading":"Si tu penses à en finir","body":"Si tu as des pensées de suicide, appelle le 137 (Bénin) ou les urgences. Ta vie compte.","keyPoints":["Pensées suicidaires = aide immédiate.","Appelle le 137 sans attendre.","Ta vie compte, toujours."]}]'::jsonb,
 '[{"title":"OMS — Dépression","url":"https://www.who.int/fr/news-room/fact-sheets/detail/depression"}]'::jsonb, 12),

('l-estime','Estime de soi et image corporelle','Santé mentale','débutant',8,35,'🪞','/assets/covers/estime.svg',
 'Apprendre à s''aimer et à accepter son corps tel qu''il est.',
 array['estime de soi','image corporelle','confiance']::text[],
 '[{"heading":"D''où vient l''image de soi","body":"L''image que tu as de toi se construit avec les regards des autres mais aussi ce que tu te dis à toi-même. Les réseaux sociaux renvoient souvent des images irréalistes.","keyPoints":["Image de soi se construit progressivement.","Les réseaux montrent du irréel.","Tu comptes plus qu''un filtre."]},{"heading":"Renforcer son estime","body":"Note tes réussites, même petites. Entoure-toi de personnes bienveillantes. Compare-toi à toi-même plutôt qu''aux autres.","keyPoints":["Célèbre tes petites réussites.","Entoure-toi de bienveillance.","Compare-toi à toi-même."]},{"heading":"Quand le corps pèse trop","body":"Si ton rapport à ton corps provoque une détresse forte ou des troubles alimentaires, parles-en à un professionnel.","keyPoints":["Souffrance forte mérite de l''aide.","Troubles alimentaires se traitent.","Accompagnement existe."]}]'::jsonb,
 '[{"title":"UNICEF — Santé mentale ados","url":"https://www.unicef.org/fr"}]'::jsonb, 13),

('l-alcool-drogues','Alcool, tabac et drogues','Bien-être & prévention','intermédiaire',9,40,'🚭','/assets/covers/alcool.svg',
 'Comprendre les risques de l''alcool, du tabac et des drogues, et réduire les risques.',
 array['alcool','tabac','drogues','prévention']::text[],
 '[{"heading":"Les risques principaux","body":"L''alcool et les drogues altèrent le jugement, réduisent la vigilance et peuvent mener à des comportements à risque (relations non protégées, accidents, violences).","keyPoints":["L''alcool altère le jugement.","Augmente les comportements à risque.","Effets sur la santé réels."]},{"heading":"Réduire les risques","body":"Si tu consommes, évite de conduire, ne reste pas seul·e, bois de l''eau. Sous l''effet de l''alcool, on ne peut pas donner un consentement valable.","keyPoints":["Ne conduis jamais après avoir bu.","Ne laisse pas ta boisson sans surveillance.","Alcool et consentement ne vont pas ensemble."]},{"heading":"Vers qui se tourner","body":"Si tu sens que tu perds le contrôle, des professionnels peuvent t''accompagner sans juger. Parler tôt évite la dépendance.","keyPoints":["Perdre le contrôle doit alerter.","Accompagnement existe.","Parler tôt est essentiel."]}]'::jsonb,
 '[{"title":"OMS — Alcool","url":"https://www.who.int/fr/news-room/fact-sheets/detail/alcohol"}]'::jsonb, 14),

('l-sommeil','Le sommeil et la santé','Bien-être & prévention','débutant',7,30,'😴','/assets/covers/sommeil.svg',
 'Comprendre pourquoi bien dormir est fondamental pour ta santé.',
 array['sommeil','bien-être','santé']::text[],
 '[{"heading":"Pourquoi le sommeil compte","body":"Le sommeil répare le corps, consolide la mémoire et régule les émotions. Les adolescents ont besoin de 8 à 10 heures par nuit. Le manque de sommeil augmente le stress et affaiblit les défenses.","keyPoints":["8 à 10 heures par nuit pour les ados.","Répare le corps et la mémoire.","Manque de sommeil = plus de stress."]},{"heading":"Les écrans et le sommeil","body":"La lumière bleue des écrans retarde la production de mélatonine et rend difficile l''endormissement. Éteins les écrans 30 à 60 minutes avant de dormir.","keyPoints":["Lumière bleue perturbe le sommeil.","Éteins les écrans 30–60 min avant.","Lire ou méditer aide à s''endormir."]},{"heading":"Créer une routine du soir","body":"Couche-toi à heure régulière, garde ta chambre fraîche et sombre, évite le café après 16h. Un rituel (musique douce, lecture) signal au cerveau qu''il est temps de se reposer.","keyPoints":["Horaires réguliers aident.","Chambre fraîche et sombre.","Évite le café après 16h."]}]'::jsonb,
 '[{"title":"OMS — Sommeil de l''adolescent","url":"https://www.who.int/fr/health-topics/adolescent-health"}]'::jsonb, 15),

('l-nutrition','Nutrition et santé reproductive','Bien-être & prévention','débutant',8,35,'🥗','/assets/covers/nutrition.svg',
 'Comment une alimentation équilibrée soutient ta santé sexuelle et mentale.',
 array['nutrition','alimentation','santé']::text[],
 '[{"heading":"L''alimentation et le corps","body":"Ce que tu manges influence ton énergie, tes hormones et ton humeur. Une alimentation variée — légumes, fruits, protéines, féculents — maintient le corps et l''esprit en forme.","keyPoints":["Alimentation variée = énergie stable.","Les hormones sont influencées par la nutrition.","Bien manger améliore l''humeur."]},{"heading":"Fer et santé des filles","body":"Les filles perdent du fer pendant les règles. Un manque de fer provoque fatigue, étourdissements et pâleur. Les haricots, lentilles, abats, feuilles vertes et viande sont de bonnes sources.","keyPoints":["Règles = perte de fer.","Haricots, abats, légumes verts.","Fatigue persistante peut indiquer anémie."]},{"heading":"L''hydratation","body":"Boire 1,5 à 2 litres d''eau par jour (plus si chaleur ou activité physique) est essentiel. L''eau soutient la digestion, la peau et l''énergie. Les sodas et boissons sucrées ne remplacent pas l''eau.","keyPoints":["1,5 à 2 litres d''eau par jour.","Plus en cas de chaleur ou sport.","Sodas ne remplacent pas l''eau."]}]'::jsonb,
 '[{"title":"OMS — Nutrition chez les adolescents","url":"https://www.who.int/fr/health-topics/adolescent-health"}]'::jsonb, 16),

('l-cyberharcèlement','Cyberharcèlement et sécurité en ligne','Bien-être & prévention','débutant',8,35,'💻','/assets/covers/cyber.svg',
 'Se protéger du harcèlement en ligne et signaler les abus.',
 array['cyberharcèlement','réseaux sociaux','sécurité']::text[],
 '[{"heading":"C''est quoi le cyberharcèlement ?","body":"Le cyberharcèlement consiste à insulter, menacer, humilier ou répandre de fausses informations sur quelqu''un via les réseaux sociaux, SMS ou messageries. Il est aussi grave que le harcèlement physique.","keyPoints":["Insultes, menaces, humiliations en ligne.","Aussi grave que le harcèlement physique.","Il laisse des traces."]},{"heading":"Comment réagir","body":"Ne réponds pas dans l''immédiat (évite d''envenimer). Bloque l''auteur. Sauvegarde les preuves (captures d''écran). Parle-en à un adulte de confiance ou signale sur la plateforme.","keyPoints":["Bloquer l''auteur.","Sauvegarder les preuves.","En parler à un adulte."]},{"heading":"Protéger sa vie privée en ligne","body":"N''accepte pas de contacts inconnus, ne partage pas de photos intimes, paramètre la confidentialité de tes profils. Réfléchis avant de publier : tout peut être copié.","keyPoints":["Ne pas partager de photos intimes.","Régler la confidentialité.","Réfléchir avant de publier."]}]'::jsonb,
 '[{"title":"UNICEF — Sécurité en ligne","url":"https://www.unicef.org/fr/childsafety-online"}]'::jsonb, 17),

('l-menopause-precoce','Ménopause précoce et troubles hormonaux','Corps & puberté','avancé',11,50,'🔬','/assets/covers/hormones.svg',
 'Comprendre les déséquilibres hormonaux et leurs effets chez les jeunes.',
 array['hormones','santé','corps']::text[],
 '[{"heading":"Les hormones, c''est quoi ?","body":"Les hormones sont des messagers chimiques produits par des glandes. Elles régulent la croissance, l''humeur, le cycle menstruel, la sexualité et le sommeil. Un déséquilibre peut avoir des effets importants.","keyPoints":["Les hormones régulent beaucoup de fonctions.","Glandes principales : ovaires, thyroïde, surrénales.","Un déséquilibre peut être traité."]},{"heading":"Signes d''un déséquilibre","body":"Règles très irrégulières ou absentes, acné sévère, prise ou perte de poids inexpliquée, fatigue extrême ou humeurs changeantes peuvent signaler un déséquilibre hormonal. Consulte un médecin.","keyPoints":["Règles irrégulières ou absentes.","Acné sévère ou poids inexpliqué.","Consulte un médecin."]},{"heading":"Traitement et suivi","body":"Un bilan sanguin simple peut détecter des anomalies. Les traitements existent : pilule hormonale, traitement thyroïdien, changements de mode de vie. Ne t''automédicamentez pas.","keyPoints":["Bilan sanguin = outil de diagnostic.","Des traitements existent.","Ne pas s''automédicamenter."]}]'::jsonb,
 '[{"title":"OMS — Santé reproductive","url":"https://www.who.int/fr/health-topics/sexual-and-reproductive-health"}]'::jsonb, 18),

('l-violence-genre','Violences basées sur le genre','Relations & consentement','intermédiaire',10,45,'🚨','/assets/covers/violence.svg',
 'Reconnaître, prévenir et répondre aux violences basées sur le genre.',
 array['violence','genre','droits','aide']::text[],
 '[{"heading":"Qu''est-ce que la VBG ?","body":"Les violences basées sur le genre (VBG) incluent les violences physiques, sexuelles, psychologiques et économiques exercées en raison du genre d''une personne. Elles touchent surtout les femmes et les filles.","keyPoints":["Violence physique, sexuelle, psychologique.","Liée à l''inégalité de genre.","Touche surtout les femmes et les filles."]},{"heading":"Reconnaître les signes","body":"Insultes ou humiliations répétées, coups, obligation de rapports sexuels, contrôle de l''argent, isolement de la famille ou des amis : ce sont des formes de VBG.","keyPoints":["Insultes et humiliations répétées.","Obligation de rapports sexuels.","Isolement de l''entourage."]},{"heading":"Où trouver de l''aide","body":"Appelle le 137 (Bénin), parle à un travailleur social, un médecin ou une sage-femme. Des centres d''écoute et d''hébergement existent. Tu n''as pas à rester dans une situation dangereuse.","keyPoints":["Appeler le 137.","Centres d''écoute et d''hébergement.","Tu n''as pas à rester dans le danger."]}]'::jsonb,
 '[{"title":"OMS — VBG","url":"https://www.who.int/fr/news-room/fact-sheets/detail/violence-against-women"}]'::jsonb, 19),

('l-grossesse-ado','Grossesse à l''adolescence','Grossesse & contraception','intermédiaire',10,45,'👶','/assets/covers/grossesse-ado.svg',
 'Les réalités et défis d''une grossesse à l''adolescence, et les ressources disponibles.',
 array['grossesse','adolescence','aide','droits']::text[],
 '[{"heading":"Une réalité fréquente au Bénin","body":"Le Bénin compte parmi les pays avec les taux de grossesse adolescente les plus élevés. Une grossesse trop tôt peut interrompre les études, fragiliser la santé de la mère et de l''enfant.","keyPoints":["Taux élevé au Bénin.","Impact sur les études et la santé.","Prévention par la contraception."]},{"heading":"Tes droits","body":"Si tu es enceinte, tu as le droit aux soins de santé prénatals. Aucun médecin ou sage-femme n''a le droit de te refuser des soins ou de te juger. La loi te protège.","keyPoints":["Droit aux soins prénatals.","Aucun refus de soins légal.","La loi te protège."]},{"heading":"Où chercher de l''aide","body":"Les centres de santé de la mère et de l''enfant, les sages-femmes et les ONG locales peuvent t''accompagner tout au long de ta grossesse.","keyPoints":["Centres de santé mère-enfant.","Sages-femmes disponibles.","ONG locales d''accompagnement."]}]'::jsonb,
 '[{"title":"UNFPA — Grossesse adolescente","url":"https://www.unfpa.org/fr/grossesse-adolescente"}]'::jsonb, 20),

('l-droits-sante','Tes droits en matière de santé sexuelle','Relations & consentement','intermédiaire',9,40,'⚖️','/assets/covers/droits.svg',
 'Connaître ses droits fondamentaux en matière de santé sexuelle et reproductive.',
 array['droits','santé','loi','Bénin']::text[],
 '[{"heading":"Le droit à l''information","body":"Chaque jeune a le droit d''accéder à une information fiable sur la santé sexuelle, sans que la famille ou une institution puisse s''y opposer. C''est un droit humain fondamental.","keyPoints":["Droit à l''information fiable.","Sans obligation de notifier la famille.","C''est un droit humain fondamental."]},{"heading":"Le droit à la confidentialité","body":"Les professionnels de santé (médecins, sages-femmes, infirmiers) sont tenus au secret professionnel. Ils ne peuvent pas divulguer tes informations à ta famille sans ton accord.","keyPoints":["Secret professionnel obligatoire.","Aucune divulgation sans accord.","Ça s''applique même aux mineurs."]},{"heading":"La loi béninoise","body":"La loi béninoise de 2021 sur la santé de la reproduction reconnaît les droits des jeunes à l''information, aux services contraceptifs et aux soins. Elle interdit la discrimination basée sur le genre ou le statut marital.","keyPoints":["Loi béninoise 2021.","Droit à la contraception.","Interdiction de discrimination."]}]'::jsonb,
 '[{"title":"Loi béninoise sur la santé de la reproduction 2021","url":"https://www.sante.bj"}]'::jsonb, 21),

('l-plan-familial','Planification familiale','Contraception','intermédiaire',10,45,'👨‍👩‍👧','/assets/covers/planification.svg',
 'Comprendre la planification familiale et son importance pour le bien-être des familles.',
 array['planification familiale','contraception','famille']::text[],
 '[{"heading":"Qu''est-ce que la planification familiale ?","body":"La planification familiale permet à un individu ou un couple de décider du nombre d''enfants et du moment de les avoir. Elle inclut la contraception, le suivi gynécologique et le conseil.","keyPoints":["Liberté de décider du nombre d''enfants.","Inclut contraception et conseil.","Améliore la santé maternelle."]},{"heading":"Les avantages","body":"La planification familiale réduit les grossesses non désirées, améliore la santé des mères et des enfants, et permet aux femmes de poursuivre leurs études ou leur carrière.","keyPoints":["Réduit les grossesses non désirées.","Améliore la santé maternelle.","Favorise l''autonomie des femmes."]},{"heading":"Accès au Bénin","body":"Les centres de planification familiale au Bénin offrent conseil, contraceptifs et suivi. Les services sont souvent gratuits ou subventionnés pour les jeunes.","keyPoints":["Centres de planification familiale disponibles.","Souvent gratuits pour les jeunes.","Personnel formé et bienveillant."]}]'::jsonb,
 '[{"title":"OMS — Planification familiale","url":"https://www.who.int/fr/news-room/fact-sheets/detail/family-planning-contraception"}]'::jsonb, 22),

('l-infections-urinaires','Infections urinaires et vaginales','Corps & puberté','débutant',7,30,'🏥','/assets/covers/infections.svg',
 'Reconnaître et prévenir les infections urinaires et vaginales courantes.',
 array['infections','hygiène','santé']::text[],
 '[{"heading":"Infections urinaires","body":"Une infection urinaire provoque des brûlures en urinant, des envies fréquentes et parfois de la fièvre. Elle est plus courante chez les filles. Elle se traite avec des antibiotiques prescrits par un médecin.","keyPoints":["Brûlures et envies fréquentes.","Plus courante chez les filles.","Antibiotiques sur prescription."]},{"heading":"Infections vaginales","body":"Des pertes vaginales inhabituelles (couleur, odeur, consistance), des démangeaisons ou des brûlures peuvent indiquer une infection. Ne t''automédicamentez pas.","keyPoints":["Pertes inhabituelles = signe d''alerte.","Consulter sans attendre.","Ne pas s''automédicamenter."]},{"heading":"Prévention","body":"Boire beaucoup d''eau, s''essuyer de l''avant vers l''arrière, porter des sous-vêtements en coton, éviter les douches vaginales et les savons parfumés aident à prévenir ces infections.","keyPoints":["Boire beaucoup d''eau.","S''essuyer de l''avant vers l''arrière.","Coton, pas de douches vaginales."]}]'::jsonb,
 '[{"title":"OMS — Santé reproductive","url":"https://www.who.int/fr/health-topics/sexual-and-reproductive-health"}]'::jsonb, 23),

('l-addictions','Comprendre les addictions','Bien-être & prévention','intermédiaire',9,40,'🔗','/assets/covers/addictions.svg',
 'Comprendre le mécanisme des addictions et comment s''en sortir.',
 array['addiction','dépendance','prévention']::text[],
 '[{"heading":"Comment naît une addiction ?","body":"L''addiction est une dépendance à une substance ou un comportement (alcool, drogues, réseaux sociaux, jeux). Elle modifie le cerveau et crée un besoin irrésistible. Ce n''est pas une question de volonté.","keyPoints":["Dépendance à une substance ou comportement.","Modifie le cerveau.","Ce n''est pas un manque de volonté."]},{"heading":"Signaux d''alarme","body":"Tu continues malgré les conséquences négatives, tu penses à la substance tout le temps, tu en as besoin de plus en plus, tu te sens mal quand tu arrêtes.","keyPoints":["Continuer malgré les conséquences.","Pensée obsessionnelle.","Malaise à l''arrêt (sevrage)."]},{"heading":"Demander de l''aide","body":"Il existe des centres de traitement des addictions au Bénin. Parler à un médecin ou un travailleur social est un premier pas. Une addiction traitée tôt guérit mieux.","keyPoints":["Centres de traitement disponibles.","Médecin ou travailleur social.","Plus tôt = mieux."]}]'::jsonb,
 '[{"title":"OMS — Addiction et drogues","url":"https://www.who.int/fr/health-topics/drugs-psychoactive"}]'::jsonb, 24),

('l-sexualite-handicap','Sexualité et handicap','Relations & consentement','avancé',10,45,'♿','/assets/covers/handicap.svg',
 'Aborder la sexualité et les relations affectives en situation de handicap.',
 array['handicap','sexualité','droits','inclusion']::text[],
 '[{"heading":"Le droit à la sexualité","body":"Toute personne, quel que soit son handicap, a droit à une vie affective et sexuelle. Ce droit est reconnu par la Convention ONU relative aux droits des personnes handicapées.","keyPoints":["Droit reconnu par l''ONU.","Handicap ne supprime pas ce droit.","Accompagnement spécialisé disponible."]},{"heading":"Les défis spécifiques","body":"Des barrières physiques, psychologiques ou sociales peuvent compliquer les relations. Des professionnels spécialisés (assistants de vie, psychologues) peuvent aider à les surmonter.","keyPoints":["Barrières physiques, psychologiques, sociales.","Accompagnement spécialisé.","Communication et adaptation clés."]},{"heading":"Ressources et accompagnement","body":"Des associations locales et internationales soutiennent les personnes handicapées dans leur vie affective. N''hésite pas à contacter un expert WeToo ou une ONG spécialisée.","keyPoints":["Associations spécialisées.","Experts WeToo disponibles.","Tu n''es pas seul·e."]}]'::jsonb,
 '[{"title":"ONU — Convention droits des personnes handicapées","url":"https://www.un.org/development/desa/disabilities/"}]'::jsonb, 25)

on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- QUIZ (15)
-- ---------------------------------------------------------------------------
insert into public.quizzes (id, title, topic, points, emoji, description, questions, position) values

('quiz-puberte','Puberté : vrai ou faux ?','Corps & puberté',25,'🌷','Teste tes connaissances sur les changements du corps à l''adolescence.',
 '[{"id":"qp1","question":"La puberté commence au même âge pour tout le monde.","options":[{"id":"qp1-o1","text":"Vrai"},{"id":"qp1-o2","text":"Faux"}],"correctOptionIds":["qp1-o2"],"multi":false,"explanation":"Faux. Le rythme est différent pour chaque personne."},{"id":"qp2","question":"Les émissions nocturnes chez les garçons sont normales.","options":[{"id":"qp2-o1","text":"Vrai"},{"id":"qp2-o2","text":"Faux"}],"correctOptionIds":["qp2-o1"],"multi":false,"explanation":"Vrai. Elles font partie du fonctionnement normal du corps."},{"id":"qp3","question":"Les changements d''humeur pendant la puberté sont anormaux.","options":[{"id":"qp3-o1","text":"Vrai"},{"id":"qp3-o2","text":"Faux"}],"correctOptionIds":["qp3-o2"],"multi":false,"explanation":"Faux. Les hormones rendent les émotions plus fortes, c''est courant."},{"id":"qp4","question":"À 16 ans sans règles, il vaut mieux consulter.","options":[{"id":"qp4-o1","text":"Vrai"},{"id":"qp4-o2","text":"Faux"}],"correctOptionIds":["qp4-o1"],"multi":false,"explanation":"Vrai. Une absence de règles à 16 ans mérite un avis médical."},{"id":"qp5","question":"La transpiration augmente pendant la puberté.","options":[{"id":"qp5-o1","text":"Vrai"},{"id":"qp5-o2","text":"Faux"}],"correctOptionIds":["qp5-o1"],"multi":false,"explanation":"Vrai. Les glandes sudoripares deviennent plus actives."}]'::jsonb, 1),

('quiz-regles','Règles & hygiène','Règles & hygiène',25,'🩸','Vérifie ce que tu sais sur le cycle menstruel et l''hygiène.',
 '[{"id":"qr1","question":"Combien de temps durent les règles en moyenne ?","options":[{"id":"qr1-o1","text":"1 jour"},{"id":"qr1-o2","text":"3 à 7 jours"},{"id":"qr1-o3","text":"15 jours"}],"correctOptionIds":["qr1-o2"],"multi":false,"explanation":"En moyenne 3 à 7 jours."},{"id":"qr2","question":"À quelle fréquence changer sa protection ?","options":[{"id":"qr2-o1","text":"1 fois par jour"},{"id":"qr2-o2","text":"Toutes les 4 à 6 heures"},{"id":"qr2-o3","text":"Une fois par semaine"}],"correctOptionIds":["qr2-o2"],"multi":false,"explanation":"Toutes les 4 à 6 heures."},{"id":"qr3","question":"Un cycle irrégulier les premières années est normal.","options":[{"id":"qr3-o1","text":"Vrai"},{"id":"qr3-o2","text":"Faux"}],"correctOptionIds":["qr3-o1"],"multi":false,"explanation":"Vrai. La régularité vient avec le temps."},{"id":"qr4","question":"Une douleur qui empêche d''aller à l''école chaque mois est normale.","options":[{"id":"qr4-o1","text":"Vrai"},{"id":"qr4-o2","text":"Faux"}],"correctOptionIds":["qr4-o2"],"multi":false,"explanation":"Faux. Une douleur invalidante doit être évaluée."},{"id":"qr5","question":"Un cycle normal dure entre 21 et 35 jours.","options":[{"id":"qr5-o1","text":"Vrai"},{"id":"qr5-o2","text":"Faux"}],"correctOptionIds":["qr5-o1"],"multi":false,"explanation":"Vrai. C''est la plage normale."}]'::jsonb, 2),

('quiz-contraception','Contraception : les bases','Contraception',30,'💊','Saurez-vous choisir la bonne réponse sur la contraception ?',
 '[{"id":"qc1","question":"Quelle méthode protège à la fois des IST et de la grossesse ?","options":[{"id":"qc1-o1","text":"La pilule"},{"id":"qc1-o2","text":"Le préservatif"},{"id":"qc1-o3","text":"L''implant"}],"correctOptionIds":["qc1-o2"],"multi":false,"explanation":"Seul le préservatif protège aussi des IST."},{"id":"qc2","question":"La pilule du lendemain est une méthode régulière.","options":[{"id":"qc2-o1","text":"Vrai"},{"id":"qc2-o2","text":"Faux"}],"correctOptionIds":["qc2-o2"],"multi":false,"explanation":"Faux. C''est une méthode d''urgence."},{"id":"qc3","question":"L''implant et le stérilet sont parmi les méthodes les plus efficaces.","options":[{"id":"qc3-o1","text":"Vrai"},{"id":"qc3-o2","text":"Faux"}],"correctOptionIds":["qc3-o1"],"multi":false,"explanation":"Vrai. Leur efficacité est élevée."},{"id":"qc4","question":"Où se procurer une contraception au Bénin ?","options":[{"id":"qc4-o1","text":"Nulle part"},{"id":"qc4-o2","text":"En centre de santé ou planning familial"},{"id":"qc4-o3","text":"Uniquement à l''étranger"}],"correctOptionIds":["qc4-o2"],"multi":false,"explanation":"Dans les centres de santé et de planification familiale."},{"id":"qc5","question":"La contraception doit être choisie uniquement par le partenaire masculin.","options":[{"id":"qc5-o1","text":"Vrai"},{"id":"qc5-o2","text":"Faux"}],"correctOptionIds":["qc5-o2"],"multi":false,"explanation":"Faux. La décision appartient librement à la personne concernée."}]'::jsonb, 3),

('quiz-preservatif','Le préservatif, sans erreur','Contraception',25,'🛡️','Vérifie ta maîtrise de l''usage correct du préservatif.',
 '[{"id":"qz1","question":"Comment ouvrir l''emballage ?","options":[{"id":"qz1-o1","text":"Avec les dents"},{"id":"qz1-o2","text":"Avec les doigts"},{"id":"qz1-o3","text":"Avec des ciseaux"}],"correctOptionIds":["qz1-o2"],"multi":false,"explanation":"Avec les doigts, pour ne pas déchirer le préservatif."},{"id":"qz2","question":"Faut-il pincer le bout du préservatif ?","options":[{"id":"qz2-o1","text":"Oui, pour chasser l''air"},{"id":"qz2-o2","text":"Non"}],"correctOptionIds":["qz2-o1"],"multi":false,"explanation":"Oui, pour chasser l''air et éviter les ruptures."},{"id":"qz3","question":"Peut-on réutiliser un préservatif ?","options":[{"id":"qz3-o1","text":"Oui"},{"id":"qz3-o2","text":"Non"}],"correctOptionIds":["qz3-o2"],"multi":false,"explanation":"Non, jamais. Un préservatif par rapport."},{"id":"qz4","question":"L''huile de palme fragilise le préservatif en latex.","options":[{"id":"qz4-o1","text":"Vrai"},{"id":"qz4-o2","text":"Faux"}],"correctOptionIds":["qz4-o1"],"multi":false,"explanation":"Vrai. L''huile abîme le latex."},{"id":"qz5","question":"Quand faut-il mettre le préservatif ?","options":[{"id":"qz5-o1","text":"Après le rapport"},{"id":"qz5-o2","text":"Avant tout contact"},{"id":"qz5-o3","text":"N''importe quand"}],"correctOptionIds":["qz5-o2"],"multi":false,"explanation":"Avant tout contact génital."}]'::jsonb, 4),

('quiz-ist','IST : démêler le vrai du faux','IST & dépistage',30,'🦠','Testez vos connaissances sur les infections sexuellement transmissibles.',
 '[{"id":"qi1","question":"Le VIH se transmet par un baiser.","options":[{"id":"qi1-o1","text":"Vrai"},{"id":"qi1-o2","text":"Faux"}],"correctOptionIds":["qi1-o2"],"multi":false,"explanation":"Faux. Le VIH ne se transmet pas par la salive."},{"id":"qi2","question":"Toutes les IST donnent des symptômes visibles.","options":[{"id":"qi2-o1","text":"Vrai"},{"id":"qi2-o2","text":"Faux"}],"correctOptionIds":["qi2-o2"],"multi":false,"explanation":"Faux. Beaucoup sont silencieuses."},{"id":"qi3","question":"La plupart des IST se soignent bien.","options":[{"id":"qi3-o1","text":"Vrai"},{"id":"qi3-o2","text":"Faux"}],"correctOptionIds":["qi3-o1"],"multi":false,"explanation":"Vrai, surtout détectées tôt."},{"id":"qi4","question":"On peut se soigner une IST seul·e avec des médicaments restants.","options":[{"id":"qi4-o1","text":"Vrai"},{"id":"qi4-o2","text":"Faux"}],"correctOptionIds":["qi4-o2"],"multi":false,"explanation":"Faux. Cela peut aggraver l''infection."},{"id":"qi5","question":"Le dépistage est confidentiel.","options":[{"id":"qi5-o1","text":"Vrai"},{"id":"qi5-o2","text":"Faux"}],"correctOptionIds":["qi5-o1"],"multi":false,"explanation":"Vrai."}]'::jsonb, 5),

('quiz-consentement','Consentement : le comprendre','Relations & consentement',25,'🤝','Le consentement n''a pas de secret : vérifie-le.',
 '[{"id":"qs1","question":"Le silence signifie un accord.","options":[{"id":"qs1-o1","text":"Vrai"},{"id":"qs1-o2","text":"Faux"}],"correctOptionIds":["qs1-o2"],"multi":false,"explanation":"Faux. Le silence n''est jamais un oui."},{"id":"qs2","question":"Le consentement peut être retiré à tout moment.","options":[{"id":"qs2-o1","text":"Vrai"},{"id":"qs2-o2","text":"Faux"}],"correctOptionIds":["qs2-o1"],"multi":false,"explanation":"Vrai."},{"id":"qs3","question":"Une personne très ivre peut donner un consentement valable.","options":[{"id":"qs3-o1","text":"Vrai"},{"id":"qs3-o2","text":"Faux"}],"correctOptionIds":["qs3-o2"],"multi":false,"explanation":"Faux. L''alcool empêche un consentement libre."},{"id":"qs4","question":"Respecter un non renforce la confiance.","options":[{"id":"qs4-o1","text":"Vrai"},{"id":"qs4-o2","text":"Faux"}],"correctOptionIds":["qs4-o1"],"multi":false,"explanation":"Vrai. Le respect est la base d''une relation saine."},{"id":"qs5","question":"Un mineur peut légalement consentir à une relation sexuelle avec un adulte.","options":[{"id":"qs5-o1","text":"Vrai"},{"id":"qs5-o2","text":"Faux"}],"correctOptionIds":["qs5-o2"],"multi":false,"explanation":"Faux. Un mineur ne peut légalement consentir."}]'::jsonb, 6),

('quiz-sante-mentale','Santé mentale : les bons réflexes','Santé mentale',30,'🧠','Comment prendre soin de son mental ?',
 '[{"id":"qm1","question":"La dépression, c''est un manque de volonté.","options":[{"id":"qm1-o1","text":"Vrai"},{"id":"qm1-o2","text":"Faux"}],"correctOptionIds":["qm1-o2"],"multi":false,"explanation":"Faux. C''est une vraie souffrance qui se soigne."},{"id":"qm2","question":"Respirer lentement peut aider à calmer le stress.","options":[{"id":"qm2-o1","text":"Vrai"},{"id":"qm2-o2","text":"Faux"}],"correctOptionIds":["qm2-o1"],"multi":false,"explanation":"Vrai."},{"id":"qm3","question":"Demander de l''aide est un signe de faiblesse.","options":[{"id":"qm3-o1","text":"Vrai"},{"id":"qm3-o2","text":"Faux"}],"correctOptionIds":["qm3-o2"],"multi":false,"explanation":"Faux. C''est un signe de courage."},{"id":"qm4","question":"Si tu penses à en finir, il faut attendre que ça passe seul.","options":[{"id":"qm4-o1","text":"Vrai"},{"id":"qm4-o2","text":"Faux"}],"correctOptionIds":["qm4-o2"],"multi":false,"explanation":"Faux. Il faut une aide immédiate : le 137."},{"id":"qm5","question":"L''anxiété persistante peut être traitée.","options":[{"id":"qm5-o1","text":"Vrai"},{"id":"qm5-o2","text":"Faux"}],"correctOptionIds":["qm5-o1"],"multi":false,"explanation":"Vrai. Thérapie et parfois médicaments."}]'::jsonb, 7),

('quiz-mythes','Grand quiz : briseur de mythes','Mythes & idées fausses',35,'💥','Démolis les idées fausses les plus courantes sur la santé sexuelle.',
 '[{"id":"qy1","question":"La pilule rend stérile.","options":[{"id":"qy1-o1","text":"Vrai"},{"id":"qy1-o2","text":"Faux"}],"correctOptionIds":["qy1-o2"],"multi":false,"explanation":"Faux. La pilule n''affecte pas la fertilité à long terme."},{"id":"qy2","question":"La fellation ne présente aucun risque d''IST.","options":[{"id":"qy2-o1","text":"Vrai"},{"id":"qy2-o2","text":"Faux"}],"correctOptionIds":["qy2-o2"],"multi":false,"explanation":"Faux. Certaines IST se transmettent par la fellation."},{"id":"qy3","question":"La première fois, on ne peut pas tomber enceinte.","options":[{"id":"qy3-o1","text":"Vrai"},{"id":"qy3-o2","text":"Faux"}],"correctOptionIds":["qy3-o2"],"multi":false,"explanation":"Faux. Une grossesse est possible dès le premier rapport."},{"id":"qy4","question":"Se laver après un rapport protège des IST.","options":[{"id":"qy4-o1","text":"Vrai"},{"id":"qy4-o2","text":"Faux"}],"correctOptionIds":["qy4-o2"],"multi":false,"explanation":"Faux. Seul le préservatif protège."},{"id":"qy5","question":"On peut deviner si quelqu''un a une IST rien qu''en le regardant.","options":[{"id":"qy5-o1","text":"Vrai"},{"id":"qy5-o2","text":"Faux"}],"correctOptionIds":["qy5-o2"],"multi":false,"explanation":"Faux. Beaucoup d''IST sont silencieuses."}]'::jsonb, 8),

('quiz-sommeil','Sommeil : connais-tu tes besoins ?','Bien-être & prévention',20,'😴','Teste tes connaissances sur le sommeil et son importance.',
 '[{"id":"qso1","question":"Combien d''heures de sommeil recommande-t-on aux adolescents ?","options":[{"id":"qso1-o1","text":"5 à 6 heures"},{"id":"qso1-o2","text":"8 à 10 heures"},{"id":"qso1-o3","text":"12 heures"}],"correctOptionIds":["qso1-o2"],"multi":false,"explanation":"8 à 10 heures par nuit."},{"id":"qso2","question":"Les écrans avant dormir améliorent l''endormissement.","options":[{"id":"qso2-o1","text":"Vrai"},{"id":"qso2-o2","text":"Faux"}],"correctOptionIds":["qso2-o2"],"multi":false,"explanation":"Faux. La lumière bleue retarde l''endormissement."},{"id":"qso3","question":"Le manque de sommeil peut augmenter le stress.","options":[{"id":"qso3-o1","text":"Vrai"},{"id":"qso3-o2","text":"Faux"}],"correctOptionIds":["qso3-o1"],"multi":false,"explanation":"Vrai. Le sommeil régule les émotions."}]'::jsonb, 9),

('quiz-nutrition','Nutrition et santé','Bien-être & prévention',20,'🥗','Teste tes connaissances sur l''alimentation et la santé.',
 '[{"id":"qn1","question":"Le fer est important pour les filles en période de règles.","options":[{"id":"qn1-o1","text":"Vrai"},{"id":"qn1-o2","text":"Faux"}],"correctOptionIds":["qn1-o1"],"multi":false,"explanation":"Vrai. Les règles entraînent une perte de fer."},{"id":"qn2","question":"Les sodas remplacent efficacement l''eau.","options":[{"id":"qn2-o1","text":"Vrai"},{"id":"qn2-o2","text":"Faux"}],"correctOptionIds":["qn2-o2"],"multi":false,"explanation":"Faux. L''eau reste irremplaçable."},{"id":"qn3","question":"Une alimentation équilibrée peut influencer l''humeur.","options":[{"id":"qn3-o1","text":"Vrai"},{"id":"qn3-o2","text":"Faux"}],"correctOptionIds":["qn3-o1"],"multi":false,"explanation":"Vrai. Ce qu''on mange affecte le cerveau et l''humeur."},{"id":"qn4","question":"Combien de litres d''eau faut-il boire par jour ?","options":[{"id":"qn4-o1","text":"0,5 litre"},{"id":"qn4-o2","text":"1,5 à 2 litres"},{"id":"qn4-o3","text":"5 litres"}],"correctOptionIds":["qn4-o2"],"multi":false,"explanation":"1,5 à 2 litres par jour minimum."}]'::jsonb, 10),

('quiz-droits','Tes droits en santé sexuelle','Relations & consentement',25,'⚖️','Connais-tu tes droits en matière de santé sexuelle ?',
 '[{"id":"qd1","question":"Un médecin peut refuser de te soigner parce que tu es jeune.","options":[{"id":"qd1-o1","text":"Vrai"},{"id":"qd1-o2","text":"Faux"}],"correctOptionIds":["qd1-o2"],"multi":false,"explanation":"Faux. Les soins ne peuvent pas être refusés sur cette base."},{"id":"qd2","question":"Un médecin peut divulguer tes informations de santé à tes parents sans ton accord.","options":[{"id":"qd2-o1","text":"Vrai"},{"id":"qd2-o2","text":"Faux"}],"correctOptionIds":["qd2-o2"],"multi":false,"explanation":"Faux. Le secret médical s''applique."},{"id":"qd3","question":"La loi béninoise de 2021 protège le droit à la contraception.","options":[{"id":"qd3-o1","text":"Vrai"},{"id":"qd3-o2","text":"Faux"}],"correctOptionIds":["qd3-o1"],"multi":false,"explanation":"Vrai."},{"id":"qd4","question":"Les jeunes ont le droit d''accéder à l''information sur la santé sexuelle.","options":[{"id":"qd4-o1","text":"Vrai"},{"id":"qd4-o2","text":"Faux"}],"correctOptionIds":["qd4-o1"],"multi":false,"explanation":"Vrai. C''est un droit humain fondamental."}]'::jsonb, 11),

('quiz-violence-genre','Violences basées sur le genre','Relations & consentement',30,'🚨','Teste ta compréhension des VBG.',
 '[{"id":"qvg1","question":"La violence psychologique (insultes, humiliations) est une forme de VBG.","options":[{"id":"qvg1-o1","text":"Vrai"},{"id":"qvg1-o2","text":"Faux"}],"correctOptionIds":["qvg1-o1"],"multi":false,"explanation":"Vrai. La VBG inclut les violences psychologiques."},{"id":"qvg2","question":"Un homme peut aussi être victime de VBG.","options":[{"id":"qvg2-o1","text":"Vrai"},{"id":"qvg2-o2","text":"Faux"}],"correctOptionIds":["qvg2-o1"],"multi":false,"explanation":"Vrai. Même si les femmes sont les principales victimes."},{"id":"qvg3","question":"La VBG est un problème privé qui ne concerne pas la société.","options":[{"id":"qvg3-o1","text":"Vrai"},{"id":"qvg3-o2","text":"Faux"}],"correctOptionIds":["qvg3-o2"],"multi":false,"explanation":"Faux. C''est un problème de société qui nécessite une réponse collective."},{"id":"qvg4","question":"Le numéro d''écoute 137 au Bénin peut aider les victimes.","options":[{"id":"qvg4-o1","text":"Vrai"},{"id":"qvg4-o2","text":"Faux"}],"correctOptionIds":["qvg4-o1"],"multi":false,"explanation":"Vrai."}]'::jsonb, 12),

('quiz-cyberharcèlement','Sécurité en ligne','Bien-être & prévention',20,'💻','Sais-tu te protéger en ligne ?',
 '[{"id":"qcyb1","question":"Partager des photos intimes en ligne est toujours risqué.","options":[{"id":"qcyb1-o1","text":"Vrai"},{"id":"qcyb1-o2","text":"Faux"}],"correctOptionIds":["qcyb1-o1"],"multi":false,"explanation":"Vrai. Tout peut être copié et diffusé."},{"id":"qcyb2","question":"On peut ignorer le cyberharcèlement, ça finit toujours par s''arrêter.","options":[{"id":"qcyb2-o1","text":"Vrai"},{"id":"qcyb2-o2","text":"Faux"}],"correctOptionIds":["qcyb2-o2"],"multi":false,"explanation":"Faux. Il faut documenter, bloquer et signaler."},{"id":"qcyb3","question":"Régler la confidentialité de ses profils aide à se protéger.","options":[{"id":"qcyb3-o1","text":"Vrai"},{"id":"qcyb3-o2","text":"Faux"}],"correctOptionIds":["qcyb3-o1"],"multi":false,"explanation":"Vrai."}]'::jsonb, 13),

('quiz-ist-avance','IST avancé : approfondir','IST & dépistage',40,'🔬','Pour ceux qui veulent tout savoir sur les IST.',
 '[{"id":"qia1","question":"La syphilis peut se transmettre de la mère à l''enfant pendant la grossesse.","options":[{"id":"qia1-o1","text":"Vrai"},{"id":"qia1-o2","text":"Faux"}],"correctOptionIds":["qia1-o1"],"multi":false,"explanation":"Vrai. C''est la syphilis congénitale."},{"id":"qia2","question":"Le VIH peut être contrôlé par le traitement ARV au point de rendre la charge virale indétectable.","options":[{"id":"qia2-o1","text":"Vrai"},{"id":"qia2-o2","text":"Faux"}],"correctOptionIds":["qia2-o1"],"multi":false,"explanation":"Vrai. Une charge indétectable signifie non transmissible."},{"id":"qia3","question":"La PrEP est un médicament préventif contre le VIH.","options":[{"id":"qia3-o1","text":"Vrai"},{"id":"qia3-o2","text":"Faux"}],"correctOptionIds":["qia3-o1"],"multi":false,"explanation":"Vrai. La PrEP (prophylaxie pré-exposition) réduit fortement le risque d''infection."},{"id":"qia4","question":"Le test de dépistage VIH détecte l''infection dès le lendemain du rapport.","options":[{"id":"qia4-o1","text":"Vrai"},{"id":"qia4-o2","text":"Faux"}],"correctOptionIds":["qia4-o2"],"multi":false,"explanation":"Faux. Il faut respecter un délai (fenêtre sérologique) de plusieurs semaines."}]'::jsonb, 14),

('quiz-bien-etre','Bien-être global','Bien-être & prévention',25,'🌟','Un quiz complet sur ton bien-être au quotidien.',
 '[{"id":"qbe1","question":"L''activité physique régulière aide à réduire le stress.","options":[{"id":"qbe1-o1","text":"Vrai"},{"id":"qbe1-o2","text":"Faux"}],"correctOptionIds":["qbe1-o1"],"multi":false,"explanation":"Vrai. Elle libère des endorphines."},{"id":"qbe2","question":"La méditation peut aider à gérer l''anxiété.","options":[{"id":"qbe2-o1","text":"Vrai"},{"id":"qbe2-o2","text":"Faux"}],"correctOptionIds":["qbe2-o1"],"multi":false,"explanation":"Vrai."},{"id":"qbe3","question":"Parler à quelqu''un de ses problèmes aggrave toujours les choses.","options":[{"id":"qbe3-o1","text":"Vrai"},{"id":"qbe3-o2","text":"Faux"}],"correctOptionIds":["qbe3-o2"],"multi":false,"explanation":"Faux. Parler réduit souvent la charge émotionnelle."},{"id":"qbe4","question":"Se comparer aux autres sur les réseaux sociaux peut nuire à l''estime de soi.","options":[{"id":"qbe4-o1","text":"Vrai"},{"id":"qbe4-o2","text":"Faux"}],"correctOptionIds":["qbe4-o1"],"multi":false,"explanation":"Vrai. Les réseaux montrent une réalité filtrée et irréaliste."},{"id":"qbe5","question":"Les personnes qui cherchent de l''aide sont faibles.","options":[{"id":"qbe5-o1","text":"Vrai"},{"id":"qbe5-o2","text":"Faux"}],"correctOptionIds":["qbe5-o2"],"multi":false,"explanation":"Faux. Demander de l''aide est un signe de force."}]'::jsonb, 15)

on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- MYTHES ET VÉRITÉS (40)
-- ---------------------------------------------------------------------------
insert into public.myths (id, myth, truth, category, source) values
  ('m01','La pilule contraceptive rend stérile.',                              'Faux. La pilule empêche temporairement l''ovulation mais n''altère pas la fertilité à long terme.', 'Contraception','OMS'),
  ('m02','La fellation ne présente aucun risque d''IST.',                      'Faux. Certaines IST (herpès, gonorrhée, chlamydia, VIH dans de rares cas) peuvent se transmettre par la fellation.', 'IST','OMS'),
  ('m03','La première fois, on ne peut pas tomber enceinte.',                  'Faux. Une grossesse est possible dès le premier rapport sexuel.', 'Grossesse','UNFPA'),
  ('m04','Le VIH se transmet par le baiser.',                                  'Faux. Le VIH ne se transmet pas par la salive, les baisers, les câlins ou le partage d''un repas.', 'IST','ONUSIDA'),
  ('m05','On ne peut pas avoir d''IST sans symptômes.',                        'Faux. De nombreuses IST sont silencieuses ; seul le dépistage permet de savoir.', 'IST','OMS'),
  ('m06','Se laver après un rapport protège des IST.',                         'Faux. Le lavage ne protège pas ; seul le préservatif réduit le risque.', 'IST','OMS'),
  ('m07','Les contraceptifs font grossir, donc ils sont mauvais.',             'Les effets varient selon les personnes. Un professionnel peut aider à trouver la méthode adaptée.', 'Contraception','OMS'),
  ('m08','Tirer le préservatif avec les dents, c''est plus rapide.',          'Faux. On l''ouvre avec les doigts, sinon on risque de le déchirer.', 'Contraception','OMS'),
  ('m09','Si une fille dit non, elle veut dire oui.',                          'Faux et grave. Non, c''est non. Le consentement doit être clair et enthousiaste.', 'Consentement','UNFPA'),
  ('m10','La dépression, ce n''est pas une vraie maladie.',                   'Faux. C''est un trouble réel qui se soigne ; en parler sauve des vies.', 'Santé mentale','OMS'),
  ('m11','Les règles sont sales ou honteuses.',                                'Faux. Les règles sont un phénomène naturel et sain ; il n''y a aucune honte.', 'Hygiène menstruelle','UNICEF'),
  ('m12','La masturbation provoque des problèmes de santé.',                  'Faux. La masturbation est naturelle et sans danger pour la santé.', 'Corps & puberté','OMS'),
  ('m13','On peut se soigner une IST tout seul avec des médicaments restants.','Faux. S''automédiquer aggrave souvent l''infection. Il faut consulter un professionnel.', 'IST','OMS'),
  ('m14','Deux préservatifs valent mieux qu''un.',                             'Faux. Les superposer augmente le risque de rupture. Un seul, bien mis.', 'Contraception','OMS'),
  ('m15','Les personnes séropositives au VIH ne peuvent pas avoir d''enfants.','Faux. Avec un suivi médical adapté, une personne séropositive peut avoir des enfants sans transmettre le virus.', 'IST','ONUSIDA'),
  ('m16','L''homosexualité est une maladie.',                                  'Faux. L''OMS a retiré l''homosexualité de la liste des maladies mentales en 1990. C''est une orientation naturelle.', 'Droits','OMS'),
  ('m17','Une fille peut savoir si elle est enceinte immédiatement après un rapport.','Faux. La grossesse ne se détecte que quelques jours après (14 jours environ) avec un test de grossesse.', 'Grossesse','UNFPA'),
  ('m18','Le préservatif féminin est moins efficace que le préservatif masculin.','Faux. Bien utilisé, le préservatif féminin est aussi efficace.', 'Contraception','OMS'),
  ('m19','Un garçon ne peut pas avoir d''IST s''il ne présente aucun symptôme.','Faux. Beaucoup d''IST sont asymptomatiques chez les hommes aussi.', 'IST','OMS'),
  ('m20','Prendre la pilule du lendemain souvent n''a aucun risque.',         'Faux. La pilule du lendemain est une méthode d''urgence, pas régulière. Elle perturbe le cycle et ne protège pas des IST.', 'Contraception','OMS'),
  ('m21','Les règles s''arrêtent dans l''eau (bain, mer, piscine).',          'Faux. Les règles ne s''arrêtent pas dans l''eau mais la pression peut ralentir le flux temporairement.', 'Hygiène menstruelle','UNICEF'),
  ('m22','Le stress ne peut pas provoquer des problèmes physiques.',          'Faux. Le stress chronique peut causer des maux de tête, des douleurs abdominales, des troubles du sommeil et affaiblir le système immunitaire.', 'Santé mentale','OMS'),
  ('m23','La virginité d''une femme se voit toujours physiquement.',          'Faux. L''hymen varie naturellement en forme ; il n''est pas un indicateur de virginité.', 'Corps & puberté','OMS'),
  ('m24','Un rapport sexuel peut transmettre le coronavirus.',                 'Faux. Le COVID-19 se transmet principalement par voie respiratoire, pas sexuellement.', 'IST','OMS'),
  ('m25','Seules les personnes pauvres ou peu éduquées ont des IST.',         'Faux. N''importe qui peut contracter une IST. Ce n''est pas lié au statut social ou au niveau d''éducation.', 'IST','OMS'),
  ('m26','Une femme ne peut pas tomber enceinte pendant ses règles.',         'Faux. Même pendant les règles, une grossesse est possible car les spermatozoïdes peuvent survivre plusieurs jours.', 'Grossesse','UNFPA'),
  ('m27','Parler de sexualité aux jeunes les incite à avoir des rapports plus tôt.','Faux. Les études montrent que l''éducation sexuelle retarde les premiers rapports et réduit les comportements à risque.', 'Éducation','OMS/UNESCO'),
  ('m28','Le préservatif diminue le plaisir, donc les gens ne l''utilisent pas.','Le préservatif bien choisi (taille, lubrifiant) ne diminue pas le plaisir et sauve des vies. Le plaisir et la sécurité ne s''opposent pas.', 'Contraception','OMS'),
  ('m29','Les douleurs pendant les règles sont une punition ou une malédiction.','Faux. Les douleurs menstruelles (dysménorrhée) ont une cause physiologique. Elles peuvent être traitées médicalement.', 'Hygiène menstruelle','OMS'),
  ('m30','Un homme ne peut pas être victime de violences sexuelles.',         'Faux. Les hommes peuvent aussi être victimes de violences sexuelles. Ils ont le droit de demander de l''aide.', 'Consentement','UNFPA'),
  ('m31','Le VIH peut se transmettre par les moustiques.',                    'Faux. Le VIH ne survit pas dans le corps d''un moustique et ne peut pas se transmettre par leur piqûre.', 'IST','ONUSIDA'),
  ('m32','Être en couple stable protège des IST sans préservatif.',           'Faux. Sans dépistage mutuel récent, le risque subsiste. Le dépistage est la seule façon de savoir.', 'IST','OMS'),
  ('m33','Les médicaments traditionnels peuvent guérir le VIH.',              'Faux. Aucun médicament traditionnel ne guérit le VIH. Seul un traitement ARV prescrit par un médecin peut contrôler l''infection.', 'IST','ONUSIDA'),
  ('m34','L''anxiété et la dépression touchent uniquement les adultes.',      'Faux. Ces troubles peuvent affecter les adolescents et même les enfants. Il est important de ne pas ignorer les signes.', 'Santé mentale','OMS'),
  ('m35','Il faut être marié·e pour accéder à la contraception au Bénin.',   'Faux. La loi béninoise de 2021 permet à toute personne d''accéder aux services de planification familiale, quel que soit son statut marital.', 'Contraception','Gouvernement Bénin'),
  ('m36','Les personnes transgenres ont des problèmes de santé mentale.',     'Faux. La transidentité n''est pas un trouble mental. Les difficultés de santé mentale vécues par certaines personnes trans sont souvent dues au rejet social, pas à leur identité.', 'Droits','OMS'),
  ('m37','Un rapport non protégé unique ne peut pas transmettre une IST.',    'Faux. Une seule fois suffit pour transmettre une IST, y compris le VIH.', 'IST','OMS'),
  ('m38','Les filles ne peuvent pas avoir de désir sexuel.',                  'Faux. Le désir sexuel est universel et varie d''une personne à l''autre, indépendamment du genre.', 'Corps & puberté','OMS'),
  ('m39','La jalousie excessive est une preuve d''amour.',                    'Faux. La jalousie excessive est un signal d''alerte dans une relation. L''amour sain se base sur la confiance et le respect.', 'Consentement','OMS'),
  ('m40','L''éducation sexuelle devrait être réservée aux adultes.',          'Faux. Les jeunes ont besoin d''une éducation sexuelle adaptée à leur âge pour faire des choix éclairés et se protéger.', 'Éducation','UNESCO')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- BADGES (15)
-- ---------------------------------------------------------------------------
insert into public.badges (id, name, emoji, description, criteria, position) values
  ('b-first',       'Premier pas',               '👟', 'Bienvenue dans l''aventure WeToo ! Tu as rejoint la communauté.',        'Créer un compte sur WeToo.', 1),
  ('b-curieux',     'Curieux·se',                '🔎', 'Tu as terminé ta première leçon. La curiosité, c''est une force.',        'Terminer 1 leçon.', 2),
  ('b-allie',       'Allié·e',                   '🤝', 'Tu as soutenu un·e membre de la communauté.',                            'Réagir à un post ou publier une réponse.', 3),
  ('b-sans-tabou',  'Sans tabou',                '🗣️', 'Tu oses parler de santé sexuelle sans honte.',                          'Publier ou répondre 3 fois sur le forum.', 4),
  ('b-mythes',      'Briseur de mythes',         '💥', 'Tu déconstruis les idées fausses.',                                      'Réussir le quiz des mythes.', 5),
  ('b-soutien',     'Soutien de la communauté',  '💖', 'Tes réponses aident réellement les autres.',                            'Recevoir 5 réactions « utile » sur tes réponses.', 6),
  ('b-expert',      'Expert en devenir',         '🎓', 'Tu maîtrises de plus en plus de sujets.',                               'Terminer 5 leçons.', 7),
  ('b-regulier',    'Régulier·e',                '🔥', 'Tu reviens régulièrement : la régularité paie.',                        'Atteindre une série de 7 jours.', 8),
  ('b-sante',       'Esprit sain',               '🧘', 'Tu prends soin de ta santé mentale.',                                   'Terminer une leçon de santé mentale.', 9),
  ('b-ambassadeur', 'Ambassadrice/Ambassadeur',  '🏅', 'Tu es un pilier de la communauté WeToo.',                               'Atteindre 1000 points.', 10),
  ('b-protecteur',  'Protecteur·trice',          '🛡️', 'Tu prêches la prévention dans ton entourage.',                         'Terminer les leçons sur le préservatif et les IST.', 11),
  ('b-marathon',    'Marathon',                  '🏃', 'Tu tiens la distance — une série de 30 jours consécutifs.',             'Atteindre une série de 30 jours.', 12),
  ('b-quizzeur',    'Maître du quiz',            '🧩', 'Tu as répondu à au moins 10 quiz.',                                     'Compléter 10 quiz.', 13),
  ('b-champion',    'Champion·ne WeToo',         '🏆', 'Tu as atteint le top 10 du classement communautaire.',                  'Être dans le top 10 du classement.', 14),
  ('b-veilleur',    'Veilleur·se de nuit',       '🌙', 'Tu as consulté WeToo après minuit — la plateforme est là pour toi 24h/24.', 'Se connecter entre 0h et 5h.', 15)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- CAMPAGNES COMMUNAUTAIRES (12)
-- ---------------------------------------------------------------------------
insert into public.campaigns (id, month, title, theme, emoji, date_label, description, hashtags, participants, status, resources, schedule, facts, position) values

('c-contraception','Janvier','Janvier sans stress : la contraception expliquée','Contraception','💊','Tout le mois de janvier',
 'Un mois pour découvrir les méthodes contraceptives et trouver celle qui te convient, sans tabou.',
 array['#WeTooContraception','#MonChoixMonCorps']::text[], 412, 'past',
 '[{"label":"Guide des méthodes contraceptives","type":"pdf"},{"label":"Où trouver une sage-femme près de toi","type":"article"}]'::jsonb,
 '[{"day":"Semaine 1","label":"Lancement & quiz de sensibilisation","activity":"Quiz contraception"},{"day":"Semaine 2","label":"Live avec une sage-femme","activity":"Questions/réponses en direct"},{"day":"Semaine 3","label":"Témoignages et partage","activity":"Forum"},{"day":"Semaine 4","label":"Bilan du mois","activity":"Synthèse et ressources"}]'::jsonb,
 '["La contraception est disponible dans les centres de planification familiale au Bénin.","Seul le préservatif protège aussi des IST.","La pilule du lendemain est une méthode d''urgence."]'::jsonb, 1),

('c-sante-mentale','Février','Février bienveillant : parlons santé mentale','Santé mentale','🧠','Tout le mois de février',
 'Briser le silence autour de la santé mentale et rappeler que demander de l''aide est une force.',
 array['#WeTooMentalHealth','#CaVaAller']::text[], 530, 'past',
 '[{"label":"Techniques anti-stress","type":"article"},{"label":"Contacter un psychologue","type":"contact"}]'::jsonb,
 '[{"day":"Semaine 1","label":"Reconnaître ses émotions","activity":"Ateliers forum"},{"day":"Semaine 2","label":"Live psychologue","activity":"Réponses en direct"},{"day":"Semaine 3","label":"Défi bien-être 7 jours","activity":"Challenge quotidien"},{"day":"Semaine 4","label":"Témoignages","activity":"Partage bienveillant"}]'::jsonb,
 '["1 jeune sur 7 vit avec un trouble de santé mentale.","Parler réduit la souffrance.","Aucune émotion n''est honteuse."]'::jsonb, 2),

('c-depistage','Mars','Mars : connaître son statut, c''est se protéger','Dépistage VIH','🧪','Tout le mois de mars',
 'Un mois dédié au dépistage du VIH et des IST, gratuit et confidentiel.',
 array['#JeMeDepiste','#WeTooSante']::text[], 356, 'past',
 '[{"label":"Centres de dépistage au Bénin","type":"article"},{"label":"Ligne d''écoute santé 137","type":"contact"}]'::jsonb,
 '[{"day":"Semaine 1","label":"Démystifier le VIH","activity":"Quiz & infos"},{"day":"Semaine 2","label":"Journée dépistage communautaire","activity":"Mobilisation"},{"day":"Semaine 3","label":"Live avec un infirmier","activity":"Q/R"},{"day":"Semaine 4","label":"Témoignages de jeunes dépistés","activity":"Partage"}]'::jsonb,
 '["Le dépistage du VIH est confidentiel et souvent gratuit.","Un traitement précoce permet de vivre en bonne santé.","Se dépister, c''est se respecter et respecter les autres."]'::jsonb, 3),

('c-consentement','Avril','Avril : le consentement, on en parle','Consentement','🤝','Tout le mois d''avril',
 'Comprendre le consentement et construire des relations respectueuses.',
 array['#ConsentementOui','#WeTooRespect']::text[], 288, 'active',
 '[{"label":"Guide du consentement","type":"pdf"},{"label":"Signaler une situation","type":"form"}]'::jsonb,
 '[{"day":"Semaine 1","label":"C''est quoi le consentement ?","activity":"Infographies"},{"day":"Semaine 2","label":"Reconnaître une relation toxique","activity":"Atelier forum"},{"day":"Semaine 3","label":"Live avec une psychologue","activity":"Q/R"},{"day":"Semaine 4","label":"Engagement communautaire","activity":"Signature de charte"}]'::jsonb,
 '["Le consentement doit être libre, clair et enthousiaste.","Il peut être retiré à tout moment.","Le respect protège tout le monde."]'::jsonb, 4),

('c-hygiene','Mai','Mai : règles et hygiène, sans tabou','Hygiène menstruelle','🩸','Tout le mois de mai',
 'Lutter contre la précarité menstruelle et les tabous autour des règles.',
 array['#PasDeHonte','#WeTooMenstrues']::text[], 401, 'active',
 '[{"label":"Bien choisir sa protection","type":"article"},{"label":"Distribuer des serviettes","type":"action"}]'::jsonb,
 '[{"day":"Semaine 1","label":"Comprendre son cycle","activity":"Cours & quiz"},{"day":"Semaine 2","label":"Collecte de protections","activity":"Solidarité"},{"day":"Semaine 3","label":"Live sage-femme","activity":"Q/R"},{"day":"Semaine 4","label":"Bilan et engagement","activity":"Synthèse"}]'::jsonb,
 '["Les règles sont naturelles et saines.","Une bonne hygiène évite les infections.","Aucune fille ne doit manquer l''école à cause de ses règles."]'::jsonb, 5),

('c-numerique','Juin','Juin : bien-être numérique','Bien-être numérique','📱','Tout le mois de juin',
 'Prendre soin de son esprit à l''ère des écrans et des réseaux sociaux.',
 array['#DeconnexionUtile','#WeTooDigital']::text[], 275, 'upcoming',
 '[{"label":"Hygiène numérique","type":"article"},{"label":"Gérer son image en ligne","type":"video"}]'::jsonb,
 '[{"day":"Semaine 1","label":"Écrans et sommeil","activity":"Atelier"},{"day":"Semaine 2","label":"Défi déconnexion","activity":"Challenge"},{"day":"Semaine 3","label":"Cyberharcèlement","activity":"Live"},{"day":"Semaine 4","label":"Bilan","activity":"Synthèse"}]'::jsonb,
 '["Trop d''écrans le soir nuit au sommeil.","Les réseaux sociaux peuvent abîmer l''image de soi.","Des pauses numériques font du bien."]'::jsonb, 6),

('c-violence-genre','Juillet','Juillet : zéro tolérance pour les violences','Violences basées sur le genre','🚨','Tout le mois de juillet',
 'Sensibiliser aux violences basées sur le genre et aux ressources disponibles pour les victimes.',
 array['#ZeroVBG','#WeTooVoix']::text[], 190, 'upcoming',
 '[{"label":"Guide VBG","type":"pdf"},{"label":"Numéros d''urgence","type":"contact"}]'::jsonb,
 '[{"day":"Semaine 1","label":"Reconnaître les formes de violence","activity":"Infographie"},{"day":"Semaine 2","label":"Témoignages","activity":"Forum"},{"day":"Semaine 3","label":"Live travailleur social","activity":"Q/R"},{"day":"Semaine 4","label":"Mobilisation communautaire","activity":"Action"}]'::jsonb,
 '["1 femme sur 3 dans le monde subit des violences.","La VBG se soigne et se combat.","Le 137 est disponible 24h/24."]'::jsonb, 7),

('c-alimentation','Août','Août : bien nourrir son corps et son âme','Nutrition & bien-être','🥗','Tout le mois d''août',
 'Explorer le lien entre alimentation, santé sexuelle et bien-être mental.',
 array['#MangerSain','#WetooNutrition']::text[], 160, 'upcoming',
 '[{"label":"Guide nutrition pour adolescents","type":"pdf"},{"label":"Recettes saines locales","type":"article"}]'::jsonb,
 '[{"day":"Semaine 1","label":"Nutrition de base","activity":"Cours"},{"day":"Semaine 2","label":"Fer et santé menstruelle","activity":"Quiz"},{"day":"Semaine 3","label":"Cuisiner en bonne santé","activity":"Atelier"},{"day":"Semaine 4","label":"Bilan","activity":"Synthèse"}]'::jsonb,
 '["Une alimentation variée stabilise l''humeur.","Le fer protège les filles des effets des règles.","Boire de l''eau est vital."]'::jsonb, 8),

('c-grossesse-ado','Septembre','Septembre : grossesses précoces, brisons le silence','Grossesse adolescente','👶','Tout le mois de septembre',
 'Informer sur la prévention de la grossesse adolescente et soutenir les jeunes mères.',
 array['#GrossesseAdolescenteBeninStop','#WeTooJeunesMères']::text[], 310, 'upcoming',
 '[{"label":"Droits des jeunes mères","type":"article"},{"label":"Centres de suivi prénatal","type":"contact"}]'::jsonb,
 '[{"day":"Semaine 1","label":"Réalités de la grossesse ado","activity":"Infographie"},{"day":"Semaine 2","label":"Contraception et prévention","activity":"Atelier"},{"day":"Semaine 3","label":"Live sage-femme","activity":"Q/R"},{"day":"Semaine 4","label":"Témoignages","activity":"Partage"}]'::jsonb,
 '["Le Bénin a un taux élevé de grossesses adolescentes.","La contraception préventive est disponible.","Les jeunes mères ont des droits."]'::jsonb, 9),

('c-ist-special','Octobre','Octobre rouge : sensibilisation au VIH/SIDA','VIH & IST','🎗️','Tout le mois d''octobre',
 'Mois spécial de sensibilisation au VIH, à la prévention et à la réduction de la stigmatisation.',
 array['#WeTooVIH','#SéropositifFier']::text[], 445, 'upcoming',
 '[{"label":"Comprendre les traitements ARV","type":"article"},{"label":"Se dépister","type":"contact"}]'::jsonb,
 '[{"day":"Semaine 1","label":"Vivre avec le VIH aujourd''hui","activity":"Témoignages"},{"day":"Semaine 2","label":"Dépistage gratuit","activity":"Mobilisation"},{"day":"Semaine 3","label":"Live médecin","activity":"Q/R"},{"day":"Semaine 4","label":"Concert WeToo","activity":"Événement"}]'::jsonb,
 '["Une personne séropositive traitée peut mener une vie normale.","La stigmatisation tue autant que le virus.","Le dépistage est un acte d''amour pour soi et les autres."]'::jsonb, 10),

('c-estime-soi','Novembre','Novembre : je m''aime tel·le que je suis','Estime de soi','🪞','Tout le mois de novembre',
 'Un mois dédié à l''amour de soi, à l''image corporelle positive et à la confiance.',
 array['#JeMaimeTelQueSuis','#WeTooConfiance']::text[], 525, 'upcoming',
 '[{"label":"Guide estime de soi","type":"pdf"},{"label":"Journal de gratitude","type":"outil"}]'::jsonb,
 '[{"day":"Semaine 1","label":"L''image de soi","activity":"Quiz & infos"},{"day":"Semaine 2","label":"Défi journal de gratitude","activity":"Challenge"},{"day":"Semaine 3","label":"Live psychologue","activity":"Q/R"},{"day":"Semaine 4","label":"Portraits communautaires","activity":"Partage créatif"}]'::jsonb,
 '["L''image de soi se construit tout au long de la vie.","Les réseaux sociaux présentent une réalité filtrée.","Prendre soin de soi est un acte révolutionnaire."]'::jsonb, 11),

('c-bilan-annuel','Décembre','Décembre solidaire : bilan et projets 2027','Bilan annuel','🌟','Tout le mois de décembre',
 'Revenir sur une année WeToo, fêter les progrès et préparer l''avenir avec la communauté.',
 array['#WeTooMerci','#WeToo2027']::text[], 620, 'upcoming',
 '[{"label":"Rapport annuel WeToo 2026","type":"pdf"},{"label":"Suggestions pour 2027","type":"form"}]'::jsonb,
 '[{"day":"Semaine 1","label":"Bilan de l''année","activity":"Infographie communautaire"},{"day":"Semaine 2","label":"Remise des badges annuels","activity":"Cérémonie"},{"day":"Semaine 3","label":"Forum des idées 2027","activity":"Discussion"},{"day":"Semaine 4","label":"Message de fin d''année","activity":"Vidéo communautaire"}]'::jsonb,
 '["WeToo a accompagné des milliers de jeunes en 2026.","Ensemble, on change les choses.","2027 sera encore plus grand."]'::jsonb, 12)

on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- TÉMOIGNAGES (15)
-- ---------------------------------------------------------------------------
insert into public.testimonials (id, name, role, quote, avatar, age, position) values
  ('t01','Awa, 20 ans',    'Étudiante',         'WeToo m''a aidée à comprendre ma santé sans peur du jugement. J''ai enfin osé poser mes questions.',                                             '🌸', 20, 1),
  ('t02','Rodrigue, 23 ans','Lycéen',            'Le chatbot répond en français, simplement, à toute heure. C''est comme un grand frère qui sait tout.',                                           '⚽', 23, 2),
  ('t03','Grâce, 19 ans',  'Coiffeuse',         'J''ai appris que les règles ne sont pas une honte. J''en parle maintenant autour de moi.',                                                       '📚', 19, 3),
  ('t04','Sessi, 25 ans',  'Artisan·e',         'L''espace anonyme m''a permis de me confier pour la première fois sans avoir peur.',                                                             '🎨', 25, 4),
  ('t05','Bio, 21 ans',    'Mécanicien',        'Le forum m''a aidé à comprendre l''importance du dépistage. Je l''ai fait, et je vais bien.',                                                    '🔧', 21, 5),
  ('t06','Afi, 22 ans',    'Étudiante',         'Pouvoir écrire à une experte en toute confidentialité change tout.',                                                                             '🌻', 22, 6),
  ('t07','Kofi, 18 ans',   'Lycéen',            'Je pensais que parler de santé sexuelle était un sujet honteux. WeToo m''a montré que non.',                                                    '🦁', 18, 7),
  ('t08','Yemi, 24 ans',   'Artiste',           'Les campagnes mensuelles m''ont aidée à structurer mes connaissances sur ma santé. C''est précieux.',                                           '🌺', 24, 8),
  ('t09','Pascal, 26 ans', 'Musicien',          'La gamification, c''est brillant. Je reviens chaque jour pour débloquer de nouveaux badges.',                                                   '🎸', 26, 9),
  ('t10','Dina, 23 ans',   'Bénévole santé',    'WeToo m''a donné les outils pour animer des sessions de sensibilisation dans mon quartier.',                                                    '💜', 23, 10),
  ('t11','Kemi, 16 ans',   'Lycéenne',          'J''avais tellement de questions sur la puberté. Les cours WeToo m''ont tout expliqué clairement.',                                              '🎀', 16, 11),
  ('t12','David, 27 ans',  'Enseignant',        'En tant qu''enseignant, je recommande WeToo à mes élèves. La plateforme comble un vide énorme.',                                                '🌍', 27, 12),
  ('t13','Sandra, 21 ans', 'Étudiante',         'Je me suis sentie acceptée telle que je suis sur WeToo. La communauté est bienveillante et ouverte.',                                           '🌈', 21, 13),
  ('t14','Marc, 20 ans',   'Apprenti électricien','Les infos sur le préservatif m''ont aidé à convaincre mon ami. On s''est dépistés ensemble.',                                                '🏀', 20, 14),
  ('t15','Flora, 17 ans',  'Lycéenne',          'Je pensais être la seule à traverser ces questions. Le forum m''a montré que je n''étais pas seule.',                                           '🌷', 17, 15)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- LIGNES D'AIDE (15)
-- ---------------------------------------------------------------------------
insert into public.helplines (id, country, name, contact, hours, description, url, position) values
  ('h-01','Bénin',         'Ligne verte d''écoute et d''orientation',           '137 (appel gratuit)',     '24h/24, 7j/7',  'Écoute, information et orientation pour les jeunes en détresse ou en questionnement.', null, 1),
  ('h-02','Bénin',         'Urgences santé (SAMU)',                             '112',                     '24h/24, 7j/7',  'Numéro d''urgence pour toute situation médicale grave ou danger immédiat.', null, 2),
  ('h-03','Bénin',         'Direction Départementale de la Santé du Littoral',  '(229) 21 31 22 55',       'Lun–Ven 8h–17h','Orientation vers les centres de santé, planification familiale et dépistage à Cotonou.', null, 3),
  ('h-04','Bénin',         'ABMS / PSI Bénin — Santé reproductive',            '(229) 21 37 01 07',       'Lun–Ven 8h–17h','Conseils en santé reproductive, contraception et IST.', 'https://www.psi.org', 4),
  ('h-05','Bénin',         'ONG Femmes Sans Frontières',                        '(229) 21 30 04 80',       'Lun–Ven 8h–17h','Soutien aux femmes et jeunes filles victimes de violences ou de grossesses précoces.', null, 5),
  ('h-06','Bénin',         'Croix-Rouge Bénin',                                 '(229) 21 30 13 37',       'Lun–Ven 8h–17h','Aide humanitaire, premiers secours et soutien psychosocial.', 'https://www.croixrouge-benin.org', 6),
  ('h-07','Internationale','Centre de ressources ONUSIDA',                      'En ligne',                'Permanent',     'Informations fiables sur le VIH, la prévention et les droits.', 'https://www.unaids.org/fr', 7),
  ('h-08','Internationale','UNFPA — Fonds des Nations Unies pour la population','En ligne',                'Permanent',     'Ressources sur la santé reproductive, la planification familiale et les droits des jeunes.', 'https://www.unfpa.org/fr', 8),
  ('h-09','Internationale','OMS — Santé des adolescents',                       'En ligne',                'Permanent',     'Fiches d''information et guides sur la santé des jeunes.', 'https://www.who.int/fr/health-topics/adolescent-health', 9),
  ('h-10','Internationale','UNICEF — Programmes pour les jeunes',               'En ligne',                'Permanent',     'Ressources sur les droits de l''enfant, la santé et l''éducation.', 'https://www.unicef.org/fr', 10),
  ('h-11','Bénin',         'CEPID — Centre d''Écoute Psychologique',            '(229) 21 32 11 44',       'Lun–Ven 8h–17h','Consultations psychologiques pour les jeunes en situation de détresse.', null, 11),
  ('h-12','Bénin',         'Plan International Bénin',                          '(229) 21 31 72 40',       'Lun–Ven 8h–17h','Soutien aux droits des enfants et adolescents, lutte contre les mariages précoces.', 'https://www.planinternational.org/fr', 12),
  ('h-13','Togo',          'Ligne d''écoute jeunes Togo',                       '+228 22 26 03 64',        'Lun–Ven 8h–17h','Pour les jeunes togolais·es à proximité du Bénin.', null, 13),
  ('h-14','Bénin',         'LEPI — Ligne d''Écoute et de Prévention des IST',  '(229) 21 30 70 11',       'Lun–Sam 8h–18h','Conseils confidentiels sur les IST, dépistage et prévention.', null, 14),
  ('h-15','Internationale','International Planned Parenthood Federation',        'En ligne',                'Permanent',     'Ressources mondiales sur la santé sexuelle et reproductive.', 'https://www.ippf.org/fr', 15)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- PUBLICATIONS DU FORUM (40)
-- ---------------------------------------------------------------------------
insert into public.posts (id, title, body, category, anonymous, author_id, status, flags, reactions, created_at) values
  ('p01','Est-ce normal d''avoir peur avant la première fois ?',         'Mon copain et moi parlons de notre première fois. J''ai très peur et je ne sais pas si c''est normal…',                                                 'relations', false,'u-grace',   'published', array[]::text[], '{"support":12,"helpful":5}'::jsonb,  '2026-10-29T08:00:00Z'::timestamptz),
  ('p02','Comment parler de contraception à ma mère ?',                  'Je voudrais aller au centre de santé mais j''ai peur du jugement de ma famille. Des conseils ?',                                                          'grossesse', false,'u-awa',     'published', array[]::text[], '{"support":20,"helpful":9}'::jsonb,  '2026-10-27T09:00:00Z'::timestamptz),
  ('p03','J''ai eu un rapport non protégé, que faire ?',                 'Ça me stresse beaucoup. Est-ce qu''il faut aller au centre tout de suite ou attendre des symptômes ?',                                                     'ist',       true, null,        'published', array[]::text[], '{"support":15,"helpful":18}'::jsonb, '2026-10-31T10:00:00Z'::timestamptz),
  ('p04','Je me sens seul et je n''arrive plus à dormir',               'Depuis quelques semaines, je suis épuisé et je perds la motivation. Est-ce que ça vous arrive aussi ?',                                                    'sante-mentale', true, null,    'published', array[]::text[], '{"support":27,"helpful":6}'::jsonb,  '2026-10-30T11:00:00Z'::timestamptz),
  ('p05','Le préservatif s''est déchiré, j''ai paniqué',                'On ne s''en est rendu compte qu''après. Quelles sont les étapes à suivre ?',                                                                               'grossesse', true, null,        'published', array[]::text[], '{"support":9,"helpful":21}'::jsonb,  '2026-10-28T12:00:00Z'::timestamptz),
  ('p06','Comment reconnaître une relation toxique ?',                   'Mon/ma partenaire est très jaloux·se et contrôle mon téléphone. Est-ce que c''est normal ?',                                                              'relations', false,'u-awa',     'published', array[]::text[], '{"support":18,"helpful":14}'::jsonb, '2026-10-26T13:00:00Z'::timestamptz),
  ('p07','Le dépistage du VIH est-il vraiment confidentiel ?',          'J''hésite à y aller par peur que quelqu''un l''apprenne.',                                                                                                 'ist',       true, null,        'published', array[]::text[], '{"support":11,"helpful":16}'::jsonb, '2026-10-24T08:00:00Z'::timestamptz),
  ('p08','Règles très douloureuses : vos astuces ?',                     'Chaque mois, j''ai tellement mal que je rate les cours. Qu''est-ce qui vous aide ?',                                                                      'questions', false,'u-grace',   'published', array[]::text[], '{"support":14,"helpful":10}'::jsonb, '2026-10-23T09:00:00Z'::timestamptz),
  ('p09','Est-ce que je peux tomber enceinte en étant vierge ?',        'Question peut-être bête mais je préfère demander ici.',                                                                                                    'questions', true, null,        'published', array[]::text[], '{"support":8,"helpful":12}'::jsonb,  '2026-10-21T10:00:00Z'::timestamptz),
  ('p10','Comment accepter mon corps ?',                                 'Je me compare beaucoup aux photos sur les réseaux et je me sens mal.',                                                                                     'sante-mentale', false,'u-sessi','published', array[]::text[], '{"support":22,"helpful":7}'::jsonb,  '2026-10-20T11:00:00Z'::timestamptz),
  ('p11','Mes parents pensent que parler de sexe est tabou',             'Je n''ai personne à qui parler. Heureusement que cette communauté existe.',                                                                                'confidences', true, null,      'published', array[]::text[], '{"support":25,"helpful":4}'::jsonb,  '2026-10-18T12:00:00Z'::timestamptz),
  ('p12','Un ami proche a l''air très déprimé',                         'Comment l''aider sans le braquer ? Je ne veux pas qu''il se sente jugé.',                                                                                 'sante-mentale', false,'u-sessi','published', array[]::text[], '{"support":19,"helpful":13}'::jsonb, '2026-10-16T13:00:00Z'::timestamptz),
  ('p13','Je suis secrètement amoureux de mon meilleur ami',            'Je ne sais pas comment lui en parler sans risquer de perdre notre amitié.',                                                                                 'relations', true, null,        'published', array[]::text[], '{"support":30,"helpful":8}'::jsonb,  '2026-10-15T08:00:00Z'::timestamptz),
  ('p14','L''implant contraceptif fait-il grossir ?',                   'J''ai entendu beaucoup de choses différentes. Qu''est-ce qui est vrai ?',                                                                                 'grossesse', false,'u-afi',     'published', array[]::text[], '{"support":7,"helpful":15}'::jsonb,  '2026-10-14T09:00:00Z'::timestamptz),
  ('p15','Burn-out scolaire : comment s''en sortir ?',                  'Je travaille non-stop pour mes examens et je n''en peux plus. Tout s''effondre.',                                                                          'sante-mentale', true, null,    'published', array[]::text[], '{"support":33,"helpful":11}'::jsonb, '2026-10-13T10:00:00Z'::timestamptz),
  ('p16','Est-ce qu''une fellation peut transmettre une IST ?',         'On me dit que c''est sans risque. Est-ce vrai ?',                                                                                                          'ist',       true, null,        'published', array[]::text[], '{"support":6,"helpful":22}'::jsonb,  '2026-10-12T11:00:00Z'::timestamptz),
  ('p17','Comment mettre un terme à une relation abusive ?',            'J''ai peur de la réaction de mon/ma partenaire si je romps.',                                                                                              'relations', true, null,        'published', array[]::text[], '{"support":28,"helpful":17}'::jsonb, '2026-10-11T12:00:00Z'::timestamptz),
  ('p18','Peut-on utiliser des tampons si on est vierge ?',             'Ma mère dit que non. Qu''est-ce qui est vrai ?',                                                                                                           'questions', true, null,        'published', array[]::text[], '{"support":16,"helpful":14}'::jsonb, '2026-10-10T13:00:00Z'::timestamptz),
  ('p19','Je pense que j''ai une infection',                            'J''ai des pertes inhabituelles et des démangeaisons. J''ai trop peur de consulter.',                                                                      'ist',       true, null,        'published', array[]::text[], '{"support":13,"helpful":20}'::jsonb, '2026-10-09T08:00:00Z'::timestamptz),
  ('p20','Combien de temps avant que la pilule soit efficace ?',        'Je viens de commencer. On m''a dit des choses différentes.',                                                                                               'grossesse', false,'u-awa',     'published', array[]::text[], '{"support":10,"helpful":18}'::jsonb, '2026-10-08T09:00:00Z'::timestamptz),
  ('p21','Conseils pour bien dormir ?',                                  'Je dors très mal depuis plusieurs semaines. J''ai toujours des idées en tête.',                                                                           'bien-etre', false,'u-marc',    'published', array[]::text[], '{"support":17,"helpful":9}'::jsonb,  '2026-10-07T10:00:00Z'::timestamptz),
  ('p22','Comment dire à mon copain que je veux qu''il porte le préservatif ?','Il dit que ça diminue le plaisir. Je ne sais pas comment le convaincre.',                                                                          'relations', true, null,        'published', array[]::text[], '{"support":24,"helpful":19}'::jsonb, '2026-10-06T11:00:00Z'::timestamptz),
  ('p23','J''ai honte de mon corps depuis que je grossis',              'Depuis la puberté, j''ai pris du poids et tout le monde me fait des commentaires.',                                                                       'sante-mentale', true, null,    'published', array[]::text[], '{"support":31,"helpful":6}'::jsonb,  '2026-10-05T12:00:00Z'::timestamptz),
  ('p24','Est-ce normal de ne pas vouloir de relation sexuelle ?',      'Je ne ressens pas d''attrait sexuel pour les autres. Est-ce que quelque chose ne va pas chez moi ?',                                                      'questions', true, null,        'published', array[]::text[], '{"support":26,"helpful":8}'::jsonb,  '2026-10-04T13:00:00Z'::timestamptz),
  ('p25','Mon copain m''a trompé, comment réagir ?',                    'Je suis dévastée et je ne sais pas si je dois rompre ou essayer de pardonner.',                                                                           'relations', false,'u-yemi',    'published', array[]::text[], '{"support":35,"helpful":10}'::jsonb, '2026-10-03T08:00:00Z'::timestamptz),
  ('p26','Je pense être bi, comment en parler à ma famille ?',         'J''ai très peur de la réaction de mes parents.',                                                                                                            'confidences', true, null,      'published', array[]::text[], '{"support":40,"helpful":7}'::jsonb,  '2026-10-02T09:00:00Z'::timestamptz),
  ('p27','Que faire si on a oublié de prendre la pilule ?',             'J''ai raté deux jours d''affilée. Est-ce que je suis protégée ?',                                                                                         'grossesse', false,'u-kemi',    'published', array[]::text[], '{"support":9,"helpful":25}'::jsonb,  '2026-10-01T10:00:00Z'::timestamptz),
  ('p28','Comment gérer la pression des amis pour avoir des rapports ?','Mes amis se moquent de moi car je n''ai encore jamais couché avec quelqu''un.',                                                                          'confidences', true, null,      'published', array[]::text[], '{"support":22,"helpful":12}'::jsonb, '2026-09-30T11:00:00Z'::timestamptz),
  ('p29','Les douleurs après un rapport, c''est normal ?',              'J''ai eu des douleurs plusieurs heures après. Est-ce que je dois consulter ?',                                                                             'questions', true, null,        'published', array[]::text[], '{"support":14,"helpful":17}'::jsonb, '2026-09-29T12:00:00Z'::timestamptz),
  ('p30','Je ressens une grande tristesse sans raison',                 'Je ne sais pas d''où ça vient. Je n''ai pas envie de faire quoi que ce soit.',                                                                            'sante-mentale', true, null,    'published', array[]::text[], '{"support":36,"helpful":5}'::jsonb,  '2026-09-28T13:00:00Z'::timestamptz),
  ('p31','Comment trouver un centre de dépistage près de moi ?',       'Je suis à Parakou. Y a-t-il un centre discret où je peux me dépister ?',                                                                                   'aide',      true, null,        'published', array[]::text[], '{"support":8,"helpful":20}'::jsonb,  '2026-09-27T08:00:00Z'::timestamptz),
  ('p32','Faut-il dire à son/sa partenaire qu''on a une IST ?',        'Je viens de l''apprendre. J''ai peur de sa réaction.',                                                                                                     'ist',       true, null,        'published', array[]::text[], '{"support":12,"helpful":23}'::jsonb, '2026-09-26T09:00:00Z'::timestamptz),
  ('p33','Ma petite sœur a ses règles à 10 ans, c''est normal ?',      'Je suis inquiète pour elle. C''est très tôt, non ?',                                                                                                       'questions', false,'u-afi',     'published', array[]::text[], '{"support":11,"helpful":16}'::jsonb, '2026-09-25T10:00:00Z'::timestamptz),
  ('p34','Je bois de plus en plus pour oublier mes problèmes',         'Je sais que c''est mauvais mais je ne sais pas comment arrêter.',                                                                                           'confidences', true, null,      'published', array[]::text[], '{"support":29,"helpful":9}'::jsonb,  '2026-09-24T11:00:00Z'::timestamptz),
  ('p35','Qu''est-ce que la PrEP ?',                                    'J''en ai entendu parler mais je ne comprends pas bien comment ça marche.',                                                                                'ist',       false,'u-rodrigue','published', array[]::text[], '{"support":7,"helpful":28}'::jsonb,  '2026-09-23T12:00:00Z'::timestamptz),
  ('p36','Comment parler de santé sexuelle à mon petit frère de 14 ans ?','Il me pose des questions et je ne sais pas comment lui répondre sans le gêner.',                                                                       'aide',      false,'u-pascal',  'published', array[]::text[], '{"support":15,"helpful":19}'::jsonb, '2026-09-22T13:00:00Z'::timestamptz),
  ('p37','Je me sens jugée au centre de santé',                        'La sage-femme m''a regardée bizarrement quand j''ai demandé de la contraception. J''ai honte.',                                                            'confidences', true, null,      'published', array[]::text[], '{"support":32,"helpful":8}'::jsonb,  '2026-09-21T08:00:00Z'::timestamptz),
  ('p38','Attaques de panique : ça arrive à d''autres ?',              'Je panique sans raison dans des lieux publics. Mon cœur s''emballe et je n''arrive plus à respirer.',                                                     'sante-mentale', true, null,    'published', array[]::text[], '{"support":34,"helpful":10}'::jsonb, '2026-09-20T09:00:00Z'::timestamptz),
  ('p39','Peut-on tomber enceinte avec un stérilet ?',                 'Mon médecin m''a posé un stérilet mais j''ai quand même peur.',                                                                                             'grossesse', false,'u-dina',    'published', array[]::text[], '{"support":6,"helpful":21}'::jsonb,  '2026-09-19T10:00:00Z'::timestamptz),
  ('p40','WeToo a changé ma vie, merci',                               'Avant de rejoindre cette plateforme, je me sentais tellement seul·e. Maintenant, je sais que je ne suis pas le/la seul·e à traverser ces questions.',    'confidences', true, null,      'published', array[]::text[], '{"support":55,"helpful":20}'::jsonb, '2026-09-18T11:00:00Z'::timestamptz)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- RÉPONSES DU FORUM (60)
-- ---------------------------------------------------------------------------
insert into public.replies (id, post_id, body, anonymous, author_id, status, flags, is_best_answer, reactions, created_at) values
  ('r01','p01','C''est complètement normal d''avoir peur. Prends le temps d''en parler, et rien ne doit se faire sans envie réelle des deux côtés.', false,'u-awa',      'published', array[]::text[], true,  '{"support":7,"helpful":9}'::jsonb,   '2026-10-30T08:30:00Z'::timestamptz),
  ('r02','p01','N''oublie pas le préservatif, même la première fois. La protection, c''est pour vous deux.',                                          true, null,        'published', array[]::text[], false, '{"support":5,"helpful":6}'::jsonb,   '2026-10-30T09:00:00Z'::timestamptz),
  ('r03','p01','Prendre son temps est important. Il n''y a pas d''âge minimum parfait.',                                                              false,'u-sessi',   'published', array[]::text[], false, '{"support":4,"helpful":5}'::jsonb,   '2026-10-30T10:00:00Z'::timestamptz),
  ('r04','p02','Tu peux commencer par parler à la sage-femme du centre de santé. Elle est tenue à la confidentialité.',                               false,'u-rodrigue','published', array[]::text[], true,  '{"support":10,"helpful":12}'::jsonb, '2026-10-28T08:30:00Z'::timestamptz),
  ('r05','p02','Tu peux aussi aller seule au centre, sans avoir à dire à ta mère ce que tu fais.',                                                    true, null,        'published', array[]::text[], false, '{"support":8,"helpful":9}'::jsonb,   '2026-10-28T09:00:00Z'::timestamptz),
  ('r06','p03','Va au centre de santé rapidement : il existe une contraception d''urgence et un dépistage. Pas besoin d''attendre des symptômes.',    false,'u-sessi',   'published', array[]::text[], true,  '{"support":9,"helpful":15}'::jsonb,  '2026-10-31T08:30:00Z'::timestamptz),
  ('r07','p03','La pilule du lendemain est efficace jusqu''à 72h, plus tôt = plus efficace. Dépistage dans 2–4 semaines ensuite.',                    true, null,        'published', array[]::text[], false, '{"support":7,"helpful":13}'::jsonb,  '2026-10-31T09:00:00Z'::timestamptz),
  ('r08','p04','Tu n''es pas seul·e. Ce que tu décris mérite l''écoute d''un psychologue. En parler, c''est déjà aider.',                            false,'u-awa',      'published', array[]::text[], true,  '{"support":14,"helpful":8}'::jsonb,  '2026-10-31T08:30:00Z'::timestamptz),
  ('r09','p04','J''ai traversé ça. Parler à quelqu''un a tout changé pour moi. Tu as accès aux experts WeToo.',                                       true, null,        'published', array[]::text[], false, '{"support":12,"helpful":6}'::jsonb,  '2026-10-31T09:00:00Z'::timestamptz),
  ('r10','p05','Pilule du lendemain le plus tôt possible (< 72h) et dépistage ensuite. Le centre de santé peut t''accompagner.',                     true, null,        'published', array[]::text[], true,  '{"support":6,"helpful":17}'::jsonb,  '2026-10-29T08:30:00Z'::timestamptz),
  ('r11','p06','Contrôler le téléphone, c''est du contrôle, pas de l''amour. Ton ressenti est légitime.',                                            false,'u-grace',    'published', array[]::text[], true,  '{"support":12,"helpful":11}'::jsonb, '2026-10-27T08:30:00Z'::timestamptz),
  ('r12','p06','Il est normal de poser des limites. Personne n''a le droit de violer ta vie privée.',                                                 false,'u-yemi',    'published', array[]::text[], false, '{"support":9,"helpful":8}'::jsonb,   '2026-10-27T09:00:00Z'::timestamptz),
  ('r13','p07','Oui, le dépistage est confidentiel. Le personnel ne peut pas divulguer ton statut.',                                                  false,'u-rodrigue','published', array[]::text[], true,  '{"support":8,"helpful":13}'::jsonb,  '2026-10-25T08:30:00Z'::timestamptz),
  ('r14','p07','Je me suis dépistée secrètement. Personne n''a rien su. Tu peux le faire.',                                                          true, null,        'published', array[]::text[], false, '{"support":10,"helpful":9}'::jsonb,  '2026-10-25T09:00:00Z'::timestamptz),
  ('r15','p08','La chaleur locale (bouillotte) et le repos aident. Si la douleur t''empêche de vivre normalement, consulte.',                        true, null,        'published', array[]::text[], true,  '{"support":7,"helpful":9}'::jsonb,   '2026-10-24T08:30:00Z'::timestamptz),
  ('r16','p08','Le magnésium (présent dans les amandes, les épinards) aide aussi beaucoup pendant les règles.',                                       false,'u-dina',    'published', array[]::text[], false, '{"support":5,"helpful":7}'::jsonb,   '2026-10-24T09:00:00Z'::timestamptz),
  ('r17','p09','Oui, c''est possible si un spermatozoïde atteint un ovule lors d''une pénétration, même partielle.',                                 false,'u-awa',      'published', array[]::text[], true,  '{"support":6,"helpful":14}'::jsonb,  '2026-10-22T08:30:00Z'::timestamptz),
  ('r18','p10','Rappelle-toi que les réseaux montrent une réalité filtrée. Personne ne ressemble à ses photos retouchées.',                          false,'u-sessi',   'published', array[]::text[], true,  '{"support":11,"helpful":8}'::jsonb,  '2026-10-21T08:30:00Z'::timestamptz),
  ('r19','p10','Je me comparais aussi. Ce qui m''a aidé : noter chaque jour 3 choses que j''aime chez moi.',                                         false,'u-yemi',    'published', array[]::text[], false, '{"support":9,"helpful":7}'::jsonb,   '2026-10-21T09:00:00Z'::timestamptz),
  ('r20','p12','Écoute-le sans juger, propose-lui de parler à un professionnel, et reste présent·e.',                                                false,'u-awa',      'published', array[]::text[], true,  '{"support":11,"helpful":10}'::jsonb, '2026-10-17T08:30:00Z'::timestamptz),
  ('r21','p13','L''amitié est précieuse. Prends ton temps. Il n''y a pas d''urgence à déclarer tes sentiments.',                                     true, null,        'published', array[]::text[], true,  '{"support":15,"helpful":7}'::jsonb,  '2026-10-16T08:30:00Z'::timestamptz),
  ('r22','p14','L''implant peut causer des changements dans le cycle menstruel et parfois une légère prise de poids, mais ce n''est pas systématique. Parles-en à ta sage-femme.', false,'u-afi', 'published', array[]::text[], true, '{"support":8,"helpful":12}'::jsonb, '2026-10-15T08:30:00Z'::timestamptz),
  ('r23','p15','Le burn-out scolaire est réel. Parle à un conseiller scolaire ou à un psychologue. Ton cerveau a besoin de repos.',                  false,'u-nadege-proxy','published', array[]::text[], true, '{"support":18,"helpful":13}'::jsonb,'2026-10-14T08:30:00Z'::timestamptz),
  ('r24','p16','Oui, certaines IST comme l''herpès, la gonorrhée et la syphilis peuvent se transmettre par la fellation. Le préservatif réduit le risque.', false,'u-sessi', 'published', array[]::text[], true, '{"support":6,"helpful":19}'::jsonb, '2026-10-13T08:30:00Z'::timestamptz),
  ('r25','p17','Ta sécurité passe avant tout. Si tu as peur d''une réaction violente, parles-en à un adulte de confiance ou appelle le 137.',        false,'u-dina',    'published', array[]::text[], true,  '{"support":22,"helpful":15}'::jsonb, '2026-10-12T08:30:00Z'::timestamptz),
  ('r26','p18','Oui, on peut utiliser des tampons sans être sexuellement active. L''hymen est flexible.',                                             false,'u-awa',      'published', array[]::text[], true,  '{"support":14,"helpful":16}'::jsonb, '2026-10-11T08:30:00Z'::timestamptz),
  ('r27','p19','Consulte sans tarder. Plus tu attends, plus une infection peut s''aggraver. Le personnel médical ne te jugera pas.',                  false,'u-rodrigue','published', array[]::text[], true,  '{"support":11,"helpful":18}'::jsonb, '2026-10-10T08:30:00Z'::timestamptz),
  ('r28','p20','En général, la pilule est efficace après 7 jours de prise régulière. Utilise un préservatif pendant cette période.',                  false,'u-sessi',   'published', array[]::text[], true,  '{"support":9,"helpful":20}'::jsonb,  '2026-10-09T08:30:00Z'::timestamptz),
  ('r29','p21','Établir une routine du soir (pas d''écran, lecture calme, heure fixe) aide vraiment.',                                               false,'u-pascal',  'published', array[]::text[], true,  '{"support":13,"helpful":8}'::jsonb,  '2026-10-08T08:30:00Z'::timestamptz),
  ('r30','p22','Vous pouvez chercher des préservatifs avec lubrifiant, qui sont plus confortables. Parle-lui aussi de l''importance de ta protection.', false,'u-awa',   'published', array[]::text[], true,  '{"support":20,"helpful":17}'::jsonb, '2026-10-07T08:30:00Z'::timestamptz),
  ('r31','p23','Les commentaires sur le corps des autres sont une violence. Ton corps est en train de grandir, pas d''être anormal.',                 false,'u-yemi',    'published', array[]::text[], true,  '{"support":25,"helpful":6}'::jsonb,  '2026-10-06T08:30:00Z'::timestamptz),
  ('r32','p24','Ce que tu décris pourrait s''appeler l''asexualité. C''est une orientation normale. Tu n''as pas de problème.',                      false,'u-sessi',   'published', array[]::text[], true,  '{"support":21,"helpful":10}'::jsonb, '2026-10-05T08:30:00Z'::timestamptz),
  ('r33','p25','Peu importe ta décision, sache qu''elle doit être libre. Tu n''as pas à pardonner si tu ne te sens pas prête.',                      false,'u-dina',    'published', array[]::text[], true,  '{"support":29,"helpful":9}'::jsonb,  '2026-10-04T08:30:00Z'::timestamptz),
  ('r34','p26','Venir en parler ici est déjà un acte de courage. Tu n''es pas obligé·e de tout dire d''un coup à ta famille.',                       true, null,        'published', array[]::text[], true,  '{"support":35,"helpful":6}'::jsonb,  '2026-10-03T08:30:00Z'::timestamptz),
  ('r35','p27','Si tu as raté 2 jours, utilise un préservatif jusqu''à la fin de l''emballage. Parle à ta sage-femme pour être sûre.',               false,'u-awa',      'published', array[]::text[], true,  '{"support":8,"helpful":22}'::jsonb,  '2026-10-02T08:30:00Z'::timestamptz),
  ('r36','p28','Personne n''a à te forcer à faire quoi que ce soit. Ta virginité t''appartient. Ce n''est pas une compétition.',                     false,'u-sessi',   'published', array[]::text[], true,  '{"support":18,"helpful":11}'::jsonb, '2026-10-01T08:30:00Z'::timestamptz),
  ('r37','p29','Des douleurs après le premier rapport peuvent être normales. Si elles persistent, consulte.',                                         false,'u-grace',   'published', array[]::text[], true,  '{"support":10,"helpful":15}'::jsonb, '2026-09-30T08:30:00Z'::timestamptz),
  ('r38','p30','Ce que tu décris peut être le début d''une dépression. Parler à un professionnel peut vraiment aider. Tu n''es pas seul·e.',         false,'u-dina',    'published', array[]::text[], true,  '{"support":30,"helpful":5}'::jsonb,  '2026-09-29T08:30:00Z'::timestamptz),
  ('r39','p31','Il y a le Centre National Hospitalier et Universitaire de Cotonou et plusieurs associations IST à Parakou. Cherche aussi sur le site du Ministère de la Santé.', false,'u-rodrigue','published', array[]::text[], true, '{"support":7,"helpful":17}'::jsonb, '2026-09-28T08:30:00Z'::timestamptz),
  ('r40','p32','Oui, tu as l''obligation morale (et parfois légale) de le dire. C''est difficile mais c''est la bonne chose à faire. Tu peux en parler avec un médecin d''abord.', false,'u-sessi', 'published', array[]::text[], true, '{"support":10,"helpful":20}'::jsonb, '2026-09-27T08:30:00Z'::timestamptz),
  ('r41','p33','La puberté précoce (avant 8 ans) peut nécessiter un avis médical. À 10 ans, c''est dans la limite inférieure du normal mais un pédiatre peut rassurer.',  false,'u-awa', 'published', array[]::text[], true, '{"support":9,"helpful":14}'::jsonb, '2026-09-26T08:30:00Z'::timestamptz),
  ('r42','p34','Tu as fait un grand pas en l''admettant. Des centres de traitement des addictions existent au Bénin. Tu mérites de l''aide, pas du jugement.', false,'u-dina', 'published', array[]::text[], true, '{"support":24,"helpful":8}'::jsonb, '2026-09-25T08:30:00Z'::timestamptz),
  ('r43','p35','La PrEP (prophylaxie pré-exposition) est un médicament qu''on prend avant une exposition possible au VIH. Elle est très efficace et disponible dans certains centres.', false,'u-rodrigue','published', array[]::text[], true, '{"support":6,"helpful":24}'::jsonb, '2026-09-24T08:30:00Z'::timestamptz),
  ('r44','p36','Le cours WeToo sur la puberté est parfait pour ça. Tu peux lui montrer, ou expliquer les points clés. Rester calme et factuel aide beaucoup.', false,'u-pascal', 'published', array[]::text[], true, '{"support":12,"helpful":16}'::jsonb, '2026-09-23T08:30:00Z'::timestamptz),
  ('r45','p37','Ce que tu as vécu n''est pas normal et ne devrait pas arriver. Tous les professionnels de santé sont tenus au respect et à la bienveillance. Tu peux signaler ce comportement.', false,'u-sessi', 'published', array[]::text[], true, '{"support":27,"helpful":7}'::jsonb, '2026-09-22T08:30:00Z'::timestamptz),
  ('r46','p38','Les attaques de panique sont réelles et se traitent. La thérapie cognitive-comportementale est très efficace. Un psychologue peut t''aider.', false,'u-dina', 'published', array[]::text[], true, '{"support":28,"helpful":9}'::jsonb, '2026-09-21T08:30:00Z'::timestamptz),
  ('r47','p39','Le stérilet est l''une des contraceptions les plus efficaces (plus de 99%). Le risque de grossesse est très faible.', false,'u-awa', 'published', array[]::text[], true, '{"support":5,"helpful":19}'::jsonb, '2026-09-20T08:30:00Z'::timestamptz),
  ('r48','p40','Ce message nous touche profondément. La communauté WeToo est là pour toi, toujours.', false,'u-sessi', 'published', array[]::text[], false, '{"support":45,"helpful":18}'::jsonb, '2026-09-19T08:30:00Z'::timestamptz),
  -- Réponses supplémentaires (vrac) pour enrichir
  ('r49','p04','Le sport m''aide beaucoup quand je me sens bas. Même 20 minutes de marche.',                                                          true, null,        'published', array[]::text[], false, '{"support":8,"helpful":5}'::jsonb,   '2026-10-31T10:00:00Z'::timestamptz),
  ('r50','p15','J''ai aussi vécu ça. Parler à ma mère a été le premier pas. Elle comprenait plus que je ne pensais.',                                  true, null,        'published', array[]::text[], false, '{"support":14,"helpful":7}'::jsonb,  '2026-10-14T09:00:00Z'::timestamptz),
  ('r51','p25','L''infidélité est difficile à digérer. Prends le temps qu''il te faut. Tu n''as rien à décider maintenant.',                          true, null,        'published', array[]::text[], false, '{"support":19,"helpful":6}'::jsonb,  '2026-10-03T09:00:00Z'::timestamptz),
  ('r52','p26','Je suis passé·e par là. Tu n''as pas à tout dire à ta famille tout de suite. Ta sécurité d''abord.',                                   true, null,        'published', array[]::text[], false, '{"support":30,"helpful":5}'::jsonb,  '2026-10-03T10:00:00Z'::timestamptz),
  ('r53','p17','Un plan de sortie est important. Note les numéros d''urgence, parle à un·e ami·e de confiance avant de rompre.',                      false,'u-pascal',  'published', array[]::text[], false, '{"support":17,"helpful":12}'::jsonb, '2026-10-11T09:00:00Z'::timestamptz),
  ('r54','p23','Ton corps te fait ce qu''il faut pour être en bonne santé. Les standards de beauté sur les réseaux sociaux sont une illusion.',       false,'u-grace',   'published', array[]::text[], false, '{"support":20,"helpful":5}'::jsonb,  '2026-10-05T09:00:00Z'::timestamptz),
  ('r55','p08','Les tisanes de gingembre chaudes aident aussi. Et évite le café pendant les règles.',                                                  true, null,        'published', array[]::text[], false, '{"support":6,"helpful":8}'::jsonb,   '2026-10-23T10:00:00Z'::timestamptz),
  ('r56','p30','Essaie d''établir une routine : se lever à la même heure, s''exposer à la lumière du matin, faire de l''exercice léger.',             false,'u-pascal',  'published', array[]::text[], false, '{"support":13,"helpful":7}'::jsonb,  '2026-09-28T09:00:00Z'::timestamptz),
  ('r57','p34','Les groupes de soutien pour les addictions sont confidentiels et gratuits. Tu peux y aller sans engagement.',                          false,'u-dina',    'published', array[]::text[], false, '{"support":16,"helpful":9}'::jsonb,  '2026-09-24T09:00:00Z'::timestamptz),
  ('r58','p11','Moi aussi j''ai grandi dans une famille où c''était tabou. WeToo a comblé ce vide pour moi. Tu n''es vraiment pas seul·e.',           true, null,        'published', array[]::text[], false, '{"support":21,"helpful":4}'::jsonb,  '2026-10-18T09:00:00Z'::timestamptz),
  ('r59','p38','Je me reconnais tellement. Les exercices de respiration 4-7-8 m''ont beaucoup aidé lors des crises.',                                 true, null,        'published', array[]::text[], false, '{"support":23,"helpful":8}'::jsonb,  '2026-09-20T10:00:00Z'::timestamptz),
  ('r60','p40','Cette plateforme m''a sauvé·e aussi. Ensemble on est plus forts.',                                                                    true, null,        'published', array[]::text[], false, '{"support":40,"helpful":15}'::jsonb, '2026-09-18T12:00:00Z'::timestamptz)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- SESSIONS CHATBOT (10 conversations types)
-- ---------------------------------------------------------------------------
insert into public.chat_sessions (id, user_id, lang, messages, created_at, updated_at) values
  ('cs-001', null, 'fr',
   '[{"role":"user","text":"Est-ce que la masturbation rend aveugle ?","at":"2026-10-01T09:00:00Z"},{"role":"bot","text":"C''est un mythe très répandu mais totalement faux. La masturbation est naturelle, sans danger pour la santé physique ou mentale. Elle ne provoque ni cécité, ni perte d''énergie, ni infertilité. Si tu as d''autres questions, n''hésite pas !","at":"2026-10-01T09:00:02Z","category":"Mythes & idées fausses","urgent":false}]'::jsonb,
   '2026-10-01T09:00:00Z'::timestamptz, '2026-10-01T09:00:02Z'::timestamptz),

  ('cs-002', null, 'fr',
   '[{"role":"user","text":"Où trouver de l''aide au Bénin ?","at":"2026-10-02T10:00:00Z"},{"role":"bot","text":"Au Bénin, plusieurs ressources sont disponibles : la ligne verte 137 (gratuite, 24h/24), le 112 pour les urgences médicales, les centres de santé de proximité, les centres de planification familiale et les ONG comme Plan International. Sur WeToo, tu peux aussi contacter un expert en toute confidentialité. Tu n''es jamais seul·e.","at":"2026-10-02T10:00:02Z","category":"Où trouver de l''aide","urgent":true}]'::jsonb,
   '2026-10-02T10:00:00Z'::timestamptz, '2026-10-02T10:00:02Z'::timestamptz),

  ('cs-003', null, 'fr',
   '[{"role":"user","text":"Comment savoir si j''ai une IST ?","at":"2026-10-03T11:00:00Z"},{"role":"bot","text":"De nombreuses IST sont silencieuses : tu peux en avoir sans aucun symptôme. Les seuls moyens de savoir sont le dépistage médical. Certains signes doivent t''alerter : pertes inhabituelles, douleurs, brûlures en urinant, plaies ou boutons génitaux. Dans tous les cas, un test en centre de santé est la seule certitude. C''est confidentiel et souvent gratuit.","at":"2026-10-03T11:00:02Z","category":"IST & dépistage","urgent":false}]'::jsonb,
   '2026-10-03T11:00:00Z'::timestamptz, '2026-10-03T11:00:02Z'::timestamptz),

  ('cs-004', null, 'fr',
   '[{"role":"user","text":"J''ai des pensées suicidaires","at":"2026-10-04T02:30:00Z"},{"role":"bot","text":"Je t''entends, et je suis là pour toi. Ce que tu ressens est réel et sérieux. S''il te plaît, appelle immédiatement le 137 (Bénin, gratuit, 24h/24) ou rends-toi aux urgences les plus proches. Parle à un adulte de confiance maintenant. Ta vie compte énormément — pour cette communauté et pour tous ceux qui t''aiment. Tu n''as pas à traverser ça seul·e.","at":"2026-10-04T02:30:02Z","category":"Santé mentale","urgent":true}]'::jsonb,
   '2026-10-04T02:30:00Z'::timestamptz, '2026-10-04T02:30:02Z'::timestamptz),

  ('cs-005', null, 'fr',
   '[{"role":"user","text":"La pilule protège-t-elle des maladies ?","at":"2026-10-05T14:00:00Z"},{"role":"bot","text":"Non, la pilule contraceptive protège uniquement contre une grossesse non désirée. Elle ne protège PAS contre les infections sexuellement transmissibles (IST), y compris le VIH. Seul le préservatif (masculin ou féminin) offre cette double protection. Idéalement, associer pilule + préservatif est la meilleure protection.","at":"2026-10-05T14:00:02Z","category":"Contraception","urgent":false}]'::jsonb,
   '2026-10-05T14:00:00Z'::timestamptz, '2026-10-05T14:00:02Z'::timestamptz),

  ('cs-006', null, 'fr',
   '[{"role":"user","text":"Je me sens déprimée depuis des semaines","at":"2026-10-06T08:00:00Z"},{"role":"bot","text":"Je suis désolé·e d''entendre ça. Ce que tu décris — tristesse persistante, manque d''énergie, perte de motivation — peut indiquer une dépression. C''est une vraie maladie qui se soigne, pas un manque de volonté. Je t''encourage à parler à un psychologue ou à consulter un médecin. Sur WeToo, un expert est disponible pour t''accompagner. Tu mérites d''aller mieux.","at":"2026-10-06T08:00:02Z","category":"Santé mentale","urgent":false}]'::jsonb,
   '2026-10-06T08:00:00Z'::timestamptz, '2026-10-06T08:00:02Z'::timestamptz),

  ('cs-007', null, 'fr',
   '[{"role":"user","text":"Comment utiliser correctement un préservatif ?","at":"2026-10-07T16:00:00Z"},{"role":"bot","text":"Voici les étapes clés : 1) Vérifier la date de péremption. 2) Ouvrir l''emballage avec les doigts (jamais les dents). 3) Pincer le bout pour chasser l''air. 4) Dérouler jusqu''à la base avant tout contact. 5) Après le rapport, retirer en tenant la base et jeter à la poubelle. Utilise un nouveau préservatif à chaque rapport. Évite les huiles comme lubrifiant — elles fragilisent le latex.","at":"2026-10-07T16:00:02Z","category":"Contraception","urgent":false}]'::jsonb,
   '2026-10-07T16:00:00Z'::timestamptz, '2026-10-07T16:00:02Z'::timestamptz),

  ('cs-008', null, 'fr',
   '[{"role":"user","text":"C''est quoi le consentement exactement ?","at":"2026-10-08T12:00:00Z"},{"role":"bot","text":"Le consentement, c''est un accord libre, clair et enthousiaste donné à chaque fois. Il peut être retiré à n''importe quel moment, même en plein milieu d''un acte. Le silence, la peur, l''alcool ou la pression ne constituent pas un consentement. Un mineur·e ne peut pas légalement consentir à une relation avec un adulte. Respecter le non de l''autre, c''est la base de toute relation respectueuse.","at":"2026-10-08T12:00:02Z","category":"Relations & consentement","urgent":false}]'::jsonb,
   '2026-10-08T12:00:00Z'::timestamptz, '2026-10-08T12:00:02Z'::timestamptz),

  ('cs-009', null, 'fr',
   '[{"role":"user","text":"J''ai été forcée à un rapport, que faire ?","at":"2026-10-09T23:00:00Z"},{"role":"bot","text":"Ce qui t''est arrivé n''est pas ta faute. C''est une violence grave. S''il te plaît, cherche de l''aide maintenant : appelle le 137 (Bénin, gratuit, 24h/24), rends-toi aux urgences pour une prise en charge médicale (prophylaxie VIH disponible sous 72h), et parle à un adulte de confiance. Tu as le droit d''être protégée et soignée. Sur WeToo, un expert peut aussi t''accompagner en toute confidentialité.","at":"2026-10-09T23:00:02Z","category":"Violences","urgent":true}]'::jsonb,
   '2026-10-09T23:00:00Z'::timestamptz, '2026-10-09T23:00:02Z'::timestamptz),

  ('cs-010', null, 'fr',
   '[{"role":"user","text":"Quels aliments manger pendant les règles ?","at":"2026-10-10T10:00:00Z"},{"role":"bot","text":"Pendant les règles, privilégie les aliments riches en fer (haricots, lentilles, viande, épinards, abats) pour compenser la perte sanguine. Le magnésium (amandes, noix, chocolat noir) aide à réduire les crampes. Bois beaucoup d''eau. Évite les excès de café, alcool et aliments très salés qui aggravent les crampes. La chaleur (bouillotte) et le repos doux font aussi du bien.","at":"2026-10-10T10:00:02Z","category":"Règles & hygiène","urgent":false}]'::jsonb,
   '2026-10-10T10:00:00Z'::timestamptz, '2026-10-10T10:00:02Z'::timestamptz)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- COMPTEURS INITIAUX
-- ---------------------------------------------------------------------------
insert into public.counters (id, name, value) values
  ('cnt-users',     'utilisateurs_inscrits',    1847),
  ('cnt-questions', 'questions_posées',          3214),
  ('cnt-experts',   'consultations_experts',      987),
  ('cnt-lessons',   'cours_terminés',            8563),
  ('cnt-quizzes',   'quiz_complétés',            5421),
  ('cnt-posts',     'publications_forum',         726),
  ('cnt-replies',   'réponses_forum',            2184),
  ('cnt-campaigns', 'participants_campagnes',    2337),
  ('cnt-badges',    'badges_distribués',         4102),
  ('cnt-chatbot',   'conversations_chatbot',     6890)
on conflict (id) do nothing;

commit;
