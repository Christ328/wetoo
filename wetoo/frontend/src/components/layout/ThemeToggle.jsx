import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useLang } from '../../context/LangContext.jsx';
import { IconButton } from '../ui/Button.jsx';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLang();
  const nextKey = theme === 'dark' ? 'theme.light' : 'theme.dark';
  const label = t('theme.switchTo')(t(nextKey));
  return (
    <IconButton
      label={label}
      icon={theme === 'dark' ? Sun : Moon}
      onClick={toggleTheme}
      className="theme-toggle"
    />
  );
}
