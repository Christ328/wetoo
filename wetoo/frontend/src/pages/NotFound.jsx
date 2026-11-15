import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { EmptyState } from '../components/ui/States.jsx';
import { Compass } from 'lucide-react';
import { useLang } from '../context/LangContext.jsx';

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="app-shell">
      <div className="mesh-bg" aria-hidden="true" />
      <main id="main" className="container section">
        <EmptyState
          icon={Compass}
          title={t('notFound.title')}
          description={t('notFound.desc')}
          action={
            <div className="row wrap">
              <Button to="/">{t('notFound.home')}</Button>
              <Button to="/app" variant="outline">
                {t('notFound.openApp')}
              </Button>
            </div>
          }
        />
        <p className="text-center text-subtle" style={{ marginTop: 'var(--space-6)' }}>
          <Link to="/app/ressources">{t('notFound.helpLink')}</Link>
        </p>
      </main>
    </div>
  );
}
