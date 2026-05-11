// Dark code block with an absolute-positioned Copy button. Used on
// ProjectDetail to render the integration snippets the user copies into
// their landing pages.

import { useState } from 'react';

export default function SnippetBlock({ code }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <pre className="snippet">
      <button type="button" className="snippet-copy" onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <code>{code}</code>
    </pre>
  );
}
