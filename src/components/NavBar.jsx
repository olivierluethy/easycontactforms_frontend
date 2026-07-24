// Top navigation. Brand on the left; on the right, the global unread count,
// the current user, the theme switch and Logout.
//
// The unread pill is the answer to "which of my sites need me right now"
// without opening anything — it is visible on every screen.

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useProjects } from '../context/ProjectsContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

function UnreadPill() {
  const { unreadTotal } = useProjects();
  if (unreadTotal === 0) return null;

  return (
    <Link to="/?filter=unread" className="nav-unread" title="Show only projects with new submissions">
      {unreadTotal} new
    </Link>
  );
}

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="app-nav">
      <Link to="/" className="brand">
        <span className="brand-mark" aria-hidden="true">
          📨
        </span>
        EasyContactForm
      </Link>

      <div className="nav-right">
        {user && (
          <>
            <UnreadPill />
            <span className="nav-email">{user.email}</span>
          </>
        )}
        <ThemeToggle />
        {user && (
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Log out
          </button>
        )}
      </div>
    </header>
  );
}
