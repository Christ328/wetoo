/**
 * Carte de contenu générique.
 * `tone` : default | soft | accent | warm | outline
 * `interactive` : ajoute un effet de survol (à utiliser quand toute la carte est cliquable)
 */
export function Card({
  as: Tag = 'div',
  tone = 'default',
  interactive = false,
  padding = 'md',
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'card',
    `card--${tone}`,
    `card--pad-${padding}`,
    interactive ? 'card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, action, className = '' }) {
  return (
    <div className={`card__header ${className}`.trim()}>
      {Icon ? (
        <span className="card__header-icon" aria-hidden="true">
          <Icon size={20} />
        </span>
      ) : null}
      <div className="card__header-text">
        <h3 className="card__title">{title}</h3>
        {subtitle ? <p className="card__subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div className="card__header-action">{action}</div> : null}
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={`card__body ${className}`.trim()}>{children}</div>;
}

export function CardFooter({ className = '', children }) {
  return <div className={`card__footer ${className}`.trim()}>{children}</div>;
}
