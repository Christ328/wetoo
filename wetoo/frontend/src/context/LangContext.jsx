import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fr } from '../i18n/fr.js';
import { en } from '../i18n/en.js';

const CATALOGUES = { fr, en };
const LangContext = createContext(null);

function getInitialLang() {
  if (typeof navigator === 'undefined') return 'fr';
  const navLang = navigator.language?.slice(0, 2).toLowerCase();
  return navLang === 'en' ? 'en' : 'fr';
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  const setLang = useCallback((l) => {
    setLangState(l);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((l) => (l === 'fr' ? 'en' : 'fr'));
  }, []);

  // Garde l'attribut `lang` du document synchronisé (accessibilité / SEO).
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  /**
   * t(key) - looks up a dot-notation key like 'chat.title'.
   * Falls back to fr if key is missing in the active catalogue.
   */
  const t = useCallback(
    (key) => {
      const parts = key.split('.');
      let node = CATALOGUES[lang];
      for (const part of parts) {
        if (node == null) break;
        node = node[part];
      }
      if (node == null) {
        node = CATALOGUES.fr;
        for (const part of parts) {
          if (node == null) break;
          node = node[part];
        }
      }
      return node ?? key;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, setLang, toggleLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside a LangProvider');
  return ctx;
}
