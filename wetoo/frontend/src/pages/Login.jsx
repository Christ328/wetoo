import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LogIn,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Field, Input } from '../components/ui/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import './Login.css';

/**
 * Comptes de démonstration repris du seed backend (mot de passe commun : wetoo123).
 * Ils servent à pré-remplir le formulaire lors d'une démonstration.
 */
const DEMO_ACCOUNTS = [
  { name: 'Awa', email: 'awa@wetoo.bj', avatar: '🌸', meta: '20 ans · Littoral' },
  { name: 'Rodrigue', email: 'rodrigue@wetoo.bj', avatar: '⚽', meta: '23 ans · Atlantique' },
  { name: 'Grâce', email: 'grace@wetoo.bj', avatar: '📚', meta: '19 ans · Ouémé' },
  { name: 'Sessi', email: 'sessi@wetoo.bj', avatar: '🎨', meta: '25 ans · Zou' },
];

const DEMO_PASSWORD = 'wetoo123';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { t } = useLang();

  const rawNext = params.get('next');
  const nextPath = rawNext && rawNext.startsWith('/') ? rawNext : '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function fillDemo(account) {
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setErrors({});
    setFormError('');
    toast.info(t('login.toastFilled')(account.name));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const nextErrors = {};
    if (!email.trim()) nextErrors.email = t('login.validEmail');
    else if (!EMAIL_RE.test(email.trim())) nextErrors.email = t('login.validEmailFmt');
    if (!password) nextErrors.password = t('login.validPassword');
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      toast.success(t('login.toastWelcome')(user.name));
      navigate(nextPath, { replace: true });
    } catch (err) {
      if (err.code === 'invalid_email') {
        setErrors({ email: err.message });
      } else if (err.code === 'invalid_password') {
        setErrors({ password: err.message });
      } else {
        setFormError(err.message);
      }
      toast.error(t('login.toastError')(err.message));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="container login-page__inner">
        {/* Colonne marketing */}
        <section className="login-page__pitch" aria-labelledby="login-pitch-title">
          <span className="login-page__pill">
            <Sparkles size={16} aria-hidden="true" />
            {t('login.pill')}
          </span>
          <h1 className="login-page__title" id="login-pitch-title">
            {t('login.title')}
          </h1>
          <p className="lead">{t('login.lead')}</p>

          <ul className="login-page__trust">
            <li className="login-page__trust-item">
              <span className="icon-tile icon-tile--accent" aria-hidden="true">
                <ShieldCheck size={20} />
              </span>
              <div>
                <strong>{t('login.trustAnon')}</strong>
                <span>{t('login.trustAnonSub')}</span>
              </div>
            </li>
            <li className="login-page__trust-item">
              <span className="icon-tile" aria-hidden="true">
                <LockKeyhole size={20} />
              </span>
              <div>
                <strong>{t('login.trustData')}</strong>
                <span>{t('login.trustDataSub')}</span>
              </div>
            </li>
          </ul>
        </section>

        {/* Colonne formulaire */}
        <section className="login-page__panel" aria-labelledby="login-form-title">
          <Card padding="lg" className="login-page__card">
            <div className="login-page__card-head">
              <span className="icon-tile" aria-hidden="true">
                <LogIn size={22} />
              </span>
              <div>
                <h2 className="login-page__card-title" id="login-form-title">
                  {t('login.cardTitle')}
                </h2>
                <p className="text-muted">{t('login.cardSub')}</p>
              </div>
            </div>

            {formError ? (
              <p className="login-page__alert" role="alert">
                {formError}
              </p>
            ) : null}

            <form className="login-page__form" onSubmit={handleSubmit} noValidate>
              <Field label={t('login.emailLabel')} required htmlFor="login-email" error={errors.email}>
                <div className="login-page__input-wrap">
                  <Mail size={18} aria-hidden="true" className="login-page__input-icon" />
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('login.emailPH')}
                    className="login-page__input"
                    value={email}
                    invalid={Boolean(errors.email)}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </Field>

              <Field label={t('login.passwordLabel')} required htmlFor="login-password" error={errors.password}>
                <div className="login-page__input-wrap">
                  <Lock size={18} aria-hidden="true" className="login-page__input-icon" />
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="login-page__input"
                    value={password}
                    invalid={Boolean(errors.password)}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </Field>

              <Button
                type="submit"
                size="lg"
                block
                loading={submitting}
                iconRight={ArrowRight}
                className="login-page__submit"
              >
                {t('login.submit')}
              </Button>
            </form>

            <p className="login-page__switch">
              {t('login.noAccount')}{' '}
              <Link to="/inscription">{t('login.createFree')}</Link>
            </p>

            {/* Comptes de démonstration */}
            <div className="login-page__demo">
              <p className="login-page__demo-title">
                <CheckCircle2 size={16} aria-hidden="true" />
                {t('login.demoTitle')}
              </p>
              <ul className="login-page__demo-list">
                {DEMO_ACCOUNTS.map((account) => (
                  <li key={account.email}>
                    <button
                      type="button"
                      className="login-page__demo-btn"
                      onClick={() => fillDemo(account)}
                    >
                      <span className="login-page__demo-avatar" aria-hidden="true">
                        {account.avatar}
                      </span>
                      <span className="login-page__demo-text">
                        <strong>{account.name}</strong>
                        <span>{account.email}</span>
                      </span>
                      <span className="login-page__demo-meta">{account.meta}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="login-page__demo-note">
                {t('login.demoPassword')(DEMO_PASSWORD)}
              </p>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
