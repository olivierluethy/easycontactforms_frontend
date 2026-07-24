// A value with a one-click copy control.
//
// Two shapes:
//   <TokenChip>     the whole chip is the button — used for tokens
//   <CopyableValue> a labelled block with a Copy button — used in the drawer
//
// Both are real buttons, so they are reachable by keyboard and announce
// themselves; the "Copied" state is text, not just a colour change.

import { useCopy } from '../hooks/useCopy.js';

export function TokenChip({ value, title = 'Copy' }) {
  const { copy, copied, failed } = useCopy();

  return (
    <button
      type="button"
      className={`token-chip${copied ? ' copied' : ''}`}
      onClick={() => copy(value)}
      title={`${title}: ${value}`}
    >
      <span>{value}</span>
      <span className="copy-hint">{copied ? 'Copied' : failed ? 'Press ⌘C' : 'Copy'}</span>
    </button>
  );
}

export default function CopyableValue({ label, value, mono = false }) {
  const { copy, copied, failed } = useCopy();

  return (
    <div className="value-block">
      <div className="value-head">
        <span className="eyebrow">{label}</span>
        <button
          type="button"
          className={`copy-btn${copied ? ' copied' : ''}`}
          onClick={() => copy(value)}
          aria-label={`Copy ${label}`}
        >
          {copied ? '✓ Copied' : failed ? 'Copy failed' : 'Copy'}
        </button>
      </div>
      <div className={`value-text${mono ? ' is-mono' : ''}`}>{value}</div>
    </div>
  );
}
