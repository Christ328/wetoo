/** Titre de section réutilisable (surtitre + titre + description). */
export function SectionHeading({ eyebrow, title, description, align = 'left', as: Tag = 'h2', className = '' }) {
  return (
    <div className={`section-heading section-heading--${align} ${className}`.trim()}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {title ? <Tag className="section-heading__title">{title}</Tag> : null}
      {description ? <p className="section-heading__description">{description}</p> : null}
    </div>
  );
}
