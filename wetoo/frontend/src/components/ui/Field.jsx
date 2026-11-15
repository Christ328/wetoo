import { forwardRef, useId } from 'react';

/** Enveloppe de champ de formulaire : libellé, indication, message d'erreur. */
export function Field({
  label,
  hint,
  error,
  required = false,
  htmlFor,
  className = '',
  children,
}) {
  const autoId = useId();
  const id = htmlFor || autoId;
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`.trim()}>
      {label ? (
        <label className="field__label" htmlFor={id}>
          {label}
          {required ? (
            <span className="field__required" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children
        ? typeof children === 'function'
          ? children({ id, 'aria-describedby': hint || error ? `${id}-help` : undefined })
          : children
        : null}
      {error ? (
        <p className="field__error" id={`${id}-help`} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field__hint" id={`${id}-help`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ className = '', invalid = false, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={`input ${invalid ? 'input--invalid' : ''} ${className}`.trim()}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className = '', invalid = false, rows = 4, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`input textarea ${invalid ? 'input--invalid' : ''} ${className}`.trim()}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});

export const Select = forwardRef(function Select({ className = '', invalid = false, children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      className={`input select ${invalid ? 'input--invalid' : ''} ${className}`.trim()}
      aria-invalid={invalid || undefined}
      {...rest}
    >
      {children}
    </select>
  );
});

/** Groupe de boutons radio stylés (choix unique). */
export function RadioPills({ name, options, value, onChange, legend, className = '' }) {
  return (
    <fieldset className={`radio-pills ${className}`.trim()}>
      {legend ? <legend className="field__label">{legend}</legend> : null}
      <div className="radio-pills__group" role="radiogroup" aria-label={legend}>
        {options.map((opt) => {
          const id = `${name}-${opt.value}`;
          const checked = value === opt.value;
          return (
            <label key={opt.value} htmlFor={id} className={`radio-pill ${checked ? 'is-checked' : ''}`}>
              <input
                id={id}
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              {opt.emoji ? (
                <span aria-hidden="true" className="radio-pill__emoji">
                  {opt.emoji}
                </span>
              ) : null}
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
