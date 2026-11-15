import { useId } from 'react';
import { useLang } from '../../context/LangContext.jsx';

/**
 * Onglets accessibles (rôle tablist).
 * `items` : [{ id, label, icon?, badge? }]
 */
export function Tabs({ items, value, onChange, ariaLabel, variant = 'pill', className = '' }) {
  const { t } = useLang();
  const baseId = useId();

  function onKeyDown(e) {
    const idx = items.findIndex((i) => i.id === value);
    if (idx === -1) return;
    let next = null;
    if (e.key === 'ArrowRight') next = (idx + 1) % items.length;
    if (e.key === 'ArrowLeft') next = (idx - 1 + items.length) % items.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = items.length - 1;
    if (next !== null) {
      e.preventDefault();
      onChange(items[next].id);
      document.getElementById(`${baseId}-tab-${items[next].id}`)?.focus();
    }
  }

  return (
    <div
      className={`tabs tabs--${variant} ${className}`.trim()}
      role="tablist"
      aria-label={ariaLabel || t('common.sections')}
      onKeyDown={onKeyDown}
    >
      {items.map((item) => {
        const selected = item.id === value;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            id={`${baseId}-tab-${item.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={`tabs__tab ${selected ? 'is-selected' : ''}`}
            onClick={() => onChange(item.id)}
          >
            {Icon ? <Icon size={17} aria-hidden="true" /> : null}
            <span>{item.label}</span>
            {item.badge != null ? <span className="tabs__badge">{item.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
