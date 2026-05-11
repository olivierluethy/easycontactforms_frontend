// Pure functions that generate the integration snippets shown on ProjectDetail.
// Keep API_BASE in sync with backend deployment when publishing the widget.

import { API_BASE } from '../api/client.js';

export function reactSnippet(projectToken) {
  return `import { ContactForm } from "@easycontact/react";

export default function ContactPage() {
  return <ContactForm projectId="${projectToken}" />;
}`;
}

export function scriptSnippet(projectToken) {
  return `<div data-easycontact="${projectToken}"></div>
<script src="${API_BASE}/widget/embed.js" defer></script>`;
}
