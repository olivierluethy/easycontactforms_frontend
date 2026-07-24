// Dark code block with a Copy button. Used for the integration snippets.

import { useCopy } from '../hooks/useCopy.js';

export default function SnippetBlock({ code }) {
  const { copy, copied, failed } = useCopy();

  return (
    <pre className="snippet">
      <button
        type="button"
        className={`snippet-copy${copied ? ' copied' : ''}`}
        onClick={() => copy(code)}
        aria-label="Copy snippet"
      >
        {copied ? '✓ Copied' : failed ? 'Press ⌘C' : 'Copy'}
      </button>
      <code>{code}</code>
    </pre>
  );
}
