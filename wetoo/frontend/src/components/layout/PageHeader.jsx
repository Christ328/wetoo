/** En-tête de page interne (titre, description, actions). */
export function PageHeader({ eyebrow, title, description, icon: Icon, actions, className = '' }) {
  return (
    <header className={`page-header ${className}`.trim()}>
      <div className="page-header__main">
        {Icon ? (
          <span className="page-header__icon" aria-hidden="true">
            <Icon size={24} />
          </span>
        ) : null}
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className="page-header__title">{title}</h1>
          {description ? <p className="page-header__description">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}
