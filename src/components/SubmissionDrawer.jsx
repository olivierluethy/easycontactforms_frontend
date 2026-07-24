// One submission, in full.
//
// This is where a long message is actually read — the list only ever shows a
// clamped preview. Every value has its own copy button, and if the submission
// carries an email address the Reply button opens the mail client with the
// recipient and subject already filled in.

import { useEffect } from 'react';
import CopyableValue from './CopyableValue.jsx';
import { formatSwiss, formatRelative } from '../utils/format.js';

/**
 * Build the mailto: URL for a quick reply.
 *
 * The project's reply-from address, when set, is added as a Cc so the reply is
 * also filed against the shared mailbox rather than only the sender's own.
 */
function replyHref(submission, replyFromEmail) {
  if (!submission.reply_to) return null;

  const params = new URLSearchParams();
  params.set('subject', 'Re: your message');
  if (replyFromEmail) params.set('cc', replyFromEmail);

  return `mailto:${encodeURIComponent(submission.reply_to)}?${params.toString()}`;
}

export default function SubmissionDrawer({ submission, replyFromEmail, onClose, onToggleRead }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const mailto = replyHref(submission, replyFromEmail);

  return (
    <>
      <div className="overlay" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Submission">
        <div className="drawer-head">
          <div>
            <span className="eyebrow">{submission.form_name}</span>
            <h2 style={{ marginTop: 2 }}>{formatSwiss(submission.created_at)}</h2>
            <span className="muted">{formatRelative(submission.created_at)}</span>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="drawer-body">
          {(submission.values || []).length === 0 ? (
            <div className="empty">
              <span className="empty-title">This submission is empty</span>
              <span className="empty-hint">Every field was optional and none were filled in.</span>
            </div>
          ) : (
            (submission.values || []).map((value) => (
              <CopyableValue
                key={value.key}
                label={value.label}
                value={value.value}
                mono={value.type === 'email' || value.type === 'phone'}
              />
            ))
          )}
        </div>

        <div className="drawer-foot">
          {mailto ? (
            <a className="btn" href={mailto}>
              Reply
            </a>
          ) : (
            <span className="muted">No email address to reply to.</span>
          )}
          <span className="spacer" />
          <button type="button" className="btn btn-secondary btn-sm" onClick={onToggleRead}>
            {submission.is_read ? 'Mark as unread' : 'Mark as read'}
          </button>
        </div>
      </aside>
    </>
  );
}
