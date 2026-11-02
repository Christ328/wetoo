import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MessageCircle,
  Send,
  RotateCcw,
  Download,
  ChevronDown,
  ChevronRight,
  Phone,
  BookOpen,
  AlertTriangle,
  ShieldCheck,
  HeartHandshake,
  SlidersHorizontal,
  ArrowRight,
  ExternalLink,
  Info,
  Clock,
} from 'lucide-react';

import { PageHeader } from '../components/layout/PageHeader.jsx';
import {
  Button,
  Card,
  Chip,
  Avatar,
  Modal,
  ErrorState,
  Skeleton,
} from '../components/ui/index.js';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import './Chat.css';

/* ----------------------------- Constantes locales ----------------------------- */
const SESSION_KEY = 'wetoo.chat.session';
const MESSAGES_KEY = 'wetoo.chat.messages';
const BOT_NAME = 'WeToo';

// Sauvegarde de secours proposée dans le bandeau d'urgence si l'API échoue.
const FALLBACK_HELPLINES = [
  { name: 'Ligne verte d’écoute (Bénin)', contact: '137', hours: '24h/24, 7j/7' },
  { name: 'Urgences santé (SAMU)', contact: '112', hours: '24h/24, 7j/7' },
];

// Correspondance entre les chemins renvoyés par le backend et les routes du front.
const ROUTE_MAP = {
  '/learn': '/app/apprendre',
  '/experts': '/app/expertes',
  '/resources': '/app/ressources',
  '/community': '/app/communaute',
  '/chat': '/app/chat',
  '/myths': '/app/mythes',
};

/** Identifiant local simple pour les messages. */
function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Transforme un `to` d'action backend en route front exploitable. */
function resolveRoute(to = '') {
  if (to.startsWith('tel:')) return to;
  if (ROUTE_MAP[to]) return ROUTE_MAP[to];
  if (to.startsWith('/app')) return to;
  if (to.startsWith('/')) return `/app${to}`;
  return to;
}

/** Extrait un numéro appelable depuis un libellé de contact (« 137 (appel gratuit) »). */
function phoneFromContact(contact = '') {
  const match = String(contact).match(/(\+?\d[\d\s().-]{1,})/);
  if (!match) return null;
  const clean = match[1].replace(/[^\d+]/g, '');
  return clean.length >= 3 ? clean : null;
}

/** Récupère le texte du dernier échange pour l'indicateur de contexte. */
export default function Chat() {
  const toast = useToast();

  /* --------------------------- Données distantes --------------------------- */
  const topicsApi = useApi('/chat/topics');
  const suggestionsApi = useApi('/chat/suggestions');
  const helplinesApi = useApi('/resources/helplines');

  const topics = Array.isArray(topicsApi.data) ? topicsApi.data : [];
  const suggestions = Array.isArray(suggestionsApi.data) ? suggestionsApi.data : [];
  const helplines = Array.isArray(helplinesApi.data) ? helplinesApi.data : [];

  /* ------------------------------ État local ------------------------------ */
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [asideOpen, setAsideOpen] = useState(false);

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  /* -------------------- Défilement automatique vers le bas -------------------- */
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, sending]);

  /* --------------------------- Auto-redimensionnement --------------------------- */
  const autoGrow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const max = 108; // ~4 lignes
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    autoGrow();
  }, [input, autoGrow]);

  /* ------------------------------- Envoi ------------------------------- */
  const sendMessage = useCallback(
    async (rawText) => {
      const text = String(rawText ?? '').trim();
      if (!text || sending) return;

      const userMessage = { id: uid(), role: 'user', text, at: new Date().toISOString() };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setNetworkError(false);
      setSending(true);

      try {
        const res = await api.post(
          '/chat/message',
          { message: text, sessionId: sessionId || undefined, lang: 'fr' },
          { auth: true }
        );
        if (res?.sessionId) setSessionId(res.sessionId);
        const reply = res?.reply || {};
        const botMessage = {
          id: uid(),
          role: 'bot',
          text: reply.text || 'Je n’ai pas pu formuler de réponse. Reformule ta question, je reste là.',
          at: new Date().toISOString(),
          reply,
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch {
        // En cas d'échec réseau, la conversation reste lisible.
        setNetworkError(true);
      } finally {
        setSending(false);
      }
    },
    [sending, sessionId]
  );

  /* --------------------------- Nouvelle conversation --------------------------- */
  const resetConversation = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setActiveTopic(null);
    setNetworkError(false);
    setConfirmOpen(false);
    toast.success('Nouvelle conversation démarrée.');
  }, [toast]);

  /* -------------------------------- Export -------------------------------- */
  const exportConversation = useCallback(() => {
    if (messages.length === 0) {
      toast.info('La conversation est vide pour le moment.');
      return;
    }
    const lines = messages.map(
      (m) => `${m.role === 'user' ? 'Moi' : BOT_NAME} : ${m.text}`
    );
    const content = [
      'Conversation WeToo',
      new Date().toLocaleString('fr-FR'),
      '',
      ...lines,
    ].join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wetoo-conversation.txt';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Conversation exportée.');
  }, [messages, toast]);

  /* ----------------------------- Données dérivées ----------------------------- */
  const callableHelplines = useMemo(() => {
    const list = helplines
      .map((h) => ({ ...h, phone: phoneFromContact(h.contact) }))
      .filter((h) => h.phone);
    return list.length > 0 ? list : FALLBACK_HELPLINES.map((h) => ({ ...h, phone: h.contact }));
  }, [helplines]);

  const isEmpty = messages.length === 0;
  const activeTopicObj = topics.find((t) => t.id === activeTopic) || null;

  /* --------------------------------- Rendu --------------------------------- */
  return (
    <div className="chat-page">
      <PageHeader
        eyebrow="Espace confidentiel"
        title="Chat avec WeToo"
        description="Pose tes questions en toute confidentialité. Réponses claires, sans jugement, à toute heure."
        icon={MessageCircle}
        actions={
          <>
            <Button variant="outline" icon={Download} onClick={exportConversation}>
              Exporter
            </Button>
            <Button variant="soft" icon={RotateCcw} onClick={() => setConfirmOpen(true)}>
              Nouvelle conversation
            </Button>
          </>
        }
      />

      <div className="chat-page__layout">
        {/* ------------------------- Colonne de conversation ------------------------- */}
        <section className="chat-page__main" aria-label="Conversation">
          <div className="chat-page__panel">
            <div
              className="chat-page__scroll"
              ref={scrollRef}
              role="log"
              aria-live="polite"
              aria-label="Messages de la conversation"
            >
              {isEmpty ? (
                <WelcomeScreen
                  topics={topics}
                  topicsLoading={topicsApi.loading}
                  topicsError={topicsApi.error}
                  onRetryTopics={topicsApi.refetch}
                  suggestions={suggestions}
                  suggestionsLoading={suggestionsApi.loading}
                  activeTopic={activeTopic}
                  activeTopicObj={activeTopicObj}
                  onToggleTopic={(id) => setActiveTopic((cur) => (cur === id ? null : id))}
                  onSend={sendMessage}
                  disabled={sending}
                />
              ) : (
                <ul className="chat-page__messages">
                  {messages.map((message) => (
                    <li key={message.id} className={`chat-page__message is-${message.role}`}>
                      {message.role === 'bot' ? (
                        <Avatar name={BOT_NAME} size="sm" className="chat-page__bot-avatar" />
                      ) : null}
                      <div className="chat-page__bubble-group">
                        <div className={`chat-page__bubble chat-page__bubble--${message.role}`}>
                          <p className="chat-page__text">{message.text}</p>
                        </div>

                        {message.role === 'bot' && message.reply ? (
                          <BotExtras
                            reply={message.reply}
                            helplines={callableHelplines}
                            onSend={sendMessage}
                            disabled={sending}
                          />
                        ) : null}
                      </div>
                    </li>
                  ))}

                  {sending ? (
                    <li className="chat-page__message is-bot">
                      <Avatar name={BOT_NAME} size="sm" className="chat-page__bot-avatar" />
                      <div className="chat-page__bubble chat-page__bubble--bot chat-page__bubble--typing">
                        <span className="chat-page__typing" aria-hidden="true">
                          <span />
                          <span />
                          <span />
                        </span>
                        <span className="sr-only">WeToo est en train d’écrire…</span>
                      </div>
                    </li>
                  ) : null}
                </ul>
              )}
            </div>

            {/* Zone de saisie, calée en bas du panneau */}
            <form
              className="chat-page__composer"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
            >
              {networkError ? (
                <p className="chat-page__offline" role="status">
                  <AlertTriangle size={15} aria-hidden="true" />
                  Pas de connexion - réessaie.
                </p>
              ) : null}
              <div className="chat-page__composer-row">
                <label className="sr-only" htmlFor="chat-input">
                  Écris ton message
                </label>
                <textarea
                  id="chat-input"
                  ref={textareaRef}
                  className="chat-page__input"
                  placeholder="Écris ta question…"
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                  aria-describedby="chat-input-hint"
                />
                <button
                  type="submit"
                  className="chat-page__send"
                  aria-label="Envoyer"
                  disabled={!input.trim() || sending}
                >
                  <Send size={20} aria-hidden="true" />
                </button>
              </div>
              <p id="chat-input-hint" className="chat-page__hint">
                Entrée pour envoyer • Maj + Entrée pour un retour à la ligne
              </p>
            </form>
          </div>

          <p className="chat-page__disclaimer">
            <Info size={15} aria-hidden="true" />
            Ceci ne remplace pas un avis médical. En cas d’urgence, appelle le 112.
          </p>
        </section>

        {/* Bascule du panneau latéral (visible en mobile uniquement) */}
        <button
          type="button"
          className={`chat-page__aside-toggle ${asideOpen ? 'is-open' : ''}`}
          onClick={() => setAsideOpen((v) => !v)}
          aria-expanded={asideOpen}
          aria-controls="chat-aside"
        >
          <SlidersHorizontal size={17} aria-hidden="true" />
          {asideOpen ? 'Masquer les thèmes' : 'Thèmes & repères'}
        </button>

        {/* ------------------------- Panneau latéral ------------------------- */}
        <aside
          id="chat-aside"
          className={`chat-page__aside ${asideOpen ? 'is-open' : ''}`}
          aria-label="Thèmes et repères"
        >
          <Card tone="soft" padding="md" className="chat-page__aside-card">
            <div className="chat-page__aside-head">
              <span className="chat-page__aside-title">
                <HeartHandshake size={18} aria-hidden="true" />
                Thèmes
              </span>
            </div>
            {topicsApi.loading ? (
              <div className="chat-page__aside-skeletons">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} width="100%" height={38} radius={999} />
                ))}
              </div>
            ) : (
              <ul className="chat-page__aside-topics">
                {topics.map((topic) => {
                  const open = activeTopic === topic.id;
                  return (
                    <li key={topic.id}>
                      <button
                        type="button"
                        className="chat-page__aside-topic"
                        aria-expanded={open}
                        onClick={() => setActiveTopic(open ? null : topic.id)}
                      >
                        <span className="chat-page__aside-emoji" aria-hidden="true">
                          {topic.icon}
                        </span>
                        <span className="chat-page__aside-topic-label">{topic.label}</span>
                        {open ? (
                          <ChevronDown size={16} aria-hidden="true" />
                        ) : (
                          <ChevronRight size={16} aria-hidden="true" />
                        )}
                      </button>
                      {open && Array.isArray(topic.sampleQuestions) ? (
                        <ul className="chat-page__aside-questions">
                          {topic.sampleQuestions.map((q) => (
                            <li key={q}>
                              <button
                                type="button"
                                className="chat-page__aside-question"
                                onClick={() => sendMessage(q)}
                                disabled={sending}
                              >
                                {q}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card tone="default" padding="md" className="chat-page__aside-card">
            <div className="chat-page__reassurance">
              <ShieldCheck size={18} aria-hidden="true" />
              <p>
                <strong>Anonyme • Sans jugement • 24 h/24</strong>
                <span>Tu peux poser toutes tes questions, même les plus personnelles.</span>
              </p>
            </div>
            <div className="chat-page__aside-note">
              <BookOpen size={16} aria-hidden="true" />
              Ceci ne remplace pas un avis médical.
            </div>
            <Button
              to="/app/ressources"
              variant="outline"
              size="sm"
              block
              icon={AlertTriangle}
              className="chat-page__aside-cta"
            >
              Voir les numéros d’aide
            </Button>
          </Card>
        </aside>
      </div>

      {/* Confirmation de nouvelle conversation */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Nouvelle conversation ?"
        description="L’historique affiché sera effacé de cet appareil. Tu repartiras de zéro."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Annuler
            </Button>
            <Button variant="primary" icon={RotateCcw} onClick={resetConversation} data-autofocus>
              Effacer et recommencer
            </Button>
          </>
        }
      >
        <p className="text-muted">
          Tes échanges précédents ne seront plus visibles ici. Cette action est immédiate.
        </p>
      </Modal>
    </div>
  );
}

/* ============================ Écran d'accueil ============================ */
function WelcomeScreen({
  topics,
  topicsLoading,
  topicsError,
  onRetryTopics,
  suggestions,
  suggestionsLoading,
  activeTopic,
  activeTopicObj,
  onToggleTopic,
  onSend,
  disabled,
}) {
  return (
    <div className="chat-page__welcome">
      <div className="chat-page__welcome-head">
        <Avatar name={BOT_NAME} size="md" />
        <div>
          <h2 className="chat-page__welcome-title">Bonjour, je suis WeToo.</h2>
          <p className="chat-page__welcome-text">
            Pose ta question librement : corps, contraception, IST, consentement, santé mentale…
            Je réponds avec des informations fiables et sans jugement.
          </p>
        </div>
      </div>

      {/* Thèmes */}
      <div className="chat-page__block">
        <p className="chat-page__block-title">
          <HeartHandshake size={16} aria-hidden="true" /> Explore un thème
        </p>
        {topicsLoading ? (
          <div className="chat-page__chips">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} width="120px" height={36} radius={999} />
            ))}
          </div>
        ) : topicsError ? (
          <ErrorState error={topicsError} onRetry={onRetryTopics} />
        ) : (
          <div className="chat-page__chips">
            {topics.map((topic) => (
              <Chip
                key={topic.id}
                selected={activeTopic === topic.id}
                onClick={() => onToggleTopic(topic.id)}
              >
                <span aria-hidden="true">{topic.icon}</span> {topic.label}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* Questions du thème sélectionné */}
      {activeTopicObj && Array.isArray(activeTopicObj.sampleQuestions) ? (
        <div className="chat-page__block">
          <p className="chat-page__block-title">
            <MessageCircle size={16} aria-hidden="true" /> Questions sur « {activeTopicObj.label} »
          </p>
          <div className="chat-page__chips">
            {activeTopicObj.sampleQuestions.map((q) => (
              <Chip key={q} tone="primary" onClick={() => onSend(q)} disabled={disabled}>
                {q}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      {/* Questions suggérées */}
      <div className="chat-page__block">
        <p className="chat-page__block-title">
          <MessageCircle size={16} aria-hidden="true" /> Questions fréquentes
        </p>
        {suggestionsLoading ? (
          <div className="chat-page__chips">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} width="180px" height={36} radius={999} />
            ))}
          </div>
        ) : (
          <div className="chat-page__chips">
            {suggestions.map((s) => (
              <Chip key={s} tone="accent" onClick={() => onSend(s)} disabled={disabled}>
                {s}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <p className="chat-page__welcome-foot">
        <Clock size={15} aria-hidden="true" /> Disponible à toute heure, en français.
      </p>
    </div>
  );
}

/* ======================= Compléments sous une réponse bot ======================= */
function BotExtras({ reply, helplines, onSend, disabled }) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const sources = Array.isArray(reply.sources) ? reply.sources : [];
  const followUps = Array.isArray(reply.followUps) ? reply.followUps : [];
  const resources = Array.isArray(reply.resources) ? reply.resources : [];
  const actions = Array.isArray(reply.actions) ? reply.actions : [];

  return (
    <div className="chat-page__extras">
      {/* Bandeau d'urgence prioritaire */}
      {reply.urgent ? (
        <div className="chat-page__urgent" role="alert">
          <div className="chat-page__urgent-head">
            <AlertTriangle size={20} aria-hidden="true" />
            <p>Tu n’es pas seul·e. De l’aide est disponible tout de suite.</p>
          </div>
          {resources.length > 0 ? (
            <ul className="chat-page__urgent-resources">
              {resources.map((r, i) => (
                <li key={`${r.label}-${i}`}>{r.label}</li>
              ))}
            </ul>
          ) : null}
          <div className="chat-page__urgent-calls">
            {helplines.map((h) => (
              <a key={h.phone + h.name} className="chat-page__call" href={`tel:${h.phone}`}>
                <Phone size={18} aria-hidden="true" />
                <span className="chat-page__call-text">
                  <span className="chat-page__call-number">Appeler le {h.phone}</span>
                  <span className="chat-page__call-name">{h.name}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {/* Questions de suivi */}
      {followUps.length > 0 ? (
        <div className="chat-page__followups">
          {followUps.map((f) => (
            <Chip key={f} tone="primary" onClick={() => onSend(f)} disabled={disabled}>
              {f}
            </Chip>
          ))}
        </div>
      ) : null}

      {/* Sources repliables */}
      {sources.length > 0 ? (
        <div className="chat-page__sources">
          <button
            type="button"
            className="chat-page__sources-toggle"
            aria-expanded={sourcesOpen}
            onClick={() => setSourcesOpen((v) => !v)}
          >
            <BookOpen size={15} aria-hidden="true" />
            Sources ({sources.length})
            {sourcesOpen ? (
              <ChevronDown size={15} aria-hidden="true" />
            ) : (
              <ChevronRight size={15} aria-hidden="true" />
            )}
          </button>
          {sourcesOpen ? (
            <ul className="chat-page__sources-list">
              {sources.map((s, i) => (
                <li key={`${s.title}-${i}`}>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.title}
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  ) : (
                    <span>{s.title}</span>
                  )}
                  {s.label ? <span className="chat-page__source-label"> • {s.label}</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {/* Actions proposées par le backend */}
      {actions.length > 0 ? (
        <div className="chat-page__actions">
          {actions.map((action, i) => {
            const route = resolveRoute(action.to || '');
            if (route.startsWith('tel:')) {
              return (
                <Button key={`${action.label}-${i}`} href={route} variant="danger" size="sm" icon={Phone}>
                  {action.label}
                </Button>
              );
            }
            return (
              <Button key={`${action.label}-${i}`} to={route} variant="soft" size="sm" icon={ArrowRight}>
                {action.label}
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
