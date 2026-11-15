/**
 * Barre de progression accessible.
 * `value` sur `max` (100 par défaut).
 */
export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValue = false,
  tone = 'primary',
  size = 'md',
  className = '',
}) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0));
  return (
    <div className={`progress progress--${size} ${className}`.trim()}>
      {label ? (
        <div className="progress__meta">
          <span className="progress__label">{label}</span>
          {showValue ? <span className="progress__value">{Math.round(pct)}%</span> : null}
        </div>
      ) : null}
      <div
        className={`progress__track progress__track--${tone}`}
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progression'}
      >
        <span className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Anneau de progression pour les indicateurs de niveau. */
export function ProgressRing({ value = 0, max = 100, size = 64, stroke = 6, children }) {
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="progress-ring__track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
        <circle
          className="progress-ring__fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="progress-ring__content">{children}</span>
    </div>
  );
}
