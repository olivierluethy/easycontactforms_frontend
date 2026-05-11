// Top navigation. Shows the brand on the left; on the right, either the current
// user's email + a Logout button (when authenticated) or nothing.

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="nav">
      <Link to="/" className="brand">📨 EasyContactForm</Link>
      <div className="nav-right">
        {user && (
          <>
            <span className="muted">{user.email}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </header>
  );
}
