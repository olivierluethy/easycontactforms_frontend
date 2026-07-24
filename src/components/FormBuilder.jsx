// Edit a form's fields: add, remove, reorder, relabel, and choose what is
// required.
//
// Reordering uses explicit up/down buttons rather than drag and drop. Dragging
// is nicer with a mouse and unusable without one, and a form has a handful of
// fields — the buttons are quicker anyway.
//
// The field key is shown but not editable once a field exists: it is the key
// past submissions were recorded under, and changing it would orphan them.

import { useEffect, useState } from 'react';

const FIELD_TYPES = [
  { id: 'text', label: 'Short text' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'textarea', label: 'Long text' },
];

/** Derive a machine key from a label: "Your Company" -> "your_company". */
export function keyFromLabel(label, taken = []) {
  let base = String(label)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 64);

  if (!base || !/^[a-z]/.test(base)) base = `field_${base}`.slice(0, 64);

  if (!taken.includes(base)) return base;

  let n = 2;
  while (taken.includes(`${base}_${n}`)) n += 1;
  return `${base}_${n}`;
}

export default function FormBuilder({ form, onSave, onCancel }) {
  const [fields, setFields] = useState(form.fields);
  const [name, setName] = useState(form.form_name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFields(form.fields);
    setName(form.form_name);
  }, [form]);

  function updateField(index, patch) {
    setFields((current) => current.map((field, i) => (i === index ? { ...field, ...patch } : field)));
  }

  function move(index, direction) {
    setFields((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addField() {
    setFields((current) => [
      ...current,
      {
        key: keyFromLabel('New field', current.map((f) => f.key)),
        label: 'New field',
        type: 'text',
        required: false,
        isNew: true,
      },
    ]);
  }

  function removeField(index) {
    setFields((current) => current.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (fields.length === 0) {
      setError('A form needs at least one field.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSave({
        form_name: name.trim(),
        fields: fields.map((f) => ({
          key: f.key,
          label: f.label.trim(),
          type: f.type,
          required: Boolean(f.required),
        })),
      });
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  const removedKeys = form.fields.filter((original) => !fields.some((f) => f.key === original.key));

  return (
    <div className="stack">
      {error && <div className="error-banner">{error}</div>}

      <div className="field">
        <label className="label" htmlFor="form-name">
          Form name
        </label>
        <input
          id="form-name"
          className="input"
          value={name}
          maxLength={150}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="field-editor">
        <span className="label">Fields</span>

        {fields.map((field, index) => (
          <div className="field-row" key={field.key}>
            <div className="field-move">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${field.label} up`}
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === fields.length - 1}
                aria-label={`Move ${field.label} down`}
              >
                ▼
              </button>
            </div>

            <div className="stack" style={{ gap: 2, minWidth: 0 }}>
              <input
                className="input"
                value={field.label}
                maxLength={150}
                aria-label={`Label for field ${index + 1}`}
                onChange={(e) => {
                  const label = e.target.value;
                  // The key is only ever derived while the field is brand new;
                  // once saved it is frozen so past submissions stay matched.
                  updateField(index, {
                    label,
                    ...(field.isNew
                      ? { key: keyFromLabel(label, fields.filter((_, i) => i !== index).map((f) => f.key)) }
                      : {}),
                  });
                }}
              />
              <span className="field-key">{field.key}</span>
            </div>

            <select
              className="select"
              value={field.type}
              aria-label={`Type of ${field.label}`}
              onChange={(e) => updateField(index, { type: e.target.value })}
            >
              {FIELD_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>

            <label className="switch">
              <input
                type="checkbox"
                checked={Boolean(field.required)}
                onChange={(e) => updateField(index, { required: e.target.checked })}
              />
              Required
            </label>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => removeField(index)}
              aria-label={`Remove ${field.label}`}
            >
              ✕
            </button>
          </div>
        ))}

        <button type="button" className="btn btn-secondary btn-sm" onClick={addField} style={{ alignSelf: 'flex-start' }}>
          Add field
        </button>
      </div>

      {removedKeys.length > 0 && (
        <p className="hint">
          Removing {removedKeys.map((f) => f.label).join(', ')} stops the widget asking for
          {removedKeys.length === 1 ? ' it' : ' them'}. Submissions already received keep the values they came
          with.
        </p>
      )}

      <div className="row">
        <button type="button" className="btn" onClick={handleSave} disabled={busy}>
          {busy ? 'Saving…' : 'Save form'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </div>
  );
}
