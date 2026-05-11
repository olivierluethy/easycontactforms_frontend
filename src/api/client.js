// Thin fetch wrapper around the PHP backend. Injects the bearer token from
// localStorage and unwraps the { success, data } envelope into a value or thrown Error.

const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost/easycontact/backend').replace(/\/$/, '');
const TOKEN_KEY = 'ecf_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
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
    throw new Error((json && json.error) || `Request failed (HTTP ${response.status}).`);
  }
  return json.data;
}

export const api = {
  register: (email, password) =>
    request('/auth/register', { method: 'POST', body: { email, password }, auth: false }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request('/auth/me'),
  listProjects: () => request('/projects'),
  createProject: (projectName) =>
    request('/projects', { method: 'POST', body: { project_name: projectName } }),
  deleteProject: (id) => request('/projects/delete', { method: 'POST', body: { id } }),
  listSubmissions: (projectId) => request(`/submissions?project_id=${encodeURIComponent(projectId)}`),
};

export { API_BASE };
