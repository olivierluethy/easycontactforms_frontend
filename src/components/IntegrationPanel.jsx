// The embed snippets for one form, collapsed by default.
//
// A snippet is needed once, when a form is first wired up; after that it is
// reference material. Keeping it closed is what lets the submissions start at
// the top of the page instead of below a wall of code.

import { useState } from 'react';
import SnippetBlock from './SnippetBlock.jsx';
import { reactSnippet, scriptSnippet, legacyProjectSnippet } from '../utils/snippet.js';

export default function IntegrationPanel({ form, projectToken }) {
  const [open, setOpen] = useState(false);

  if (!form) return null;

  return (
    <section className="disclosure">
      <button
        type="button"
        className="disclosure-trigger"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="disclosure-caret" aria-hidden="true">
          ▶
        </span>
        Integration snippet
        <span className="spacer" />
        <span className="muted">{open ? 'Hide' : 'Show'}</span>
      </button>

      {open && (
        <div className="disclosure-panel">
          <p className="muted" style={{ marginTop: 0 }}>
            Paste one of these into the page where “{form.form_name}” should appear. Both post to the same
            backend.
          </p>

          <h3 style={{ marginTop: 14 }}>React / Next.js</h3>
          <div className="hint" style={{ marginBottom: 4 }}>
            Run <code>npm i @easycontact/react</code> in your site first.
          </div>
          <SnippetBlock code={reactSnippet(form.form_token)} />

          <h3>Plain HTML</h3>
          <div className="hint" style={{ marginBottom: 4 }}>
            No build step required.
          </div>
          <SnippetBlock code={scriptSnippet(form.form_token)} />

          {form.is_default && (
            <>
              <h3>Project-wide snippet</h3>
              <div className="hint" style={{ marginBottom: 4 }}>
                Posts to whichever form is the project default — currently this one. This is the older snippet
                shape; anything already using it keeps working.
              </div>
              <SnippetBlock code={legacyProjectSnippet(projectToken)} />
            </>
          )}
        </div>
      )}
    </section>
  );
}
