// ProjectDetail: shows the integration snippets (React + plain HTML) for one
// project, plus the table of submissions that have come in for that project.

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import SnippetBlock from '../components/SnippetBlock.jsx';
import PreviewModal from '../components/PreviewModal.jsx';
import { reactSnippet, scriptSnippet } from '../utils/snippet.js';

function formatDate(s) {
  if (!s) return '';
  const d = new Date(s.replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString();
}

export default function ProjectDetail() {
  const { id } = useParams();
  const projectId = Number(id);
  const [project, setProject] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  async function reloadSubmissions() {
    try {
      const subs = await api.listSubmissions(projectId);
      setSubmissions(subs);
    } catch { /* ignore — the table just keeps its old contents */ }
  }

  async function handleRename() {
    if (!project) return;
    const next = prompt('Rename project to:', project.project_name);
    if (next == null) return;
    const trimmed = next.trim();
    if (!trimmed || trimmed === project.project_name) return;
    setErr('');
    try {
      const updated = await api.renameProject(project.id, trimmed);
      setProject((prev) => (prev ? { ...prev, project_name: updated.project_name } : prev));
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr('');
      try {
        const [projects, subs] = await Promise.all([
          api.listProjects(),
          api.listSubmissions(projectId),
        ]);
        if (cancelled) return;
        const match = projects.find((p) => p.id === projectId);
        setProject(match || null);
        setSubmissions(subs);
      } catch (e) {
        if (!cancelled) setErr(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [projectId]);

  if (loading) return <div className="empty">Loading…</div>;
  if (err) return <div className="error">{err}</div>;
  if (!project) {
    return (
      <div className="card">
        <p>Project not found.</p>
        <Link to="/" className="btn btn-secondary">Back to projects</Link>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 8 }}>
        <Link to="/" className="muted">← All projects</Link>
      </div>
      <div className="row" style={{ alignItems: 'center', gap: 12 }}>
        <h1 style={{ margin: 0 }}>{project.project_name}</h1>
        <button className="btn btn-secondary" onClick={handleRename}>Rename</button>
      </div>
      <p className="muted" style={{ marginTop: 8 }}>
        Public token: <span className="token-chip">{project.project_token}</span>
      </p>

      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0 }}>Integration snippet</h2>
            <p className="muted" style={{ marginTop: 4 }}>
              Paste either snippet into your landing page. Both POST to the same backend.
            </p>
          </div>
          <button className="btn btn-secondary" onClick={() => setPreviewOpen(true)}>
            Test snippet
          </button>
        </div>

        <h3 style={{ fontSize: 14, margin: '14px 0 4px' }}>Option A — React / Next.js (recommended)</h3>
        <div className="muted" style={{ marginBottom: 4 }}>
          Run <code>npm i @easycontact/react</code> in your landing-page project first.
        </div>
        <SnippetBlock code={reactSnippet(project.project_token)} />

        <h3 style={{ fontSize: 14, margin: '14px 0 4px' }}>Option B — Plain HTML / script tag</h3>
        <div className="muted" style={{ marginBottom: 4 }}>
          Drop into any HTML page — no build step required.
        </div>
        <SnippetBlock code={scriptSnippet(project.project_token)} />
      </div>

      {previewOpen && (
        <PreviewModal
          projectToken={project.project_token}
          projectName={project.project_name}
          onClose={() => setPreviewOpen(false)}
          onSubmissionSuccess={reloadSubmissions}
        />
      )}

      <div className="card">
        <h2>Submissions ({submissions.length})</h2>
        {submissions.length === 0 ? (
          <div className="empty">
            No submissions yet. Once a visitor submits the form, you&apos;ll see their message here.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 170 }}>When</th>
                <th style={{ width: 180 }}>Name</th>
                <th style={{ width: 220 }}>Email</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td>{formatDate(s.created_at)}</td>
                  <td>{s.full_name}</td>
                  <td>{s.email}</td>
                  <td className="message">{s.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
