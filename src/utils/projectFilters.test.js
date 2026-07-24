import { searchProjects, applyQuickFilter, sortProjects, visibleProjects } from './projectFilters.js';

const projects = [
  {
    id: 'a',
    project_name: 'Acme Landing',
    project_token: '__REDACTED__',
    website_url: 'https://acme.com',
    submission_count: 12,
    unread_count: 3,
    last_submission_at: '2026-05-02 14:30:00',
  },
  {
    id: 'b',
    project_name: 'Beta Shop',
    project_token: '__REDACTED__',
    website_url: null,
    submission_count: 40,
    unread_count: 0,
    last_submission_at: '2026-05-03 08:00:00',
  },
  {
    id: 'c',
    project_name: 'zeta Portfolio',
    project_token: '__REDACTED__',
    website_url: null,
    submission_count: 0,
    unread_count: 0,
    last_submission_at: null,
  },
  {
    id: 'd',
    project_name: 'Delta Docs',
    project_token: '__REDACTED__',
    website_url: null,
    submission_count: 5,
    unread_count: 9,
    last_submission_at: '2026-05-01 09:15:00',
  },
];

describe('searchProjects', () => {
  it('returns everything for an empty term', () => {
    expect(searchProjects(projects, '')).toHaveLength(4);
    expect(searchProjects(projects, '   ')).toHaveLength(4);
  });

  it('matches on name, case-insensitively', () => {
    expect(searchProjects(projects, 'acme').map((p) => p.id)).toEqual(['a']);
    expect(searchProjects(projects, 'ACME').map((p) => p.id)).toEqual(['a']);
    expect(searchProjects(projects, 'sh').map((p) => p.id)).toEqual(['b']);
    expect(searchProjects(projects, 'd').map((p) => p.id)).toEqual(['a', 'b', 'd']);
  });

  it('matches on token, so a snippet can be pasted in to find its project', () => {
    expect(searchProjects(projects, 'dddd4444').map((p) => p.id)).toEqual(['b']);
  });

  it('matches on website', () => {
    expect(searchProjects(projects, 'acme.com').map((p) => p.id)).toEqual(['a']);
  });

  it('returns nothing when there is no match', () => {
    expect(searchProjects(projects, 'nothing here')).toEqual([]);
  });
});

describe('applyQuickFilter', () => {
  it('passes everything through for "all"', () => {
    expect(applyQuickFilter(projects, 'all')).toHaveLength(4);
  });

  it('keeps only projects with something new', () => {
    expect(applyQuickFilter(projects, 'unread').map((p) => p.id)).toEqual(['a', 'd']);
  });

  it('keeps only projects that have received anything', () => {
    expect(applyQuickFilter(projects, 'active').map((p) => p.id)).toEqual(['a', 'b', 'd']);
  });

  it('keeps only projects that have received nothing', () => {
    expect(applyQuickFilter(projects, 'empty').map((p) => p.id)).toEqual(['c']);
  });
});

describe('sortProjects', () => {
  it('sorts by most recent activity by default', () => {
    expect(sortProjects(projects, 'activity').map((p) => p.id)).toEqual(['b', 'a', 'd', 'c']);
  });

  it('puts never-used projects last, not first', () => {
    // A null timestamp must not read as "brand new".
    expect(sortProjects(projects, 'activity').at(-1).id).toBe('c');
  });

  it('sorts by name ignoring case', () => {
    expect(sortProjects(projects, 'name').map((p) => p.id)).toEqual(['a', 'b', 'd', 'c']);
  });

  it('sorts by submission count', () => {
    expect(sortProjects(projects, 'submissions').map((p) => p.id)).toEqual(['b', 'a', 'd', 'c']);
  });

  it('sorts by unread count', () => {
    expect(sortProjects(projects, 'unread').map((p) => p.id)).toEqual(['d', 'a', 'b', 'c']);
  });

  it('does not mutate the input', () => {
    const order = projects.map((p) => p.id);
    sortProjects(projects, 'name');
    expect(projects.map((p) => p.id)).toEqual(order);
  });
});

describe('visibleProjects', () => {
  it('combines search, filter and sort', () => {
    const result = visibleProjects(projects, { search: 'a', filter: 'unread', sort: 'unread' });
    expect(result.map((p) => p.id)).toEqual(['d', 'a']);
  });

  it('can end up empty, which is a legitimate result', () => {
    expect(visibleProjects(projects, { filter: 'unread', search: 'zeta' })).toEqual([]);
  });

  it('defaults to everything sorted by activity', () => {
    expect(visibleProjects(projects).map((p) => p.id)).toEqual(['b', 'a', 'd', 'c']);
  });
});
