import { useId, useMemo, useState } from 'react';
import {
  Lightbulb,
  Search,
  XCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  MessageCircle,
  Sparkles,
  SearchX,
} from 'lucide-react';

import { PageHeader } from '../components/layout/PageHeader.jsx';
import {
  Button,
  Card,
  Chip,
  Input,
  Badge,
  SkeletonCards,
  ErrorState,
  EmptyState,
} from '../components/ui/index.js';
import { useApi } from '../lib/useApi.js';
import { pluralize } from '../lib/format.js';
import './Myths.css';

const ALL_CATEGORIES = 'all';

/** Retire les accents pour une recherche tolérante (« regle » trouve « règles »). */
function normalize(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/** « Mythes & vraies infos » : on démonte les fausses croyances les plus répandues. */
export default function Myths() {
  const { data, loading, error, refetch } = useApi('/chat/myths', {
    auth: false,
    cache: true,
  });
  const myths = Array.isArray(data) ? data : [];

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORIES);

  /* Catégories déduites de la réponse API (triées alphabétiquement). */
  const categories = useMemo(() => {
    const set = new Set();
    myths.forEach((m) => {
      if (m?.category) set.add(m.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [myths]);

  /* Filtrage local sur le mythe, la vérité et la catégorie. */
  const filtered = useMemo(() => {
    const q = normalize(query);
    return myths.filter((m) => {
      const matchCategory = category === ALL_CATEGORIES || m.category === category;
      if (!matchCategory) return false;
      if (!q) return true;
      return (
        normalize(m.myth).includes(q) ||
        normalize(m.truth).includes(q) ||
        normalize(m.category).includes(q)
      );
    });
  }, [myths, query, category]);

  const hasFilters = query.trim() !== '' || category !== ALL_CATEGORIES;

  return (
    <div className="myths-page">
      <PageHeader
        eyebrow="Idées reçues"
        title="Mythes & vraies infos"
        description="Des rumeurs circulent sur le corps, la sexualité et la santé. Ici, on les démonte une par une, avec des informations fiables et bienveillantes."
        icon={Lightbulb}
        actions={
          <Button to="/app/chat" variant="primary" icon={MessageCircle}>
            Poser ma question au chatbot
          </Button>
        }
      />

      {/* ------------------------------ Bandeau de compteur ------------------------------ */}
      <div className="myths-page__summary">
        <span className="myths-page__count">
          <Sparkles size={18} aria-hidden="true" />
          <strong>{`${myths.length} ${t(myths.length > 1 ? 'myths.countPlural' : 'myths.countSingular')}`}</strong>
        </span>
        {hasFilters ? (
          <span className="myths-page__count-filtered">
            {pluralize(filtered.length, 'résultat affiché', 'résultats affichés')}
          </span>
        ) : null}
      </div>

      {/* ------------------------------ Outils de filtrage ------------------------------ */}
      <div className="myths-page__tools">
        <div className="myths-page__search">
          <label className="sr-only" htmlFor="myths-search">
            Rechercher un mythe ou une information
          </label>
          <Search size={18} aria-hidden="true" className="myths-page__search-icon" />
          <Input
            id="myths-search"
            type="search"
            className="myths-page__search-input"
            placeholder="Rechercher un mythe ou une information…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {!loading && !error && categories.length > 0 ? (
          <div className="myths-page__filters" role="group" aria-label="Filtrer par catégorie">
            <Chip
              selected={category === ALL_CATEGORIES}
              onClick={() => setCategory(ALL_CATEGORIES)}
            >
              Toutes
            </Chip>
            {categories.map((cat) => (
              <Chip key={cat} selected={category === cat} onClick={() => setCategory(cat)}>
                {cat}
              </Chip>
            ))}
          </div>
        ) : null}
      </div>

      {/* --------------------------------- Contenu --------------------------------- */}
      {loading ? (
        <SkeletonCards count={6} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Aucun mythe ne correspond"
          description="Essaie un autre mot-clé ou choisis une autre catégorie pour explorer les idées reçues."
          action={
            hasFilters ? (
              <Button
                variant="outline"
                onClick={() => {
                  setQuery('');
                  setCategory(ALL_CATEGORIES);
                }}
              >
                Réinitialiser les filtres
              </Button>
            ) : (
              <Button to="/app/chat" icon={MessageCircle}>
                Poser ma question au chatbot
              </Button>
            )
          }
        />
      ) : (
        <ul className="myths-page__grid">
          {filtered.map((item) => (
            <MythCard key={item.id} item={item} />
          ))}
        </ul>
      )}

      {/* ------------------------------- Rappel de bas de page ------------------------------- */}
      <Card tone="soft" padding="md" className="myths-page__cta">
        <div className="myths-page__cta-text">
          <h2 className="myths-page__cta-title">Tu as entendu une autre rumeur ?</h2>
          <p className="text-muted">
            Le chatbot WeToo répond à tes questions en toute confidentialité et t’oriente vers des
            sources fiables.
          </p>
        </div>
        <Button to="/app/chat" variant="accent" icon={MessageCircle}>
          Poser ma question au chatbot
        </Button>
      </Card>
    </div>
  );
}

/* ============================== Carte de mythe ============================== */
function MythCard({ item }) {
  const [revealed, setRevealed] = useState(false);
  const truthId = useId();

  return (
    <Card as="li" padding="md" className="myth-card">
      {item.category ? (
        <div className="myth-card__top">
          <Badge tone="neutral" size="sm">
            {item.category}
          </Badge>
        </div>
      ) : null}

      {/* Le mythe (toujours visible) */}
      <div className="myth-card__myth">
        <span className="myth-card__icon myth-card__icon--myth" aria-hidden="true">
          <XCircle size={20} />
        </span>
        <div>
          <p className="myth-card__label">Mythe</p>
          <p className="myth-card__text">{item.myth}</p>
        </div>
      </div>

      {/* La vérité (révélée au clic) */}
      {revealed ? (
        <div className="myth-card__truth" id={truthId}>
          <span className="myth-card__icon myth-card__icon--truth" aria-hidden="true">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p className="myth-card__label">Vraie info</p>
            <p className="myth-card__text">{item.truth}</p>
            {item.source ? <p className="myth-card__source">Source : {item.source}</p> : null}
          </div>
        </div>
      ) : null}

      <div className="myth-card__footer">
        <Button
          variant={revealed ? 'ghost' : 'soft'}
          size="sm"
          block
          icon={revealed ? EyeOff : Eye}
          aria-expanded={revealed}
          aria-controls={truthId}
          onClick={() => setRevealed((v) => !v)}
        >
          {revealed ? 'Replier' : 'Voir la vraie info'}
        </Button>
        {item.source && !revealed ? (
          <span className="myth-card__source-hint">Source : {item.source}</span>
        ) : null}
      </div>
    </Card>
  );
}
