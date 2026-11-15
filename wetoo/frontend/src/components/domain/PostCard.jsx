import { Link } from 'react-router-dom';
import { Ghost, HandHeart, ThumbsUp, MessageSquare, Flag } from 'lucide-react';
import { Card, Badge, Avatar, IconButton } from '../ui/index.js';
import { timeAgo } from '../../lib/format.js';
import { useLang } from '../../context/LangContext.jsx';
import './PostCard.css';

/**
 * Clés de catalogue pour les identifiants de catégorie du forum
 * (l'API ne renvoie que l'identifiant dans les listes de publications).
 */
const CATEGORY_KEYS = {
  questions: 'postCard.catQuestions',
  'sante-mentale': 'postCard.catMental',
  relations: 'postCard.catRelations',
  grossesse: 'postCard.catGrossesse',
  ist: 'postCard.catIst',
  confidences: 'postCard.catConfidences',
};

export function categoryLabel(id, t) {
  if (!id) return t('postCard.catFallback');
  const key = CATEGORY_KEYS[id];
  return key ? t(key) : id;
}

/**
 * Carte d'une publication du forum.
 *
 * Toute la carte est cliquable via un lien « étiré » (la carte est un <div>,
 * le titre est un <Link> dont le pseudo-élément recouvre la carte). Les boutons
 * de réaction et de signalement sont au-dessus de ce calque et stoppent la
 * propagation pour ne jamais déclencher la navigation.
 *
 * @param {object}   props.post     Publication (forme renvoyée par /api/community/posts)
 * @param {function} props.onReact  (post, type: 'support'|'helpful') => void
 * @param {function} props.onReport (post) => void
 * @param {string}   props.variant  'default' | 'compact'
 */
export function PostCard({ post, onReact, onReport, variant = 'default' }) {
  const { t, lang } = useLang();
  if (!post) return null;

  const reactions = post.reactions || { support: 0, helpful: 0 };
  const author = post.author || { name: t('postCard.anonymous'), avatar: '🕵️' };
  const to = `/app/communaute/${post.id}`;

  function handleReact(type) {
    return (event) => {
      // Empêche la navigation déclenchée par le lien de la carte.
      event.preventDefault();
      event.stopPropagation();
      onReact?.(post, type);
    };
  }

  function handleReport(event) {
    event.preventDefault();
    event.stopPropagation();
    onReport?.(post);
  }

  return (
    <Card className={`post-card post-card--${variant}`} padding="md">
      <div className="post-card__top">
        {post.anonymous ? (
          <span className="post-card__ghost" aria-hidden="true">
            <Ghost size={22} />
          </span>
        ) : (
          <Avatar name={author.name} avatar={author.avatar} size="md" />
        )}

        <div className="post-card__identity">
          <span className="post-card__author">
            {post.anonymous ? t('postCard.anonymous') : author.name}
          </span>
          <span className="post-card__meta">
            {post.authorPseudonym ? `${post.authorPseudonym} · ` : ''}
            {timeAgo(post.createdAt, lang)}
          </span>
        </div>

        <Badge tone="primary">{categoryLabel(post.category, t)}</Badge>
      </div>

      <h3 className="post-card__title">
        <Link to={to} className="post-card__link">
          {post.title}
        </Link>
      </h3>

      {post.excerpt ? <p className="post-card__excerpt clamp-2">{post.excerpt}</p> : null}

      <div className="post-card__footer">
        <div className="post-card__reactions">
          <button
            type="button"
            className="post-card__react"
            onClick={handleReact('support')}
            aria-label={t('postCard.reactSupportAria')(reactions.support || 0)}
          >
            <HandHeart size={16} aria-hidden="true" />
            <span>{reactions.support || 0}</span>
          </button>
          <button
            type="button"
            className="post-card__react"
            onClick={handleReact('helpful')}
            aria-label={t('postCard.reactHelpfulAria')(reactions.helpful || 0)}
          >
            <ThumbsUp size={16} aria-hidden="true" />
            <span>{reactions.helpful || 0}</span>
          </button>
          <span className="post-card__replies">
            <MessageSquare size={16} aria-hidden="true" />
            {post.repliesCount || 0}
          </span>
        </div>

        <IconButton
          label={t('postCard.reportLabel')}
          icon={Flag}
          size="sm"
          onClick={handleReport}
        />
      </div>
    </Card>
  );
}
