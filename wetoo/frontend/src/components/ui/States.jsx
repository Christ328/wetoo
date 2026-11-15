import { Loader2, AlertTriangle, RefreshCw, Inbox } from 'lucide-react';
import { Button } from './Button.jsx';
import { useLang } from '../../context/LangContext.jsx';

export function Spinner({ size = 22, label }) {
  const { t } = useLang();
  return (
    <span className="spinner" role="status" aria-live="polite">
      <Loader2 size={size} className="spinner__icon" aria-hidden="true" />
      <span className="sr-only">{label || t('common.loading')}</span>
    </span>
  );
}

export function Skeleton({ width = '100%', height = 16, radius = 8, className = '' }) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

/** Bloc squelette pour les listes de cartes. */
export function SkeletonCards({ count = 3 }) {
  return (
    <div className="grid grid-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card card--pad-md">
          <Skeleton width="42px" height={42} radius={14} />
          <div style={{ height: 12 }} />
          <Skeleton width="70%" height={18} />
          <div style={{ height: 8 }} />
          <Skeleton width="100%" height={12} />
          <div style={{ height: 6 }} />
          <Skeleton width="85%" height={12} />
        </div>
      ))}
    </div>
  );
}

export function LoadingState({ label }) {
  const { t } = useLang();
  const text = label || t('common.loading');
  return (
    <div className="state state--loading" role="status" aria-live="polite">
      <Spinner size={26} label={text} />
      <p className="state__text">{text}</p>
    </div>
  );
}

export function ErrorState({ error, onRetry, title }) {
  const { t } = useLang();
  const offline = error?.code === 'NETWORK';
  return (
    <div className="state state--error" role="alert">
      <span className="state__icon state__icon--danger" aria-hidden="true">
        <AlertTriangle size={24} />
      </span>
      <h3 className="state__title">{offline ? t('common.offlineTitle') : title || t('common.errorTitle')}</h3>
      <p className="state__text">
        {error?.message || t('common.errorGeneric')}
        {offline ? ` ${t('common.offlineHint')}` : ''}
      </p>
      {onRetry ? (
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
          {t('common.retry')}
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className = '' }) {
  return (
    <div className={`state state--empty ${className}`.trim()}>
      <span className="state__icon" aria-hidden="true">
        <Icon size={24} />
      </span>
      <h3 className="state__title">{title}</h3>
      {description ? <p className="state__text">{description}</p> : null}
      {action}
    </div>
  );
}
