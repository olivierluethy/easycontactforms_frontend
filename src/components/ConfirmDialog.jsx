// In-app confirmation for destructive actions.
//
// Replaces window.confirm(): a native dialog cannot be styled, cannot say
// precisely what is about to be lost, and looks like a browser warning rather
// than part of the product.

import { useState } from 'react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <Modal
      title={title}
      size="sm"
      onClose={busy ? () => {} : onCancel}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-danger" onClick={handleConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      {error && <div className="error-banner">{error}</div>}
      <p style={{ margin: 0, color: 'var(--text-dim)' }}>{message}</p>
    </Modal>
  );
}
