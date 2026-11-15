import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronRight,
  Ghost,
  HandHeart,
  ThumbsUp,
  Flag,
  Send,
  MessagesSquare,
  CheckCircle2,
} from 'lucide-react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Avatar,
  Field,
  Textarea,
  Modal,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../components/ui/index.js';
import { categoryLabel } from '../components/domain/PostCard.jsx';
import { useApi } from '../lib/useApi.js';
import { api } from '../lib/api.js';
import { timeAgo, formatDate } from '../lib/format.js';
import { useRequireAuth } from '../lib/useRequireAuth.js';
import { useToast } from '../context/ToastContext.jsx';
import { useLang } from '../context/LangContext.jsx';
import './PostDetail.css';

/** Page de détail d'une publication : contenu complet et réponses. */
export default function PostDetail() {
  const { id } = useParams();
  const toast = useToast();
  const requireAuth = useRequireAuth();
  const { t, lang } = useLang();

  const postApi = useApi(`/community/posts/${id}`, { auth: false });
  const post = postApi.data;

  const [replyBody, setReplyBody] = useState('');
  const [replyAnonymous, setReplyAnonymous] = useState(false);
  const [sending, setSending] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  const reactions = post?.reactions || { support: 0, helpful: 0 };
  const replies = Array.isArray(post?.replies) ? post.replies : [];

  // ------------------------------ Réactions ------------------------------
  function handleReact(type) {
    requireAuth(async () => {
      try {
        await api.post(`/community/posts/${id}/react`, { type });
        toast.success(type === 'support' ? t('community.toastSupport') : t('community.toastVote'));
        postApi.refetch();
      } catch (err) {
        toast.error(err?.message || t('common.errorGeneric'));
      }
    });
  }

  // ------------------------------ Répondre ------------------------------
  async function submitReply(event) {
    event.preventDefault();
    if (sending) return;
    if (replyBody.trim().length < 5) {
      toast.error(t('postDetail.validReplyMin'));
      return;
    }
    setSending(true);
    try {
      const result = await api.post(`/community/posts/${id}/replies`, {
        body: replyBody.trim(),
        anonymous: replyAnonymous,
      });
      toast.success(result?.message || t('postDetail.toastReplyPublished'));
      setReplyBody('');
      setReplyAnonymous(false);
      postApi.refetch();
    } catch (err) {
      toast.error(err?.message || t('common.errorGeneric'));
    } finally {
      setSending(false);
    }
  }

  // ------------------------------ Signaler ------------------------------
  function openReport() {
    requireAuth(() => {
      setReportReason('');
      setReportOpen(true);
    });
  }

  async function submitReport(event) {
    event.preventDefault();
    if (reporting) return;
    if (reportReason.trim().length < 3) {
      toast.error(t('community.validReportMin'));
      return;
    }
    setReporting(true);
    try {
      const result = await api.post(`/community/posts/${id}/report`, {
        reason: reportReason.trim(),
      });
      toast.success(t('community.toastReported')(result?.message));
      setReportOpen(false);
    } catch (err) {
      toast.error(err?.message || t('common.errorGeneric'));
    } finally {
      setReporting(false);
    }
  }

  // ------------------------------ Rendu ------------------------------
  if (postApi.loading) {
    return (
      <div className="post-detail">
        <LoadingState label={t('postDetail.loading')} />
      </div>
    );
  }

  if (postApi.error) {
    return (
      <div className="post-detail">
        <ErrorState error={postApi.error} onRetry={postApi.refetch} />
      </div>
    );
  }

  if (!post) return null;

  const author = post.author || { name: t('postDetail.anonymous'), avatar: '🕵️' };

  return (
    <div className="post-detail">
      <nav className="post-detail__breadcrumb" aria-label={t('common.breadcrumbAria')}>
        <Link to="/app/communaute">{t('nav.community')}</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page" className="clamp-1">
          {post.title}
        </span>
      </nav>

      <article className="post-detail__post">
        <Card padding="lg">
          <div className="post-detail__head">
            {post.anonymous ? (
              <span className="post-detail__ghost" aria-hidden="true">
                <Ghost size={24} />
              </span>
            ) : (
              <Avatar name={author.name} avatar={author.avatar} size="lg" />
            )}
            <div className="post-detail__identity">
              <span className="post-detail__author">
                {post.anonymous ? t('postDetail.anonymous') : author.name}
              </span>
              <span className="meta-row">
                {post.authorPseudonym ? (
                  <span className="meta-item">{post.authorPseudonym}</span>
                ) : null}
                <span className="meta-item">{formatDate(post.createdAt, lang)}</span>
                <span className="meta-item">{timeAgo(post.createdAt, lang)}</span>
              </span>
            </div>
            <Badge tone="primary">{categoryLabel(post.category, t)}</Badge>
          </div>

          <h1 className="post-detail__title">{post.title}</h1>
          <p className="post-detail__body">{post.body || post.excerpt}</p>

          <div className="post-detail__actions">
            <button
              type="button"
              className="post-detail__react"
              onClick={() => handleReact('support')}
            >
              <HandHeart size={18} aria-hidden="true" />
              {t('postDetail.reactSupport')}
              <span className="post-detail__count">{reactions.support || 0}</span>
            </button>
            <button
              type="button"
              className="post-detail__react"
              onClick={() => handleReact('helpful')}
            >
              <ThumbsUp size={18} aria-hidden="true" />
              {t('postDetail.reactHelpful')}
              <span className="post-detail__count">{reactions.helpful || 0}</span>
            </button>
            <Button variant="ghost" size="sm" icon={Flag} onClick={openReport}>
              {t('postDetail.report')}
            </Button>
          </div>
        </Card>
      </article>

      <section className="post-detail__replies" aria-labelledby="replies-title">
        <div className="post-detail__replies-head">
          <h2 id="replies-title" className="post-detail__section-title">
            {replies.length > 0
              ? t('postDetail.repliesCount')(replies.length)
              : t('postDetail.repliesTitle')}
          </h2>
        </div>

        {replies.length === 0 ? (
          <EmptyState
            icon={MessagesSquare}
            title={t('postDetail.noRepliesTitle')}
            description={t('postDetail.noRepliesDesc')}
          />
        ) : (
          <ul className="post-detail__reply-list stack stagger">
            {replies.map((reply) => {
              const replyAuthor = reply.author || { name: t('postDetail.anonymous'), avatar: '🕵️' };
              const replyReactions = reply.reactions || { support: 0, helpful: 0 };
              return (
                <li key={reply.id}>
                  <Card tone={reply.isBestAnswer ? 'accent' : 'default'} padding="md">
                    <div className="post-detail__head">
                      {reply.anonymous ? (
                        <span className="post-detail__ghost post-detail__ghost--sm" aria-hidden="true">
                          <Ghost size={18} />
                        </span>
                      ) : (
                        <Avatar name={replyAuthor.name} avatar={replyAuthor.avatar} size="sm" />
                      )}
                      <div className="post-detail__identity">
                        <span className="post-detail__author post-detail__author--sm">
                          {reply.anonymous ? t('postDetail.anonymous') : replyAuthor.name}
                        </span>
                        <span className="post-detail__meta">{timeAgo(reply.createdAt, lang)}</span>
                      </div>
                      {reply.isBestAnswer ? (
                        <Badge tone="success" icon={CheckCircle2}>
                          {t('postDetail.bestAnswer')}
                        </Badge>
                      ) : null}
                    </div>

                    <p className="post-detail__reply-body">{reply.body}</p>

                    <div className="meta-row post-detail__reply-reactions">
                      <span className="meta-item">
                        <HandHeart size={14} aria-hidden="true" /> {replyReactions.support || 0}
                      </span>
                      <span className="meta-item">
                        <ThumbsUp size={14} aria-hidden="true" /> {replyReactions.helpful || 0}
                      </span>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="post-detail__reply-form">
        <Card tone="soft">
          <CardHeader
            title={t('postDetail.replyFormTitle')}
            subtitle={t('postDetail.replyFormSub')}
          />
          <CardBody>
            <form className="post-detail__form stack" onSubmit={submitReply}>
              <Field label={t('postDetail.replyFieldLabel')} htmlFor="reply-body" required>
                <Textarea
                  id="reply-body"
                  rows={5}
                  value={replyBody}
                  onChange={(event) => setReplyBody(event.target.value)}
                  placeholder={t('postDetail.replyPlaceholder')}
                  maxLength={2000}
                />
              </Field>

              <label className="post-detail__check" htmlFor="reply-anonymous">
                <input
                  id="reply-anonymous"
                  type="checkbox"
                  checked={replyAnonymous}
                  onChange={(event) => setReplyAnonymous(event.target.checked)}
                />
                <span>{t('postDetail.replyAnon')}</span>
              </label>

              <div className="post-detail__form-actions">
                <Button type="submit" icon={Send} loading={sending}>
                  {t('common.send')}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </section>

      {/* ------------------------- Modal : signalement ------------------------- */}
      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={t('community.reportTitle')}
        description={t('community.reportDesc')}
        size="sm"
      >
        <form className="post-detail__form stack" onSubmit={submitReport}>
          <Field
            label={t('community.reportField')}
            htmlFor="post-report-reason"
            required
            hint={t('community.reportHint')}
          >
            <Textarea
              id="post-report-reason"
              data-autofocus
              rows={4}
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              placeholder={t('community.reportPH')}
              maxLength={500}
            />
          </Field>

          <div className="post-detail__form-actions">
            <Button variant="ghost" onClick={() => setReportOpen(false)}>
              {t('community.cancel')}
            </Button>
            <Button type="submit" variant="danger" loading={reporting}>
              {t('community.reportSend')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
