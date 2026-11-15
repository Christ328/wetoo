/** Badge de statut. */
export function Badge({ children, tone = 'neutral', size = 'md', icon: Icon, className = '' }) {
  return (
    <span className={`badge badge--${tone} badge--${size} ${className}`.trim()}>
      {Icon ? <Icon size={14} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

/**
 * Puce de contenu / filtre.
 * Rend un <button> si `onClick` ou `selected` est fourni, sinon un <span>.
 */
export function Chip({ children, selected = false, onClick, icon: Icon, tone = 'neutral', className = '', ...rest }) {
  const classes = ['chip', `chip--${tone}`, selected ? 'is-selected' : '', className]
    .filter(Boolean)
    .join(' ');

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick} aria-pressed={selected} {...rest}>
        {Icon ? <Icon size={15} aria-hidden="true" /> : null}
        <span className="chip__label">{children}</span>
      </button>
    );
  }

  return (
    <span className={classes} {...rest}>
      {Icon ? <Icon size={15} aria-hidden="true" /> : null}
      <span className="chip__label">{children}</span>
    </span>
  );
}
