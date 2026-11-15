import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './Button.jsx';
import { useLang } from '../../context/LangContext.jsx';

/**
 * Fenêtre modale accessible :
 * - fermeture via Échap et clic sur l'arrière-plan,
 * - focus déplacé dans la boîte puis restitué à la fermeture,
 * - défilement du corps bloqué.
 */
export function Modal({ open, onClose, title, description, size = 'md', footer, children }) {
  const { t } = useLang();
  const boxRef = useRef(null);
  const lastFocused = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    lastFocused.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const node = boxRef.current;
    node?.querySelector('[data-autofocus]')?.focus() || node?.focus();

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
    }
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      lastFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal" role="presentation">
      <div className="modal__overlay" onClick={onClose} aria-hidden="true" />
      <div
        ref={boxRef}
        className={`modal__box modal__box--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
      >
        <header className="modal__header">
          <div>
            {title ? (
              <h2 className="modal__title" id="modal-title">
                {title}
              </h2>
            ) : null}
            {description ? <p className="modal__description">{description}</p> : null}
          </div>
          <IconButton label={t('common.close')} icon={X} onClick={onClose} />
        </header>
        <div className="modal__body">{children}</div>
        {footer ? <footer className="modal__footer">{footer}</footer> : null}
      </div>
    </div>,
    document.body
  );
}
