import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useLang } from './LangContext.jsx';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

let seq = 0;

export function ToastProvider({ children }) {
  const { t: tr } = useLang();
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message, { type = 'info', duration = 4200, action } = {}) => {
      const id = ++seq;
      setToasts((list) => [...list.slice(-3), { id, message, type, action }]);
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration)
        );
      }
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toasts,
      dismiss,
      push,
      success: (m, o) => push(m, { ...o, type: 'success' }),
      error: (m, o) => push(m, { ...o, type: 'error', duration: 6000 }),
      info: (m, o) => push(m, { ...o, type: 'info' }),
      warning: (m, o) => push(m, { ...o, type: 'warning', duration: 6000 }),
    }),
    [toasts, dismiss, push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="region" aria-label={tr('common.notifications')}>
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          return (
            <div key={t.id} className={`toast toast--${t.type}`} role="status" aria-live="polite">
              <Icon size={20} aria-hidden="true" className="toast__icon" />
              <div className="toast__body">
                <p className="toast__message">{t.message}</p>
                {t.action ? (
                  <button
                    type="button"
                    className="toast__action"
                    onClick={() => {
                      t.action.onClick?.();
                      dismiss(t.id);
                    }}
                  >
                    {t.action.label}
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                className="toast__close"
                onClick={() => dismiss(t.id)}
                aria-label={tr('common.closeNotification')}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast doit être utilisé dans un ToastProvider');
  return ctx;
}
