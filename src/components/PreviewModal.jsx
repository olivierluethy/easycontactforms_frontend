// Live preview of one form.
//
// Renders the real <ContactForm> (aliased to the widget source in
// vite.config.js), pointed at the same API the customer's site would use — so
// this is a genuine end-to-end test of the wiring, not a mock-up.
//
// Submissions sent from here are real and land in the list behind the modal.
// The warning says so before anyone presses Send.

import { ContactForm } from '@easycontact/react';
import { API_BASE } from '../api/client.js';
import { useTheme } from '../theme/ThemeProvider.jsx';
import Modal from './Modal.jsx';

export default function PreviewModal({ form, projectName, onClose, onSubmissionSuccess }) {
  const { theme } = useTheme();

  return (
    <Modal title="Test snippet" subtitle={`${projectName} · ${form.form_name}`} onClose={onClose}>
      <div
        className="error-banner"
        style={{
          background: 'var(--unread-soft)',
          borderColor: 'color-mix(in srgb, var(--unread) 34%, transparent)',
          color: 'var(--unread-text)',
        }}
      >
        This preview is live. Anything you send lands in your submissions — which is exactly how you confirm
        the wiring works.
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <ContactForm
          formId={form.form_token}
          apiBase={API_BASE}
          theme={theme}
          onSuccess={() => onSubmissionSuccess?.()}
        />
      </div>
    </Modal>
  );
}
