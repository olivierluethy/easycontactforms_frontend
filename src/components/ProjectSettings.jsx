// Project settings: branding and the reply-from address.
//
// The reply-from address is used today as the Cc on quick replies. It is also
// the field the planned automated reply service (Phase 3) will send from —
// see the note in the API's form/submit.php for where that hooks in.

import { useState } from 'react';
import { api } from '../api/client.js';
import Modal from './Modal.jsx';
import BrandingFields from './BrandingFields.jsx';

export default function ProjectSettings({ project, onClose, onSaved }) {
  const [values, setValues] = useState({
    website_url: project.website_url || '',
    logo_url: project.logo_url || '',
    reply_from_email: project.reply_from_email || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const update = (patch) => setValues((current) => ({ ...current, ...patch }));

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      onSaved(
        await api.updateProject(project.id, {
          website_url: values.website_url.trim(),
          logo_url: values.logo_url,
          reply_from_email: values.reply_from_email.trim(),
        })
      );
    } catch (e2) {
      setError(e2.message);
      setBusy(false);
    }
  }

  return (
    <Modal
      title="Project settings"
      subtitle={project.project_name}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" form="project-settings" className="btn" disabled={busy}>
            {busy ? 'Saving…' : 'Save settings'}
          </button>
        </>
      }
    >
      {error && <div className="error-banner">{error}</div>}

      <form id="project-settings" className="stack" onSubmit={handleSubmit}>
        <BrandingFields
          idPrefix="settings"
          websiteUrl={values.website_url}
          logoUrl={values.logo_url}
          onChange={update}
        />

        <div className="field">
          <label className="label" htmlFor="settings-reply-from">
            Reply-from address
          </label>
          <input
            id="settings-reply-from"
            className="input"
            type="email"
            placeholder="hello@acme.com"
            value={values.reply_from_email}
            onChange={(e) => update({ reply_from_email: e.target.value })}
          />
          <span className="hint">
            Copied in on replies you send from a submission, so they land in your shared mailbox too.
          </span>
        </div>
      </form>
    </Modal>
  );
}
