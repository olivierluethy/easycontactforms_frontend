// One project in the grid.
//
// The card is the triage unit: an amber rail down its leading edge whenever
// something is new, and a quieter background when nothing is. Which sites need
// attention is answerable by scanning, without reading a single number.

import { Link } from 'react-router-dom';
import { TokenChip } from './CopyableValue.jsx';
import InlineRename from './InlineRename.jsx';
import { formatSwiss, formatRelative, pluralize } from '../utils/format.js';

function ProjectLogo({ project }) {
  if (project.logo_url) {
    return (
      <img
        className="project-logo"
        src={project.logo_url}
        alt=""
        loading="lazy"
        // A logo URL can rot — a broken-image icon looks like a bug, so drop
        // the element and fall back to the plain layout.
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }
  const initial = String(project.project_name || '?').trim().charAt(0).toUpperCase();
  return (
    <span className="project-logo project-logo-fallback" aria-hidden="true">
      {initial}
    </span>
  );
}

export default function ProjectCard({ project, renaming, onStartRename, onRename, onCancelRename, onDelete }) {
  const unread = project.unread_count || 0;
  const total = project.submission_count || 0;

  return (
    <article
      className={`project-card${unread > 0 ? ' has-unread' : ''}${total === 0 ? ' is-quiet' : ''}`}
    >
      <div className="project-card-top">
        <ProjectLogo project={project} />

        {renaming ? (
          <InlineRename
            value={project.project_name}
            label="Project name"
            onSave={onRename}
            onCancel={onCancelRename}
          />
        ) : (
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="project-card-title">
              <Link to={`/projects/${project.id}`}>{project.project_name}</Link>
              {unread > 0 && <span className="badge-unread">{unread} new</span>}
            </div>
            <div style={{ marginTop: 6 }}>
              <TokenChip value={project.project_token} title="Copy project token" />
            </div>
          </div>
        )}
      </div>

      {!renaming && (
        <>
          <div className="project-stats">
            <div className="stat">
              <span className="stat-value">{total}</span>
              <span className="stat-label">{total === 1 ? 'Submission' : 'Submissions'}</span>
            </div>
            <div className="stat">
              <span className={`stat-value${unread > 0 ? ' is-new' : ''}`}>{unread}</span>
              <span className="stat-label">New</span>
            </div>
            <div className="stat" style={{ marginLeft: 'auto', alignItems: 'flex-end' }}>
              <span className="stat-value" style={{ fontSize: 12.5 }}>
                {project.last_submission_at ? formatSwiss(project.last_submission_at) : '—'}
              </span>
              <span className="stat-label">
                {project.last_submission_at ? formatRelative(project.last_submission_at) : 'No activity yet'}
              </span>
            </div>
          </div>

          <div className="project-card-actions">
            <Link to={`/projects/${project.id}`} className="btn btn-secondary btn-sm">
              Open
            </Link>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onStartRename}>
              Rename
            </button>
            <span className="spacer" />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onDelete}
              aria-label={`Delete ${project.project_name}`}
              style={{ color: 'var(--text-muted)' }}
            >
              Delete
            </button>
          </div>
          <span className="sr-only">
            {pluralize(total, 'submission')}, {unread} unread.
          </span>
        </>
      )}
    </article>
  );
}
