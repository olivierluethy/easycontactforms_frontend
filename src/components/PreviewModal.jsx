// Live preview modal for the contact form. Renders the real <ContactForm>
// component (aliased to ../../widget/src in vite.config.js) so what you see
// here is exactly what visitors to your landing page will see.
//
// Submissions through this modal are real — they post to the same backend and
// appear in the project's submissions table. The warning banner makes that
// clear before users hit Send.

import { useEffect } from 'react';
import { ContactForm } from '@easycontact/react';
import { API_BASE } from '../api/client.js';

export default function PreviewModal({ projectToken, projectName, onClose, onSubmissionSuccess }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ margin: 0 }}>Preview</h2>
            <div className="muted">{projectName}</div>
          </div>
          <button className="btn btn-secondary" onClick={onClose} aria-label="Close preview">
            Close
          </button>
        </div>

        <div className="modal-warn">
          This preview is live. Anything you send here lands in your submissions table — perfect for confirming the wiring works end-to-end.
        </div>

        <div className="modal-body">
          <ContactForm
            projectId={projectToken}
            apiBase={API_BASE}
            onSuccess={() => { if (onSubmissionSuccess) onSubmissionSuccess(); }}
          />
        </div>
      </div>
    </div>
  );
}
