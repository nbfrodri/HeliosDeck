import { Link, NavLink, useLocation } from 'react-router-dom';
import { Brand } from './Brand.jsx';

const linkClass = ({ isActive }) =>
  `navbar__link${isActive ? ' navbar__link--active' : ''}`;

export function NavBar() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/dashboard')) return null;

  return (
    <nav className="navbar" aria-label="Primary">
      <Link to="/" className="navbar__brand-link">
        <Brand />
      </Link>
      <div className="navbar__links">
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/login" className={linkClass}>Log in</NavLink>
      </div>
    </nav>
  );
}
