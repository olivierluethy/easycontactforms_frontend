// Shared project list.
//
// The top bar needs the total unread count and the projects page needs the full
// list, so both read from here rather than each fetching independently. It also
// means marking something read on a detail page updates the badge in the top
// bar without a round trip.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const ProjectsCtx = createContext(null);

export function ProjectsProvider({ children }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }
    setError('');
    try {
      setProjects(await api.listProjects());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  /** Merge a fresh copy of one project into the list, in place. */
  const upsertProject = useCallback((project) => {
    setProjects((current) => {
      const index = current.findIndex((p) => p.id === project.id);
      if (index === -1) return [project, ...current];
      const next = [...current];
      next[index] = { ...next[index], ...project };
      return next;
    });
  }, []);

  const removeProject = useCallback((id) => {
    setProjects((current) => current.filter((p) => p.id !== id));
  }, []);

  const unreadTotal = useMemo(
    () => projects.reduce((sum, p) => sum + (p.unread_count || 0), 0),
    [projects]
  );

  const value = useMemo(
    () => ({ projects, loading, error, reload, upsertProject, removeProject, unreadTotal }),
    [projects, loading, error, reload, upsertProject, removeProject, unreadTotal]
  );

  return <ProjectsCtx.Provider value={value}>{children}</ProjectsCtx.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsCtx);
  if (!ctx) throw new Error('useProjects must be used inside <ProjectsProvider>.');
  return ctx;
}
