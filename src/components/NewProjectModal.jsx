// Create a project.
//
// Name is the only thing required. The website is offered here rather than
// buried in settings because typing it now is what produces the logo that makes
// the projects grid scannable later.

import { useState } from 'react';
import { api } from '../api/client.js';
import Modal from './Modal.jsx';
import BrandingFields from './BrandingFields.jsx';

export default function NewProjectModal({ onClose, onCreated }) {
  const [values, setValues] = useState({ project_name: '', website_url: '', logo_url: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const update = (patch) => setValues((current) => ({ ...current, ...patch }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!values.project_name.trim()) return;

    setBusy(true);
    setError('');
    try {
      onCreated(
        await api.createProject({
          project_name: values.project_name.trim(),
          website_url: values.website_url.trim(),
          logo_url: values.logo_url,
        })
      );
    } catch (e2) {
      setError(e2.message);
      setBusy(false);
    }
  }

  return (
    <Modal
      title="New project"
      subtitle="One project per site. You can add more forms to it later."
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="submit"
            form="new-project-form"
            className="btn"
            disabled={busy || !values.project_name.trim()}
          >
            {busy ? 'Creating…' : 'Create project'}
          </button>
        </>
      }
    >
      {error && <div className="error-banner">{error}</div>}

      <form id="new-project-form" className="stack" onSubmit={handleSubmit}>
        <div className="field">
          <label className="label" htmlFor="new-project-name">
            Project name
          </label>
          <input
            id="new-project-name"
            className="input"
            placeholder="Acme Landing Page"
            maxLength={150}
            value={values.project_name}
            onChange={(e) => update({ project_name: e.target.value })}
            required
          />
        </div>

        <BrandingFields
          idPrefix="new-project"
          websiteUrl={values.website_url}
          logoUrl={values.logo_url}
          onChange={update}
        />
      </form>
    </Modal>
  );
}
