import { Languages } from 'lucide-react';
import { useLang } from '../../context/LangContext.jsx';
import { IconButton } from '../ui/Button.jsx';

export function LangToggle() {
  const { lang, toggleLang, t } = useLang();
  return (
    <IconButton
      label={t('lang.switchTo')}
      icon={Languages}
      onClick={toggleLang}
      className="lang-toggle"
      aria-label={t('lang.ariaLabel')}
      title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
    />
  );
}
