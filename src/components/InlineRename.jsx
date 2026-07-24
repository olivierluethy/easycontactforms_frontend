// Rename in place: the title becomes an input, Enter saves, Esc cancels.
//
// Replaces window.prompt(). A native prompt drops you out of the product, loses
// the styling, and gives no way to show a validation error next to the field.

import { useEffect, useRef, useState } from 'react';

export default function InlineRename({ value, onSave, onCancel, maxLength = 150, label = 'Name' }) {
  const [draft, setDraft] = useState(value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  async function save() {
    const trimmed = draft.trim();
    if (!trimmed) {
      setError('Name is required.');
      return;
    }
    if (trimmed === value) {
      onCancel();
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSave(trimmed);
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      save();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  }

  return (
    <div className="stack" style={{ gap: 6, flex: 1, minWidth: 220 }}>
      <div className="row-tight">
        <input
          ref={inputRef}
          className="input"
          value={draft}
          maxLength={maxLength}
          aria-label={label}
          disabled={busy}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1 }}
        />
        <button type="button" className="btn btn-sm" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
      {error ? (
        <span className="hint" style={{ color: 'var(--danger)' }}>
          {error}
        </span>
      ) : (
        <span className="hint">Enter to save, Esc to cancel</span>
      )}
    </div>
  );
}
