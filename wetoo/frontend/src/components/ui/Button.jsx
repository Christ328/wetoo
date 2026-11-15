﻿import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Bouton polyvalent.
 * - `variant` : primary | accent | warm | outline | ghost | soft | danger
 * - `size`    : sm | md | lg
 * - Rend un <Link> si `to`, un <a> si `href`, sinon un <button>.
 */
export const Button = forwardRef(function Button(
  {
    to,
    href,
    variant = 'primary',
    size = 'md',
    block = false,
    loading = false,
    disabled = false,
    icon: Icon,
    iconRight: IconRight,
    type = 'button',
    className = '',
    children,
    ...rest
  },
  ref
) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    block ? 'btn--block' : '',
    loading ? 'is-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading ? (
        <Loader2 className="btn__spinner" size={18} aria-hidden="true" />
      ) : Icon ? (
        <Icon className="btn__icon" size={18} aria-hidden="true" />
      ) : null}
      <span className="btn__label">{children}</span>
      {IconRight && !loading ? (
        <IconRight className="btn__icon btn__icon--right" size={18} aria-hidden="true" />
      ) : null}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        className={classes}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
});

/** Bouton carré réservé aux icônes - `label` est obligatoire (accessibilité). */
export const IconButton = forwardRef(function IconButton(
  { label, icon: Icon, size = 'md', variant = 'ghost', className = '', children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className={`icon-btn icon-btn--${size} icon-btn--${variant} ${className}`.trim()}
      aria-label={label}
      title={label}
      {...rest}
    >
      {Icon ? <Icon size={size === 'sm' ? 18 : 20} aria-hidden="true" /> : children}
    </button>
  );
});
