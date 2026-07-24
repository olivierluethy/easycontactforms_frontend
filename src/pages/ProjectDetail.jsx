// One project.
//
// Submissions are the point of this page, so they occupy the wide column and
// start immediately below the header — no scrolling to reach them. The snippet,
// the form definitions and the project metadata sit in a secondary column, and
// the snippet itself is collapsed until asked for.

import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useProjects } from '../context/ProjectsContext.jsx';
import InlineRename from '../components/InlineRename.jsx';
import SubmissionsTable from '../components/SubmissionsTable.jsx';
import SubmissionDrawer from '../components/SubmissionDrawer.jsx';
import IntegrationPanel from '../components/IntegrationPanel.jsx';
import FormsPanel from '../components/FormsPanel.jsx';
import ProjectSettings from '../components/ProjectSettings.jsx';
import PreviewModal from '../components/PreviewModal.jsx';
import { TokenChip } from '../components/CopyableValue.jsx';
import { formatSwiss, pluralize } from '../utils/format.js';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { upsertProject, reload: reloadProjects } = useProjects();

  const [project, setProject] = useState(null);
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [openSubmission, setOpenSubmission] = useState(null);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  const [onlyUnread, setOnlyUnread] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const selectedForm = forms.find((f) => f.id === selectedFormId) || null;

  const loadSubmissions = useCallback(
    async (formId, unread) => {
      try {
        setSubmissions(await api.listSubmissions(projectId, { formId, unread }));
      } catch (e) {
        setError(e.message);
      }
    },
    [projectId]
  );

  const refreshProject = useCallback(async () => {
    const fresh = await api.getProject(projectId);
    setProject(fresh);
    upsertProject(fresh);
    return fresh;
  }, [projectId, upsertProject]);

  const refreshForms = useCallback(
    async (selectId) => {
      const list = await api.listForms(projectId);
      setForms(list);
      setSelectedFormId((current) => {
        const wanted = selectId || current;
        return list.some((f) => f.id === wanted) ? wanted : (list[0]?.id ?? null);
      });
      return list;
    },
    [projectId]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      setNotFound(false);
      try {
        const [projectData, formList] = await Promise.all([
          api.getProject(projectId),
          api.listForms(projectId),
        ]);
        if (cancelled) return;

        setProject(projectData);
        setForms(formList);
        setSelectedFormId(formList[0]?.id ?? null);
        setSubmissions(await api.listSubmissions(projectId, { formId: formList[0]?.id }));
      } catch (e) {
        if (cancelled) return;
        // 404 covers both "deleted" and "never yours" — the API deliberately
        // does not distinguish them, and neither should this page.
        if (e.status === 404) setNotFound(true);
        else setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function handleSelectForm(form) {
    setSelectedFormId(form.id);
    await loadSubmissions(form.id, onlyUnread);
  }

  async function handleToggleUnread() {
    const next = !onlyUnread;
    setOnlyUnread(next);
    await loadSubmissions(selectedFormId, next);
  }

  async function handleOpenSubmission(submission) {
    // Opening is what marks it read, so the list and the badges follow.
    try {
      const full = await api.getSubmission(submission.id);
      setOpenSubmission(full);
      setSubmissions((current) => current.map((s) => (s.id === full.id ? { ...s, ...full } : s)));
      await refreshProject();
      await refreshForms();
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleToggleRead() {
    if (!openSubmission) return;
    const next = !openSubmission.is_read;
    await api.markSubmissionsRead(openSubmission.id, next);

    const updated = { ...openSubmission, is_read: next };
    setOpenSubmission(updated);
    setSubmissions((current) => current.map((s) => (s.id === updated.id ? { ...s, is_read: next } : s)));
    await refreshProject();
    await refreshForms();
  }

  async function handleMarkAllRead() {
    const result = await api.markProjectRead(projectId, selectedFormId);
    setProject(result.project);
    upsertProject(result.project);
    setSubmissions((current) => current.map((s) => ({ ...s, is_read: true })));
    await refreshForms();
    if (onlyUnread) await loadSubmissions(selectedFormId, true);
  }

  async function handleRename(name) {
    const updated = await api.updateProject(projectId, { project_name: name });
    setProject(updated);
    upsertProject(updated);
    setRenaming(false);
  }

  if (loading) {
    return (
      <main className="page">
        <div className="skeleton" style={{ height: 40, maxWidth: 320, marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 320 }} />
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="page">
        <div className="panel">
          <div className="empty">
            <span className="empty-title">Project not found</span>
            <span className="empty-hint">It may have been deleted, or the link may be wrong.</span>
            <Link to="/" className="btn btn-secondary" style={{ marginTop: 8 }}>
              Back to projects
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const unread = project?.unread_count || 0;

  return (
    <main className="page">
      <div style={{ marginBottom: 10 }}>
        <Link to="/" className="muted">
          ← All projects
        </Link>
      </div>

      <div className="detail-head">
        {project.logo_url ? (
          <img
            className="detail-logo"
            src={project.logo_url}
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}

        {renaming ? (
          <InlineRename
            value={project.project_name}
            label="Project name"
            onSave={handleRename}
            onCancel={() => setRenaming(false)}
          />
        ) : (
          <div className="page-title-group" style={{ flex: 1, minWidth: 0 }}>
            <div className="row-tight">
              <h1 style={{ margin: 0 }}>{project.project_name}</h1>
              {unread > 0 && <span className="badge-unread">{unread} new</span>}
            </div>
            <span className="muted">
              {pluralize(project.submission_count || 0, 'submission')} · {pluralize(forms.length, 'form')}
              {project.last_submission_at ? ` · last ${formatSwiss(project.last_submission_at)}` : ''}
            </span>
          </div>
        )}

        {!renaming && (
          <div className="row-tight">
            <button className="btn btn-secondary btn-sm" onClick={() => setPreviewOpen(true)}>
              Test snippet
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setRenaming(true)}>
              Rename
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSettingsOpen(true)}>
              Settings
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="detail-layout">
        <section className="panel">
          <div className="panel-head">
            <h2>
              {selectedForm ? selectedForm.form_name : 'Submissions'}
              <span className="muted" style={{ fontWeight: 400 }}>
                {' '}
                · {pluralize(submissions.length, 'submission')}
              </span>
            </h2>
            <div className="row-tight">
              <button
                type="button"
                className={`btn btn-sm ${onlyUnread ? '' : 'btn-secondary'}`}
                aria-pressed={onlyUnread}
                onClick={handleToggleUnread}
              >
                {onlyUnread ? 'Showing new only' : 'Show new only'}
              </button>
              {unread > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="panel-body flush">
            {submissions.length === 0 ? (
              <div className="empty">
                <span className="empty-title">{onlyUnread ? 'Nothing new' : 'No submissions yet'}</span>
                <span className="empty-hint">
                  {onlyUnread
                    ? 'Everything here has been read.'
                    : 'Paste the integration snippet into your page. The first message a visitor sends shows up here.'}
                </span>
              </div>
            ) : (
              <SubmissionsTable
                submissions={submissions}
                selectedId={openSubmission?.id}
                showFormName={forms.length > 1}
                onOpen={handleOpenSubmission}
              />
            )}
          </div>
        </section>

        <aside className="detail-side">
          <FormsPanel
            projectId={projectId}
            forms={forms}
            selectedForm={selectedForm}
            onSelectForm={handleSelectForm}
            onFormsChanged={async (selectId) => {
              const list = await refreshForms(selectId);
              const active = list.find((f) => f.id === (selectId || selectedFormId)) || list[0];
              await loadSubmissions(active?.id, onlyUnread);
              await refreshProject();
              await reloadProjects();
            }}
          />

          <IntegrationPanel form={selectedForm} projectToken={project.project_token} />

          <section className="card">
            <div className="meta-list">
              <div className="meta-row">
                <span className="eyebrow">Project token</span>
                <div>
                  <TokenChip value={project.project_token} title="Copy project token" />
                </div>
              </div>
              {project.website_url && (
                <div className="meta-row">
                  <span className="eyebrow">Website</span>
                  <a className="meta-value" href={project.website_url} target="_blank" rel="noreferrer">
                    {project.website_url}
                  </a>
                </div>
              )}
              {project.reply_from_email && (
                <div className="meta-row">
                  <span className="eyebrow">Reply-from</span>
                  <span className="meta-value">{project.reply_from_email}</span>
                </div>
              )}
              <div className="meta-row">
                <span className="eyebrow">Created</span>
                <span className="meta-value">{formatSwiss(project.created_at)}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {openSubmission && (
        <SubmissionDrawer
          submission={openSubmission}
          replyFromEmail={project.reply_from_email}
          onClose={() => setOpenSubmission(null)}
          onToggleRead={handleToggleRead}
        />
      )}

      {settingsOpen && (
        <ProjectSettings
          project={project}
          onClose={() => setSettingsOpen(false)}
          onSaved={(updated) => {
            setProject(updated);
            upsertProject(updated);
            setSettingsOpen(false);
          }}
        />
      )}

      {previewOpen && selectedForm && (
        <PreviewModal
          form={selectedForm}
          projectName={project.project_name}
          onClose={() => setPreviewOpen(false)}
          onSubmissionSuccess={async () => {
            await loadSubmissions(selectedFormId, onlyUnread);
            await refreshProject();
            await refreshForms();
          }}
        />
      )}
    </main>
  );
}
