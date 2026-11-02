import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserRound,
  Award,
  Settings,
  LogOut,
  Save,
  Sun,
  Moon,
  Trophy,
  Star,
  Flame,
  BookOpen,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Badge, Chip } from '../components/ui/Badge.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { Field, Input, Select, RadioPills } from '../components/ui/Field.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States.jsx';
import { useApi } from '../lib/useApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { formatDate } from '../lib/format.js';
import './Profile.css';

/** Avatars proposés (identiques à ceux du backend). */
const AVATARS = ['🙂', '🌸', '⚽', '📚', '🎨', '🌻', '🔥', '💙', '🌈', '🎧'];

const GENDER_OPTIONS = [
  { value: 'fille', label: 'Fille' },
  { value: 'garçon', label: 'Garçon' },
  { value: 'autre', label: 'Autre' },
];

const REGIONS = [
  'Alibori',
  'Atacora',
  'Atlantique',
  'Borgou',
  'Collines',
  'Couffo',
  'Donga',
  'Littoral',
  'Mono',
  'Ouémé',
  'Plateau',
  'Zou',
];

const INTEREST_OPTIONS = [
  'Santé mentale',
  'Contraception',
  'IST',
  'Consentement',
  'Puberté',
  'Bien-être numérique',
];

const TABS = [
  { id: 'profil', label: 'Mon profil', icon: UserRound },
  { id: 'badges', label: 'Mes badges', icon: Award },
  { id: 'reglages', label: 'Réglages', icon: Settings },
];

/** Petite tuile de statistique. */
function Stat({ icon: Icon, value, label }) {
  return (
    <div className="profile-page__stat">
      <span className="profile-page__stat-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <span className="profile-page__stat-value">{value}</span>
      <span className="profile-page__stat-label">{label}</span>
    </div>
  );
}

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading, updateProfile, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [tab, setTab] = useState('profil');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    avatar: '🙂',
    name: '',
    age: '',
    gender: '',
    region: '',
    interests: [],
  });

  // Données de gamification (rang, badges obtenus).
  const me = useApi(isAuthenticated ? '/gamification/me' : null, { auth: true });
  // Catalogue complet des badges (public).
  const badges = useApi(isAuthenticated ? '/gamification/badges' : null, { auth: false });

  // Synchronise le formulaire quand le profil est chargé ou modifié.
  useEffect(() => {
    if (!user) return;
    setForm({
      avatar: user.avatar || '🙂',
      name: user.name || '',
      age: user.age ?? '',
      gender: user.gender || '',
      region: user.region || '',
      interests: Array.isArray(user.interests) ? user.interests : [],
    });
  }, [user]);

  // Options d'intérêt : la liste de base + d'éventuels intérêts existants hors liste.
  const interestOptions = useMemo(() => {
    const existing = (user?.interests || []).filter((i) => !INTEREST_OPTIONS.includes(i));
    return [...INTEREST_OPTIONS, ...existing];
  }, [user]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleInterest(label) {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(label)
        ? prev.interests.filter((i) => i !== label)
        : [...prev.interests, label],
    }));
  }

  /** Enregistre les modifications du profil (PATCH /auth/me). */
  async function handleSave(event) {
    event.preventDefault();
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Le nom doit contenir au moins 2 caractères.';
    if (form.age !== '' && form.age !== null) {
      const n = Number(form.age);
      if (!Number.isInteger(n)) nextErrors.age = "L'âge doit être un nombre entier.";
      else if (n < 18 || n > 29) nextErrors.age = "L'âge doit être compris entre 18 et 29 ans.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.warning('Vérifie les champs signalés.');
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        age: form.age === '' ? null : Number(form.age),
        gender: form.gender || null,
        region: form.region || null,
        avatar: form.avatar,
        interests: form.interests,
      });
      toast.success('Profil mis à jour !');
      me.refetch();
    } catch (err) {
      const map = {
        invalid_name: 'name',
        invalid_age: 'age',
        age_out_of_range: 'age',
        invalid_gender: 'gender',
        invalid_interests: 'interests',
      };
      const field = map[err.code];
      if (field) setErrors({ [field]: err.message });
      toast.error(err.message || 'Impossible de mettre à jour le profil.');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  // ------------------------------- États globaux -------------------------------
  if (authLoading) {
    return (
      <div className="profile-page">
        <LoadingState label="Chargement de ton profil…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <EmptyState
          icon={UserRound}
          title="Connecte-toi pour voir ton profil"
          description="Ton niveau, tes badges et tes réglages sont personnels : crée un compte gratuit pour les retrouver."
          action={
            <Button to="/connexion" icon={UserRound}>
              Se connecter
            </Button>
          }
        />
      </div>
    );
  }

  // Statistiques (gamification prioritaire, sinon valeurs du profil).
  const points = me.data?.points ?? user?.points ?? 0;
  const levelName = me.data?.levelName ?? user?.levelName ?? 'Débutant·e';
  const rank = me.data?.rank;
  const streak = me.data?.streak ?? user?.streak ?? 0;
  const lessonsCount = me.data?.completedLessonsCount ?? (user?.completedLessons?.length || 0);

  const obtainedIds = new Set((me.data?.badges || []).map((b) => b.id));

  return (
    <div className="profile-page">
      <PageHeader
        eyebrow="Mon espace"
        title="Mon compte"
        description="Gère ton profil, découvre tes badges et personnalise ton expérience."
        icon={UserRound}
      />

      <Tabs
        items={TABS.map((t) => ({
          ...t,
          badge: t.id === 'badges' && me.data ? me.data.badges.length : undefined,
        }))}
        value={tab}
        onChange={setTab}
        ariaLabel="Sections du profil"
        variant="pill"
      />

      {/* ============================ Onglet : Profil ============================ */}
      {tab === 'profil' ? (
        <div className="profile-page__grid">
          {/* Statistiques */}
          <Card tone="soft" padding="lg" className="profile-page__summary">
            <div className="profile-page__identity">
              <Avatar name={user?.name} avatar={user?.avatar} size="xl" />
              <div>
                <h2 className="profile-page__name">{user?.name}</h2>
                <p className="text-muted">
                  {levelName}
                  {user?.region ? ` · ${user.region}` : ''}
                </p>
                {user?.createdAt ? (
                  <p className="profile-page__since">Membre depuis le {formatDate(user.createdAt)}</p>
                ) : null}
              </div>
            </div>
            <div className="profile-page__stats">
              <Stat icon={Star} value={points} label="points" />
              <Stat icon={Trophy} value={rank ? `#${rank}` : '—'} label="rang" />
              <Stat icon={Flame} value={streak} label="série (jours)" />
              <Stat icon={BookOpen} value={lessonsCount} label="cours terminés" />
            </div>
            <Button to="/app/classement" variant="outline" size="sm" icon={Trophy}>
              Voir le classement complet
            </Button>
          </Card>

          {/* Formulaire d'édition */}
          <Card padding="lg" className="profile-page__form-card">
            <form className="profile-page__form" onSubmit={handleSave} noValidate>
              <fieldset className="profile-page__fieldset">
                <legend className="profile-page__legend">Choisis ton avatar</legend>
                <div className="profile-page__avatars" role="group" aria-label="Choix de l'avatar">
                  {AVATARS.map((emoji) => {
                    const selected = form.avatar === emoji;
                    return (
                      <button
                        key={emoji}
                        type="button"
                        className={`profile-page__avatar-option ${selected ? 'is-selected' : ''}`}
                        aria-pressed={selected}
                        aria-label={`Avatar ${emoji}`}
                        onClick={() => setField('avatar', emoji)}
                      >
                        <span aria-hidden="true">{emoji}</span>
                        {selected ? (
                          <CheckCircle2 size={14} aria-hidden="true" className="profile-page__avatar-check" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <Field label="Nom complet" required htmlFor="profile-name" error={errors.name}>
                <Input
                  id="profile-name"
                  name="name"
                  type="text"
                  value={form.name}
                  invalid={Boolean(errors.name)}
                  onChange={(e) => setField('name', e.target.value)}
                />
              </Field>

              <Field
                label="Âge"
                htmlFor="profile-age"
                error={errors.age}
                hint="Entre 18 et 29 ans - reste confidentiel."
              >
                <Input
                  id="profile-age"
                  name="age"
                  type="number"
                  min={18}
                  max={29}
                  inputMode="numeric"
                  value={form.age}
                  invalid={Boolean(errors.age)}
                  onChange={(e) => setField('age', e.target.value)}
                />
              </Field>

              <div className="profile-page__field">
                <RadioPills
                  name="profile-gender"
                  legend="Genre"
                  options={GENDER_OPTIONS}
                  value={form.gender}
                  onChange={(v) => setField('gender', v)}
                />
              </div>

              <Field label="Département" htmlFor="profile-region">
                <Select
                  id="profile-region"
                  name="region"
                  value={form.region}
                  onChange={(e) => setField('region', e.target.value)}
                >
                  <option value="">Non précisé</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="profile-page__field">
                <p className="profile-page__field-label">Centres d'intérêt</p>
                <div className="profile-page__chips" role="group" aria-label="Centres d'intérêt">
                  {interestOptions.map((label) => (
                    <Chip
                      key={label}
                      selected={form.interests.includes(label)}
                      onClick={() => toggleInterest(label)}
                    >
                      {label}
                    </Chip>
                  ))}
                </div>
              </div>

              <div className="profile-page__form-actions">
                <Button type="submit" loading={saving} icon={Save}>
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}

      {/* ============================ Onglet : Badges ============================ */}
      {tab === 'badges' ? (
        <div className="profile-page__tab">
          {me.loading || badges.loading ? (
            <LoadingState label="Chargement de tes badges…" />
          ) : badges.error ? (
            <ErrorState error={badges.error} onRetry={badges.refetch} />
          ) : (badges.data || []).length === 0 ? (
            <EmptyState icon={Award} title="Aucun badge disponible" />
          ) : (
            <>
              <p className="profile-page__badges-intro">
                Tu as obtenu <strong>{obtainedIds.size}</strong> badge
                {obtainedIds.size > 1 ? 's' : ''} sur {badges.data.length}. Termine des cours, réussis
                des quiz et participe pour débloquer les autres.
              </p>
              <div className="grid grid-3 profile-page__badges">
                {badges.data.map((badge) => {
                  const obtained = obtainedIds.has(badge.id);
                  return (
                    <Card
                      key={badge.id}
                      padding="md"
                      className={`profile-page__badge ${obtained ? 'is-obtained' : 'is-locked'}`}
                    >
                      <div className="profile-page__badge-top">
                        <span className="profile-page__badge-emoji" aria-hidden="true">
                          {badge.emoji}
                        </span>
                        {obtained ? (
                          <Badge tone="success" size="sm" icon={CheckCircle2}>
                            Obtenu
                          </Badge>
                        ) : (
                          <Badge tone="neutral" size="sm" icon={Lock}>
                            À débloquer
                          </Badge>
                        )}
                      </div>
                      <h3 className="profile-page__badge-name">{badge.name}</h3>
                      <p className="profile-page__badge-desc">{badge.description}</p>
                      <p className="profile-page__badge-criteria">
                        <span>Comment l'obtenir :</span> {badge.criteria}
                      </p>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : null}

      {/* =========================== Onglet : Réglages =========================== */}
      {tab === 'reglages' ? (
        <div className="profile-page__tab profile-page__settings">
          {/* Thème */}
          <Card padding="lg">
            <div className="profile-page__setting">
              <div className="profile-page__setting-head">
                <span className="icon-tile" aria-hidden="true">
                  <Sparkles size={20} />
                </span>
                <div>
                  <h2 className="profile-page__setting-title">Apparence</h2>
                  <p className="text-muted">Choisis le thème qui te met le plus à l'aise.</p>
                </div>
              </div>
              <div className="profile-page__theme" role="group" aria-label="Choix du thème">
                <button
                  type="button"
                  className={`profile-page__theme-btn ${theme === 'light' ? 'is-selected' : ''}`}
                  aria-pressed={theme === 'light'}
                  onClick={() => setTheme('light')}
                >
                  <Sun size={20} aria-hidden="true" />
                  Clair
                </button>
                <button
                  type="button"
                  className={`profile-page__theme-btn ${theme === 'dark' ? 'is-selected' : ''}`}
                  aria-pressed={theme === 'dark'}
                  onClick={() => setTheme('dark')}
                >
                  <Moon size={20} aria-hidden="true" />
                  Sombre
                </button>
              </div>
            </div>
          </Card>

          {/* Mode hors ligne (perspective) */}
          <Card padding="lg">
            <div className="profile-page__setting">
              <div className="profile-page__setting-head">
                <span className="icon-tile" aria-hidden="true">
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <h2 className="profile-page__setting-title">Mode hors ligne</h2>
                  <p className="text-muted">
                    Nous travaillons sur un accès hors ligne pour les zones à faible connexion.
                    Aujourd’hui, la plateforme nécessite une connexion internet - aucune donnée
                    n’est stockée sur ton appareil.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Déconnexion */}
          <Card padding="lg" tone="outline">
            <div className="profile-page__setting">
              <div className="profile-page__setting-head">
                <span className="icon-tile icon-tile--warm" aria-hidden="true">
                  <LogOut size={20} />
                </span>
                <div>
                  <h2 className="profile-page__setting-title">Se déconnecter</h2>
                  <p className="text-muted">
                    Tu pourras te reconnecter plus tard : tes points et tes badges sont conservés.
                  </p>
                </div>
              </div>
              <Button variant="danger" icon={LogOut} onClick={handleLogout}>
                Se déconnecter
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
