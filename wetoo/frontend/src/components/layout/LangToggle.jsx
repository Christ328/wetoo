import { Languages } from 'lucide-react';
import { useLang } from '../../context/LangContext.jsx';
import { IconButton } from '../ui/Button.jsx';

export function LangToggle() {
  const { toggleLang, t } = useLang();
  return (
    <IconButton
      label={t('lang.ariaLabel')}
      icon={Languages}
      onClick={toggleLang}
      className="lang-toggle"
      title={t('lang.switchTo')}
    />
  );
}
