// Guards a route: redirects to /login when no user is loaded, and shows a
// neutral loading state while the AuthContext is still validating the token.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="page">
        <div className="empty">Loading…</div>
      </main>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
