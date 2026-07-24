// Thin fetch wrapper around the PHP backend. Injects the bearer token from
// localStorage and unwraps the { success, data } envelope into a value or a
// thrown Error.
//
// Every id in this file is a public UUID or a public token. The backend does
// not accept its internal primary keys, and nothing here should ever send one.

const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:8000').replace(/\/$/, '');
const TOKEN_KEY = 'ecf_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function query(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const string = search.toString();
  return string ? `?${string}` : '';
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error('Network error. Is the backend running?');
  }

  let json;
  try {
    json = await response.json();
  } catch (e) {
    throw new Error(`Unexpected response (HTTP ${response.status}).`);
  }

  if (!json || json.success !== true) {
    const error = new Error((json && json.error) || `Request failed (HTTP ${response.status}).`);
    // Pages distinguish "gone, or never yours" from a real failure so they can
    // show a not-found state instead of an error banner.
    error.status = response.status;
    throw error;
  }
  return json.data;
}

export const api = {
  // ── Auth ────────────────────────────────────────────────────────────────
  register: (email, password) =>
    request('/auth/register', { method: 'POST', body: { email, password }, auth: false }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request('/auth/me'),

  // ── Projects ────────────────────────────────────────────────────────────
  listProjects: () => request('/projects'),
  getProject: (id) => request(`/projects/get${query({ id })}`),
  createProject: (fields) => request('/projects', { method: 'POST', body: fields }),
  updateProject: (id, fields) => request('/projects/update', { method: 'POST', body: { id, ...fields } }),
  deleteProject: (id) => request('/projects/delete', { method: 'POST', body: { id } }),
  markProjectRead: (id, formId) =>
    request('/projects/mark-read', { method: 'POST', body: { id, form_id: formId } }),
  resolveFavicon: (url, deep = false) =>
    request(`/projects/favicon${query({ url, deep: deep ? 1 : '' })}`),

  // ── Forms ───────────────────────────────────────────────────────────────
  listForms: (projectId) => request(`/forms${query({ project_id: projectId })}`),
  createForm: (projectId, formName, fields) =>
    request('/forms', { method: 'POST', body: { project_id: projectId, form_name: formName, fields } }),
  updateForm: (id, changes) => request('/forms/update', { method: 'POST', body: { id, ...changes } }),
  deleteForm: (id) => request('/forms/delete', { method: 'POST', body: { id } }),

  // ── Submissions ─────────────────────────────────────────────────────────
  listSubmissions: (projectId, { formId, unread } = {}) =>
    request(`/submissions${query({ project_id: projectId, form_id: formId, unread: unread ? 1 : '' })}`),
  getSubmission: (id, { markRead = true } = {}) =>
    request(`/submissions/get${query({ id, mark_read: markRead ? '' : '0' })}`),
  markSubmissionsRead: (ids, isRead = true) =>
    request('/submissions/mark-read', {
      method: 'POST',
      body: { ids: Array.isArray(ids) ? ids : [ids], is_read: isRead },
    }),
};

export { API_BASE };
