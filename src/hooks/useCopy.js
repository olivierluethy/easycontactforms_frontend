// Copy-to-clipboard with a short-lived "Copied" acknowledgement.
//
// The confirmation matters: without it there is no way to tell a successful
// copy from a click that did nothing.

import { useCallback, useEffect, useRef, useState } from 'react';

export function useCopy(resetAfter = 1400) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text) => {
      const value = String(text ?? '');
      clearTimeout(timer.current);

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          // The Clipboard API needs a secure context. A dashboard served over
          // plain http on a local network is a real case, so fall back rather
          // than silently doing nothing.
          const scratch = document.createElement('textarea');
          scratch.value = value;
          scratch.setAttribute('readonly', '');
          scratch.style.position = 'fixed';
          scratch.style.opacity = '0';
          document.body.appendChild(scratch);
          scratch.select();
          document.execCommand('copy');
          document.body.removeChild(scratch);
        }
        setFailed(false);
        setCopied(true);
      } catch {
        setCopied(false);
        setFailed(true);
      }

      timer.current = setTimeout(() => {
        setCopied(false);
        setFailed(false);
      }, resetAfter);
    },
    [resetAfter]
  );

  return { copy, copied, failed };
}
