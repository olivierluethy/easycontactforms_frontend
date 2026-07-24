// Integration snippets shown on the project detail page.
//
// Snippets are generated per form, not per project: a project can hold several
// forms and each needs its own embed. The token in a snippet is the form token,
// which is meant to be public — it identifies where a submission goes and
// grants nothing else.

import { API_BASE } from '../api/client.js';

/** The `@easycontact/react` component for one form. */
export function reactSnippet(formToken) {
  return `import { ContactForm } from "@easycontact/react";

export default function ContactPage() {
  return <ContactForm formId="${formToken}" />;
}`;
}

/** The plain `<script>` embed for one form. */
export function scriptSnippet(formToken) {
  return `<div data-easycontact-form="${formToken}"></div>
<script src="${API_BASE}/widget/embed.js" defer></script>`;
}

/**
 * The project-level snippet: no form token, so it posts to whichever form is
 * the project's default.
 *
 * This is the shape every snippet had before forms existed, and it is what is
 * already pasted into live sites. It is shown so those pages can be recognized,
 * not because it is the one to copy for new work.
 */
export function legacyProjectSnippet(projectToken) {
  return `<div data-easycontact="${projectToken}"></div>
<script src="${API_BASE}/widget/embed.js" defer></script>`;
}
