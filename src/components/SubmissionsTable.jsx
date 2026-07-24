// The submissions list.
//
// Each row is a button: clicking anywhere on it opens the full submission.
// Unread rows carry the same amber rail as an unread project card.
//
// The message preview is clamped to two lines in CSS. That is the fix for the
// bug where one pasted essay stretched its row far enough to bury everything
// below it — the row height is now bounded no matter what arrives.

import { formatSwiss, formatRelative } from '../utils/format.js';

/** The value to show as the "who": the first email, or failing that any text. */
function summarize(submission) {
  const values = submission.values || [];
  const email = values.find((v) => v.type === 'email');
  const name = values.find((v) => v.type === 'text' && v.value);
  const body = values.find((v) => v.type === 'textarea' && v.value);

  const preview = body?.value || values.filter((v) => v !== email && v !== name).map((v) => v.value).join(' · ');

  return {
    name: name?.value || email?.value || '(no name)',
    email: email && email.value !== name?.value ? email.value : '',
    preview: preview || '',
  };
}

export default function SubmissionsTable({ submissions, selectedId, showFormName, onOpen }) {
  return (
    <div className="submission-list">
      {submissions.map((submission) => {
        const { name, email, preview } = summarize(submission);

        return (
          <button
            key={submission.id}
            type="button"
            className={`submission-row${submission.is_read ? '' : ' is-unread'}`}
            aria-current={selectedId === submission.id ? 'true' : undefined}
            onClick={() => onOpen(submission)}
          >
            <span className="submission-who">
              <span className="who-name">{name}</span>
              {email && <span className="who-email">{email}</span>}
              {showFormName && <span className="submission-form-tag">{submission.form_name}</span>}
            </span>

            <span className="submission-when">
              <span className="when-absolute">{formatSwiss(submission.created_at)}</span>
              <span className="when-relative">{formatRelative(submission.created_at)}</span>
            </span>

            {preview && <span className="submission-preview">{preview}</span>}

            {!submission.is_read && <span className="sr-only">Unread</span>}
          </button>
        );
      })}
    </div>
  );
}
