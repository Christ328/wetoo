import { useMemo, useState } from 'react';
import {
  Stethoscope,
  Search,
  ShieldCheck,
  LifeBuoy,
  Send,
  Star,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Modal,
  Field,
  Input,
  Textarea,
  RadioPills,
  Badge,
  Avatar,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../components/ui/index.js';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { formatDate } from '../lib/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useRequireAuth } from '../lib/useRequireAuth.js';
import { useLang } from '../context/LangContext.jsx';
import './Experts.css';

const CONTACT_NEEDS_VALUE = ['sms', 'call', 'whatsapp'];

const QUESTION_MAX = 600;

/** Annuaire des professionnel·les de santé et demandes de mise en relation. */
export default function Experts() {
  const toast = useToast();
  const requireAuth = useRequireAuth();
  const { isAuthenticated } = useAuth();
  const { t, lang } = useLang();

  const contactOptions = [
    { value: 'chat', label: t('experts.contactOptions.chat') },
    { value: 'sms', label: t('experts.contactOptions.sms') },
    { value: 'call', label: t('experts.contactOptions.call') },
    { value: 'whatsapp', label: t('experts.contactOptions.whatsapp') },
  ];

  const requestStatus = {
    received: { label: t('experts.statusLabels.received'), tone: 'info' },
    in_progress: { label: t('experts.statusLabels.in_progress'), tone: 'warning' },
    answered: { label: t('experts.statusLabels.answered'), tone: 'success' },
    closed: { label: t('experts.statusLabels.closed'), tone: 'neutral' },
  };

  const expertsApi = useApi('/experts', { auth: false, cache: true });
  const requestsApi = useApi(isAuthenticated ? '/experts/me/requests' : null, { auth: true });

  const experts = Array.isArray(expertsApi.data) ? expertsApi.data : [];

  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');

  // --- Modal de demande ---
  const [target, setTarget] = useState(null);
  const [question, setQuestion] = useState('');
  const [preference, setPreference] = useState('chat');
  const [contactValue, setContactValue] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const roles = useMemo(
    () => Array.from(new Set(experts.map((expert) => expert.role).filter(Boolean))),
    [experts]
  );

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return experts.filter((expert) => {
      const matchRole = !role || expert.role === role;
      const haystack = [expert.name, expert.role, expert.specialty, expert.bio]
        .join(' ')
        .toLowerCase();
      const matchSearch = !needle || haystack.includes(needle);
      return matchRole && matchSearch;
    });
  }, [experts, role, search]);

  // ------------------------------ Actions ------------------------------
  function openRequest(expert) {
    requireAuth(() => {
      setQuestion('');
      setPreference('chat');
      setContactValue('');
      setConsent(false);
      setSuccess(null);
      setTarget(expert);
    });
  }

  function closeRequest() {
    setTarget(null);
    setSuccess(null);
  }

  async function submitRequest(event) {
    event.preventDefault();
    if (submitting || !target) return;
    if (question.trim().length < 10) {
      toast.error(t('experts.validQMin'));
      return;
    }
    if (CONTACT_NEEDS_VALUE.includes(preference) && contactValue.trim().length < 5) {
      toast.error(t('experts.validContact'));
      return;
    }
    if (!consent) {
      toast.error(t('experts.validConsent'));
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.post(`/experts/${target.id}/requests`, {
        question: question.trim(),
        contactPreference: preference,
        contactValue: CONTACT_NEEDS_VALUE.includes(preference) ? contactValue.trim() : undefined,
      });
      setSuccess({
        etaHours: result?.etaHours,
        message: result?.message,
        expertName: target.name,
      });
      toast.success(result?.message || t('experts.successMsg')(target.name));
      if (isAuthenticated) requestsApi.refetch();
    } catch (err) {
      toast.error(err?.message || t('common.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  }

  // ------------------------------ Rendu ------------------------------
  const requests = Array.isArray(requestsApi.data) ? requestsApi.data : [];

  return (
    <div className="experts-page">
      <PageHeader
        eyebrow={t('experts.eyebrow')}
        title={t('experts.title')}
        description={t('experts.desc')}
        icon={Stethoscope}
      />

      <div className="experts-page__toolbar">
        <div className="experts-page__search">
          <Search size={18} aria-hidden="true" className="experts-page__search-icon" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('experts.searchPH')}
            aria-label={t('experts.searchAria')}
            className="experts-page__search-input"
          />
        </div>

        <div className="experts-page__chips tag-row" role="group" aria-label={t('experts.filterAria')}>
          <Chip selected={role === ''} onClick={() => setRole('')}>
            {t('experts.filterAll')}
          </Chip>
          {roles.map((item) => (
            <Chip key={item} selected={role === item} onClick={() => setRole(item)}>
              {item}
            </Chip>
          ))}
        </div>
      </div>

      {expertsApi.loading ? (
        <LoadingState label={t('experts.loadingExperts')} />
      ) : expertsApi.error ? (
        <ErrorState error={expertsApi.error} onRetry={expertsApi.refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title={t('experts.noExpertTitle')}
          description={t('experts.noExpertDesc')}
        />
      ) : (
        <div className="grid grid-2 experts-page__grid stagger">
          {filtered.map((expert) => (
            <Card key={expert.id} className="experts-page__card">
              <div className="experts-page__card-head">
                <Avatar name={expert.name} avatar={expert.avatar} size="lg" />
                <div className="experts-page__card-id">
                  <h3 className="experts-page__name">{expert.name}</h3>
                  <p className="experts-page__role">{expert.role}</p>
                  <p className="experts-page__specialty">{expert.specialty}</p>
                </div>
              </div>

              {expert.bio ? <p className="experts-page__bio clamp-3">{expert.bio}</p> : null}

              {expert.languages?.length ? (
                <div className="tag-row experts-page__languages">
                  {expert.languages.map((language) => (
                    <Badge key={language} tone="neutral">
                      {language}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <div className="meta-row experts-page__meta">
                {expert.availability ? (
                  <Badge tone="success" icon={Clock}>
                    {expert.availability}
                  </Badge>
                ) : null}
                {typeof expert.rating === 'number' ? (
                  <span className="meta-item">
                    <Star size={14} aria-hidden="true" /> {expert.rating.toFixed(1)}
                  </span>
                ) : null}
                {typeof expert.sessionsDone === 'number' ? (
                  <span className="meta-item">{t('experts.sessions')(expert.sessionsDone)}</span>
                ) : null}
              </div>

              <Button block icon={Send} onClick={() => openRequest(expert)}>
                {t('experts.askBtn')}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* ------------------------------ Mes demandes ------------------------------ */}
      {isAuthenticated ? (
        <section className="experts-page__requests" aria-labelledby="my-requests-title">
          <h2 id="my-requests-title" className="experts-page__section-title">
            {t('experts.myRequestsTitle')}
          </h2>

          {requestsApi.loading ? (
            <LoadingState label={t('experts.loadingReqs')} />
          ) : requestsApi.error ? (
            <ErrorState error={requestsApi.error} onRetry={requestsApi.refetch} />
          ) : requests.length === 0 ? (
            <EmptyState
              icon={Send}
              title={t('experts.noReqTitle')}
              description={t('experts.noReqDesc')}
            />
          ) : (
            <ul className="experts-page__request-list stack stagger">
              {requests.map((request) => {
                const status = requestStatus[request.status] || {
                  label: t('experts.statusLabels.received'),
                  tone: 'info',
                };
                return (
                  <li key={request.id}>
                    <Card padding="sm">
                      <div className="experts-page__request-head">
                        <div className="experts-page__request-id">
                          <span className="experts-page__request-expert">
                            {request.expertName}
                          </span>
                          <span className="experts-page__request-question clamp-1">
                            {request.question}
                          </span>
                        </div>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </div>
                      <span className="text-subtle experts-page__request-date">
                        {t('experts.sentOn')(formatDate(request.createdAt, lang))}
                      </span>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : null}

      {/* ------------------------------ Confidentialité ------------------------------ */}
      <Card tone="accent" className="experts-page__privacy">
        <CardHeader
          title={t('experts.privacyTitle')}
          subtitle={t('experts.privacySub')}
          icon={ShieldCheck}
        />
        <CardBody>
          <p className="experts-page__privacy-text">
            {t('experts.privacyText1')}
          </p>
          <p className="experts-page__privacy-text">
            {t('experts.privacyText2')}
          </p>
          <Button variant="outline" to="/app/ressources" icon={LifeBuoy}>
            {t('experts.seeHelplines')}
          </Button>
        </CardBody>
      </Card>

      {/* ------------------------ Modal : demande à un expert ------------------------ */}
      <Modal
        open={Boolean(target)}
        onClose={closeRequest}
        title={success ? t('experts.successTitle') : t('experts.requestTitle')}
        description={
          success
            ? undefined
            : target
              ? t('experts.requestDesc')(target.name)
              : undefined
        }
      >
        {success ? (
          <div className="experts-page__success">
            <span className="experts-page__success-icon" aria-hidden="true">
              <CheckCircle2 size={28} />
            </span>
            <p className="experts-page__success-message">
              {success.message ||
                t('experts.successMsg')(success.expertName)}
            </p>
            {typeof success.etaHours === 'number' ? (
              <Badge tone="success" icon={Clock} size="md">
                {t('experts.etaLabel')(success.etaHours)}
              </Badge>
            ) : null}
            <div className="experts-page__form-actions">
              <Button onClick={closeRequest}>{t('experts.close')}</Button>
            </div>
          </div>
        ) : (
          <form className="experts-page__form stack" onSubmit={submitRequest}>
            <Field
              label={t('experts.fieldQuestion')}
              htmlFor="expert-question"
              required
              hint={t('experts.fieldQHint')}
            >
              <Textarea
                id="expert-question"
                data-autofocus
                rows={5}
                value={question}
                onChange={(event) => setQuestion(event.target.value.slice(0, QUESTION_MAX))}
                placeholder={t('experts.fieldQPH')}
                maxLength={QUESTION_MAX}
              />
            </Field>

            <p className="experts-page__counter">
              {t('experts.counter')(question.length, QUESTION_MAX)}
            </p>

            <RadioPills
              name="contact-preference"
              legend={t('experts.contactLegend')}
              options={contactOptions}
              value={preference}
              onChange={setPreference}
            />

            {CONTACT_NEEDS_VALUE.includes(preference) ? (
              <Field
                label={t('experts.contactField')}
                htmlFor="expert-contact"
                required
                hint={t('experts.contactHint')}
              >
                <Input
                  id="expert-contact"
                  value={contactValue}
                  onChange={(event) => setContactValue(event.target.value)}
                  placeholder={t('experts.contactPH')}
                  maxLength={120}
                />
              </Field>
            ) : null}

            <label className="experts-page__check" htmlFor="expert-consent">
              <input
                id="expert-consent"
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              <span>
                {t('experts.consentText')}
              </span>
            </label>

            <div className="experts-page__form-actions">
              <Button variant="ghost" onClick={closeRequest}>
                {t('experts.cancel')}
              </Button>
              <Button type="submit" icon={Send} loading={submitting}>
                {t('experts.sendBtn')}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
