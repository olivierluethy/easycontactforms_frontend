// Search, filter and sort for the projects list.
//
// Pure functions, deliberately kept out of the component: this is the logic
// that decides what the user can actually find, so it is worth testing on its
// own rather than through the DOM.

import { parseTimestamp } from './format.js';

export const QUICK_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'active', label: 'Has submissions' },
  { id: 'empty', label: 'Empty' },
];

export const SORT_OPTIONS = [
  { id: 'activity', label: 'Recent activity' },
  { id: 'name', label: 'Name A–Z' },
  { id: 'submissions', label: 'Most submissions' },
  { id: 'unread', label: 'Most unread' },
];

/**
 * Filter by name or token.
 *
 * Matching the token too means a snippet found in a customer's page source can
 * be pasted straight into the search box to find the project it belongs to.
 */
export function searchProjects(projects, term) {
  const needle = String(term ?? '').trim().toLowerCase();
  if (!needle) return projects;

  return projects.filter((project) => {
    const name = String(project.project_name ?? '').toLowerCase();
    const token = String(project.project_token ?? '').toLowerCase();
    const website = String(project.website_url ?? '').toLowerCase();
    return name.includes(needle) || token.includes(needle) || website.includes(needle);
  });
}

export function applyQuickFilter(projects, filter) {
  switch (filter) {
    case 'unread':
      return projects.filter((p) => (p.unread_count || 0) > 0);
    case 'active':
      return projects.filter((p) => (p.submission_count || 0) > 0);
    case 'empty':
      return projects.filter((p) => (p.submission_count || 0) === 0);
    case 'all':
    default:
      return projects;
  }
}

export function sortProjects(projects, sort) {
  const sorted = [...projects];

  switch (sort) {
    case 'name':
      return sorted.sort((a, b) =>
        String(a.project_name ?? '').localeCompare(String(b.project_name ?? ''), 'de-CH', { sensitivity: 'base' })
      );

    case 'submissions':
      return sorted.sort((a, b) => (b.submission_count || 0) - (a.submission_count || 0));

    case 'unread':
      return sorted.sort((a, b) => (b.unread_count || 0) - (a.unread_count || 0));

    case 'activity':
    default:
      // Most recently active first. Projects that have never received anything
      // sort to the bottom rather than to the top, where a null would otherwise
      // put them.
      return sorted.sort((a, b) => {
        const aTime = parseTimestamp(a.last_submission_at)?.getTime() ?? -Infinity;
        const bTime = parseTimestamp(b.last_submission_at)?.getTime() ?? -Infinity;
        if (aTime !== bTime) return bTime - aTime;
        return String(a.project_name ?? '').localeCompare(String(b.project_name ?? ''), 'de-CH');
      });
  }
}

/** Search, then filter, then sort. */
export function visibleProjects(projects, { search = '', filter = 'all', sort = 'activity' } = {}) {
  return sortProjects(applyQuickFilter(searchProjects(projects, search), filter), sort);
}
