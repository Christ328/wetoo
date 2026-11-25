import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { fr } from '../i18n/fr.js';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const lang = 'fr';

  // Garde l'attribut `lang` du document synchronisé (accessibilité / SEO).
  useEffect(() => {
    document.documentElement.lang = 'fr';
  }, []);

  /**
   * t(key) - looks up a dot-notation key like 'chat.title'.
   */
  const t = useCallback(
    (key) => {
      const parts = key.split('.');
      let node = fr;
      for (const part of parts) {
        if (node == null) break;
        node = node[part];
      }
      return node ?? key;
    },
    []
  );

  const value = useMemo(() => ({ lang, setLang: () => {}, toggleLang: () => {}, t }), [t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside a LangProvider');
  return ctx;
}
