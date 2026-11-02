import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserPlus,
  UserRound,
  Mail,
  Lock,
  CalendarDays,
  MapPin,
  Info,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Field, Input, Select, RadioPills } from '../components/ui/Field.jsx';
import { Chip } from '../components/ui/Badge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import './Register.css';

/** Les 12 départements du Bénin. */
const REGIONS = [
  'Alibori', 'Atacora', 'Atlantique', 'Borgou', 'Collines', 'Couffo',
  'Donga', 'Littoral', 'Mono', 'Ouémé', 'Plateau', 'Zou',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordScore(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score += 1;
  if (pw.length >= 10) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  return score;
}

export default function Register() {
  const { register, updateProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { t } = useLang();

  const STRENGTH_META = [
    { label: t('register.strengthTooShort'), tone: 'danger' },
    { label: t('register.strengthWeak'),     tone: 'danger' },
    { label: t('register.strengthFair'),     tone: 'warning' },
    { label: t('register.strengthGood'),     tone: 'info' },
    { label: t('register.strengthStrong'),   tone: 'success' },
  ];

  const GENDER_OPTIONS = [
    { value: 'fille',   label: t('register.genderGirl') },
    { value: 'garçon',  label: t('register.genderBoy') },
    { value: 'autre',   label: t('register.genderOther') },
  ];

  const INTERESTS = t('profile.interestOptions');

  const [form, setForm] = useState({
    name: '', email: '', password: '', age: '', gender: '', region: '',
  });
  const [interests, setInterests] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const score = passwordScore(form.password);
  const strength = STRENGTH_META[score];

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleInterest(label) {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  }

  function validate() {
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = t('register.validNameMin');
    if (!form.email.trim()) nextErrors.email = t('register.validEmail');
    else if (!EMAIL_RE.test(form.email.trim())) nextErrors.email = t('register.validEmailFmt');
    if (form.password.length < 6) nextErrors.password = t('register.validPwMin');

    const ageNum = Number(form.age);
    if (!form.age) nextErrors.age = t('register.validAgeReq');
    else if (!Number.isInteger(ageNum)) nextErrors.age = t('register.validAgeInt');
    else if (ageNum < 18 || ageNum > 29) nextErrors.age = t('register.validAgeRange');
    if (!form.gender) nextErrors.gender = t('register.validGender');
    if (!form.region) nextErrors.region = t('register.validRegion');

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.warning(t('register.toastWarning'));
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        age: Number(form.age),
        gender: form.gender,
        region: form.region,
        interests,
      });

      if (interests.length) {
        try {
          await updateProfile({ interests });
        } catch {
          /* inscription réussie même si les centres d'intérêt échouent */
        }
      }

      toast.success(t('register.toastWelcome'));
      navigate('/app', { replace: true });
    } catch (err) {
      const map = {
        invalid_name: 'name',
        invalid_email: 'email',
        email_taken: 'email',
        invalid_password: 'password',
        invalid_gender: 'gender',
        invalid_age: 'age',
        age_out_of_range: 'age',
      };
      const field = map[err.code];
      if (field) setErrors({ [field]: err.message });
      else setFormError(err.message);
      toast.error(t('register.toastError')(err.message));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="register-page">
      <div className="container register-page__inner">
        {/* Colonne d'introduction */}
        <section className="register-page__intro" aria-labelledby="register-title">
          <span className="register-page__pill">
            <Sparkles size={16} aria-hidden="true" />
            {t('register.pill')}
          </span>
          <h1 className="register-page__title" id="register-title">
            {t('register.title')}
          </h1>
          <p className="lead">{t('register.lead')}</p>

          <aside className="register-page__note">
            <span className="icon-tile icon-tile--accent" aria-hidden="true">
              <Info size={20} />
            </span>
            <div>
              <strong>{t('register.ageNoteTitle')}</strong>
              <p>
                {t('register.ageNoteBody1')}<strong>{t('register.ageNoteStrong')}</strong>
                {t('register.ageNoteBody2')}
                <strong>{t('register.ageNoteConf')}</strong>
                {t('register.ageNoteBody3')}
              </p>
            </div>
          </aside>

          <p className="register-page__reassure">
            <ShieldCheck size={18} aria-hidden="true" />
            {t('register.reassure')}
          </p>
        </section>

        {/* Colonne formulaire */}
        <section className="register-page__form-col" aria-labelledby="register-form-title">
          <Card padding="lg" className="register-page__card">
            <div className="register-page__card-head">
              <span className="icon-tile" aria-hidden="true">
                <UserPlus size={22} />
              </span>
              <div>
                <h2 className="register-page__card-title" id="register-form-title">
                  {t('register.cardTitle')}
                </h2>
                <p className="text-muted">{t('register.cardSub')}</p>
              </div>
            </div>

            {formError ? (
              <p className="register-page__alert" role="alert">
                {formError}
              </p>
            ) : null}

            <form className="register-page__form" onSubmit={handleSubmit} noValidate>
              <Field label={t('register.nameLabel')} required htmlFor="reg-name" error={errors.name}>
                <div className="register-page__input-wrap">
                  <UserRound size={18} aria-hidden="true" className="register-page__input-icon" />
                  <Input
                    id="reg-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder={t('register.namePH')}
                    className="register-page__input"
                    value={form.name}
                    invalid={Boolean(errors.name)}
                    onChange={(e) => setField('name', e.target.value)}
                  />
                </div>
              </Field>

              <Field label={t('register.emailLabel')} required htmlFor="reg-email" error={errors.email}>
                <div className="register-page__input-wrap">
                  <Mail size={18} aria-hidden="true" className="register-page__input-icon" />
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('register.emailPH')}
                    className="register-page__input"
                    value={form.email}
                    invalid={Boolean(errors.email)}
                    onChange={(e) => setField('email', e.target.value)}
                  />
                </div>
              </Field>

              <Field
                label={t('register.pwLabel')}
                required
                htmlFor="reg-password"
                error={errors.password}
                hint={t('register.pwHint')}
              >
                <div className="register-page__input-wrap">
                  <Lock size={18} aria-hidden="true" className="register-page__input-icon" />
                  <Input
                    id="reg-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="register-page__input"
                    value={form.password}
                    invalid={Boolean(errors.password)}
                    onChange={(e) => setField('password', e.target.value)}
                  />
                </div>
                <div className="register-page__strength" aria-live="polite">
                  <div className="register-page__strength-bars" aria-hidden="true">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`register-page__strength-bar ${
                          form.password && i < score
                            ? `is-on register-page__strength-bar--${strength.tone}`
                            : ''
                        }`}
                      />
                    ))}
                  </div>
                  {form.password ? (
                    <span className="register-page__strength-label">
                      {t('register.pwStrength')(strength.label)}
                    </span>
                  ) : null}
                </div>
              </Field>

              <Field
                label={t('register.ageLabel')}
                required
                htmlFor="reg-age"
                error={errors.age}
                hint={t('register.ageHint')}
              >
                <div className="register-page__input-wrap">
                  <CalendarDays size={18} aria-hidden="true" className="register-page__input-icon" />
                  <Input
                    id="reg-age"
                    name="age"
                    type="number"
                    min={18}
                    max={29}
                    inputMode="numeric"
                    placeholder={t('register.agePH')}
                    className="register-page__input"
                    value={form.age}
                    invalid={Boolean(errors.age)}
                    onChange={(e) => setField('age', e.target.value)}
                  />
                </div>
              </Field>

              <div className="register-page__field">
                <RadioPills
                  name="gender"
                  legend={t('register.genderLegend')}
                  options={GENDER_OPTIONS}
                  value={form.gender}
                  onChange={(v) => setField('gender', v)}
                />
                {errors.gender ? (
                  <p className="field__error" role="alert">
                    {errors.gender}
                  </p>
                ) : null}
              </div>

              <Field label={t('register.regionLabel')} required htmlFor="reg-region" error={errors.region}>
                <div className="register-page__input-wrap">
                  <MapPin size={18} aria-hidden="true" className="register-page__input-icon" />
                  <Select
                    id="reg-region"
                    name="region"
                    className="register-page__input"
                    value={form.region}
                    invalid={Boolean(errors.region)}
                    onChange={(e) => setField('region', e.target.value)}
                  >
                    <option value="">{t('register.regionDefault')}</option>
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </div>
              </Field>

              <div className="register-page__field">
                <p className="register-page__field-label">{t('register.interestsLabel')}</p>
                <p className="register-page__field-hint">{t('register.interestsHint')}</p>
                <div className="register-page__chips" role="group" aria-label={t('register.interestsAria')}>
                  {(Array.isArray(INTERESTS) ? INTERESTS : []).map((label) => (
                    <Chip
                      key={label}
                      selected={interests.includes(label)}
                      onClick={() => toggleInterest(label)}
                    >
                      {label}
                    </Chip>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                block
                loading={submitting}
                iconRight={ArrowRight}
                className="register-page__submit"
              >
                {t('register.submit')}
              </Button>
            </form>

            <p className="register-page__switch">
              {t('register.hasAccount')} <Link to="/connexion">{t('register.signIn')}</Link>
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
}
