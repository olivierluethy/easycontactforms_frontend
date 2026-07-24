// Projects index.
//
// A full-width card grid with search, quick filters and sort. The layout is
// built around one question — "what came in while I was away" — so unread
// projects are visually distinct and reachable in one click from anywhere.

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useProjects } from '../context/ProjectsContext.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import NewProjectModal from '../components/NewProjectModal.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { QUICK_FILTERS, SORT_OPTIONS, visibleProjects } from '../utils/projectFilters.js';
import { pluralize } from '../utils/format.js';

export default function Projects() {
  const { projects, loading, error, reload, upsertProject, removeProject, unreadTotal } = useProjects();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('activity');
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [actionError, setActionError] = useState('');

  // The unread pill in the top bar links here with ?filter=unread, so the
  // filter lives in the URL and the view is shareable and back-button friendly.
  const filter = searchParams.get('filter') || 'all';
  const setFilter = (next) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'all') params.delete('filter');
    else params.set('filter', next);
    setSearchParams(params, { replace: true });
  };

  const debouncedSearch = useDebouncedValue(search, 180);
  const shown = useMemo(
    () => visibleProjects(projects, { search: debouncedSearch, filter, sort }),
    [projects, debouncedSearch, filter, sort]
  );

  useEffect(() => {
    setActionError('');
  }, [filter]);

  async function handleRename(project, name) {
    const updated = await api.updateProject(project.id, { project_name: name });
    upsertProject(updated);
    setRenamingId(null);
  }

  async function handleDelete(project) {
    await api.deleteProject(project.id);
    removeProject(project.id);
    setPendingDelete(null);
  }

  const totalSubmissions = projects.reduce((sum, p) => sum + (p.submission_count || 0), 0);

  return (
    <main className="page">
      <div className="page-head">
        <div className="page-title-group">
          <h1>Projects</h1>
          <p className="muted" style={{ margin: 0 }}>
            {loading
              ? 'Loading…'
              : projects.length === 0
                ? 'Each project gets a snippet you paste into a landing page.'
                : `${pluralize(projects.length, 'project')} · ${pluralize(totalSubmissions, 'submission')}` +
                  (unreadTotal > 0 ? ` · ${unreadTotal} new` : '')}
          </p>
        </div>
        <button className="btn" onClick={() => setCreating(true)}>
          New project
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {actionError && <div className="error-banner">{actionError}</div>}

      {projects.length > 0 && (
        <div className="toolbar">
          <div className="search">
            <input
              className="input"
              type="search"
              placeholder="Search by name, token or site"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search projects"
            />
          </div>

          <div className="segmented" role="group" aria-label="Filter projects">
            {QUICK_FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={filter === option.id}
                onClick={() => setFilter(option.id)}
              >
                {option.label}
                {option.id === 'unread' && unreadTotal > 0 && (
                  <span style={{ color: 'var(--unread-text)' }}>{unreadTotal}</span>
                )}
              </button>
            ))}
          </div>

          <span className="spacer" />

          <div className="row-tight">
            <label className="eyebrow" htmlFor="project-sort">
              Sort
            </label>
            <select
              id="project-sort"
              className="select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ width: 'auto' }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="project-grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 168 }} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="panel">
          <div className="empty">
            <span className="empty-title">No projects yet</span>
            <span className="empty-hint">
              Create your first project to get a snippet you can paste into a landing page. Submissions land here.
            </span>
            <button className="btn" onClick={() => setCreating(true)} style={{ marginTop: 8 }}>
              New project
            </button>
          </div>
        </div>
      ) : shown.length === 0 ? (
        <div className="panel">
          <div className="empty">
            <span className="empty-title">Nothing matches</span>
            <span className="empty-hint">
              {filter === 'unread'
                ? 'Every project is up to date — nothing new has come in.'
                : 'Try a different search term or filter.'}
            </span>
          </div>
        </div>
      ) : (
        <div className="project-grid">
          {shown.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              renaming={renamingId === project.id}
              onStartRename={() => setRenamingId(project.id)}
              onCancelRename={() => setRenamingId(null)}
              onRename={(name) => handleRename(project, name)}
              onDelete={() => setPendingDelete(project)}
            />
          ))}
        </div>
      )}

      {creating && (
        <NewProjectModal
          onClose={() => setCreating(false)}
          onCreated={(project) => {
            upsertProject(project);
            setCreating(false);
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title={`Delete "${pendingDelete.project_name}"?`}
          message={
            (pendingDelete.submission_count || 0) > 0
              ? `This deletes the project, its forms and all ${pluralize(pendingDelete.submission_count, 'submission')}. Any snippet still live on your site will stop working. This cannot be undone.`
              : 'This deletes the project and its forms. Any snippet still live on your site will stop working. This cannot be undone.'
          }
          confirmLabel="Delete project"
          onConfirm={() => handleDelete(pendingDelete)}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </main>
  );
}
