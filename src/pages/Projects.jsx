// Projects index. Create form on top, list of existing projects below
// with name, public project_token chip, submission count, and Open/Delete buttons.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [creating, setCreating] = useState(false);

  async function load() {
    setErr('');
    setLoading(true);
    try {
      const rows = await api.listProjects();
      setProjects(rows);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setErr('');
    setCreating(true);
    try {
      await api.createProject(name.trim());
      setName('');
      await load();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(p) {
    if (!confirm(`Delete "${p.project_name}"? All submissions will be lost.`)) return;
    try {
      await api.deleteProject(p.id);
      await load();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <>
      <h1>Projects</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Each project gets a unique snippet you can paste into a landing page.
      </p>

      {err && <div className="error">{err}</div>}

      <div className="card">
        <form onSubmit={handleCreate} className="row">
          <input
            className="input"
            placeholder="Project name (e.g. Acme Landing Page)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={150}
            style={{ flex: 1, minWidth: 240 }}
          />
          <button className="btn" type="submit" disabled={creating || !name.trim()}>
            {creating ? 'Creating…' : 'Create project'}
          </button>
        </form>
      </div>

      <div className="card">
        {loading ? (
          <div className="empty">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="empty">No projects yet — create your first one above.</div>
        ) : (
          projects.map((p) => (
            <div className="project-row" key={p.id}>
              <div className="meta">
                <div className="name">{p.project_name}</div>
                <div>
                  <span className="token-chip">{p.project_token}</span>{' '}
                  <span className="muted">· {p.submission_count} submission{p.submission_count === 1 ? '' : 's'}</span>
                </div>
              </div>
              <div className="row">
                <Link to={`/projects/${p.id}`} className="btn btn-secondary">Open</Link>
                <button className="btn btn-danger" onClick={() => handleDelete(p)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
