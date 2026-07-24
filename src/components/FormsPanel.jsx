// Manage the forms in a project: what fields each one asks for, and the
// snippet that embeds it.
//
// The form being viewed is the same one whose submissions are listed, so
// switching form here switches the inbox too.

import { useState } from 'react';
import { api } from '../api/client.js';
import FormBuilder from './FormBuilder.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import Modal from './Modal.jsx';
import { pluralize } from '../utils/format.js';

function NewFormModal({ projectId, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError('');
    try {
      onCreated(await api.createForm(projectId, name.trim()));
    } catch (e2) {
      setError(e2.message);
      setBusy(false);
    }
  }

  return (
    <Modal
      title="New form"
      subtitle="It starts with name, email and message. Change the fields once it exists."
      size="sm"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" form="new-form" className="btn" disabled={busy || !name.trim()}>
            {busy ? 'Creating…' : 'Create form'}
          </button>
        </>
      }
    >
      {error && <div className="error-banner">{error}</div>}
      <form id="new-form" onSubmit={handleSubmit}>
        <div className="field">
          <label className="label" htmlFor="new-form-name">
            Form name
          </label>
          <input
            id="new-form-name"
            className="input"
            placeholder="Newsletter signup"
            maxLength={150}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
}

export default function FormsPanel({ projectId, forms, selectedForm, onSelectForm, onFormsChanged }) {
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [error, setError] = useState('');

  async function handleSave(changes) {
    await api.updateForm(selectedForm.id, changes);
    setEditing(false);
    await onFormsChanged();
  }

  async function handleDelete(form) {
    try {
      await api.deleteForm(form.id);
      setPendingDelete(null);
      await onFormsChanged();
    } catch (e) {
      setPendingDelete(null);
      setError(e.message);
    }
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Forms</h2>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCreating(true)}>
          New form
        </button>
      </div>

      <div className="panel-body">
        {error && <div className="error-banner">{error}</div>}

        {editing && selectedForm ? (
          <FormBuilder form={selectedForm} onSave={handleSave} onCancel={() => setEditing(false)} />
        ) : (
          <div className="stack">
            <div className="form-tabs">
              {forms.map((form) => (
                <button
                  key={form.id}
                  type="button"
                  className="form-tab"
                  aria-pressed={selectedForm?.id === form.id}
                  onClick={() => onSelectForm(form)}
                >
                  {form.form_name}
                  <span className={`count${form.unread_count > 0 ? ' is-new' : ''}`}>
                    {form.unread_count > 0 ? `${form.unread_count} new` : form.submission_count}
                  </span>
                </button>
              ))}
            </div>

            {selectedForm && (
              <>
                <div className="meta-list">
                  <div className="meta-row">
                    <span className="eyebrow">Fields</span>
                    <span className="meta-value">
                      {selectedForm.fields.map((field, i) => (
                        <span key={field.key}>
                          {i > 0 && <span style={{ color: 'var(--text-muted)' }}> → </span>}
                          {field.label}
                          {!field.required && <span className="muted"> (optional)</span>}
                        </span>
                      ))}
                    </span>
                  </div>
                  <div className="meta-row">
                    <span className="eyebrow">Received</span>
                    <span className="meta-value">
                      {pluralize(selectedForm.submission_count || 0, 'submission')}
                    </span>
                  </div>
                </div>

                <div className="row">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                    Edit fields
                  </button>
                  {forms.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setPendingDelete(selectedForm)}
                    >
                      Delete form
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {creating && (
        <NewFormModal
          projectId={projectId}
          onClose={() => setCreating(false)}
          onCreated={async (form) => {
            setCreating(false);
            await onFormsChanged(form.id);
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title={`Delete "${pendingDelete.form_name}"?`}
          message={
            (pendingDelete.submission_count || 0) > 0
              ? `This deletes the form and all ${pluralize(pendingDelete.submission_count, 'submission')} sent through it. Any snippet using its token will stop working. This cannot be undone.`
              : 'This deletes the form. Any snippet using its token will stop working. This cannot be undone.'
          }
          confirmLabel="Delete form"
          onConfirm={() => handleDelete(pendingDelete)}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </section>
  );
}
