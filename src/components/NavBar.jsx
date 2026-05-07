import { Link, NavLink, useLocation } from 'react-router-dom';
import { Brand } from './Brand.jsx';
import { UserMenu } from './UserMenu.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `navbar__link${isActive ? ' navbar__link--active' : ''}`;

export function NavBar() {
  const { pathname } = useLocation();
  const { status } = useAuth();
  const authed = status === 'authenticated';

  if (pathname.startsWith('/dashboard')) return null;

  return (
    <nav className="navbar" aria-label="Primary">
      <Link to="/" className="navbar__brand-link">
        <Brand />
      </Link>
      <div className="navbar__links">
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        {authed ? (
          <UserMenu />
        ) : (
          <NavLink to="/login" className={linkClass}>Log in</NavLink>
        )}
      </div>
    </nav>
  );
}
