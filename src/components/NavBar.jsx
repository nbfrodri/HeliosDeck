import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Brand } from './Brand.jsx';
import { UserMenu } from './UserMenu.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTranslation, replaceLang, SUPPORTED_LOCALES } from '../i18n.jsx';

const linkClass = ({ isActive }) =>
  `navbar__link${isActive ? ' navbar__link--active' : ''}`;

export function NavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { status, user } = useAuth();
  const { locale, t } = useTranslation();
  const authed = status === 'authenticated';
  const isAdmin = authed && user?.role === 'admin';

  // hide on dashboard — Toolbar handles chrome there
  const seg = pathname.split('/').filter(Boolean);
  const onDashboard = seg[1] === 'dashboard';
  if (onDashboard) return null;

  const home = `/${locale}`;
  const langIdx = SUPPORTED_LOCALES.indexOf(locale);

  return (
    <nav className="navbar" aria-label="Primary">
      <Link to={home} className="navbar__brand-link">
        <Brand />
      </Link>
      <div className="navbar__links">
        <NavLink to={`/${locale}/dashboard`} className={linkClass}>
          {t('nav.dashboard')}
        </NavLink>
        <NavLink to={`/${locale}/earthquakes`} className={linkClass}>
          {t('nav.earthquakes')}
        </NavLink>
        <NavLink to={`/${locale}/map`} className={linkClass}>
          {t('nav.map')}
        </NavLink>
        {isAdmin && (
          <NavLink to={`/${locale}/admin`} className={linkClass}>
            {t('nav.admin')}
          </NavLink>
        )}

        <div
          className="lang-switcher"
          role="tablist"
          aria-label="Language"
          style={{ '--idx': langIdx, '--tab-count': SUPPORTED_LOCALES.length }}
        >
          <span className="lang-switcher__indicator" aria-hidden />
          {SUPPORTED_LOCALES.map((lng) => (
            <button
              key={lng}
              type="button"
              role="tab"
              aria-selected={locale === lng}
              className={`lang-switcher__btn${locale === lng ? ' lang-switcher__btn--active' : ''}`}
              onClick={() => navigate(replaceLang(pathname, lng))}
            >
              {lng.toUpperCase()}
            </button>
          ))}
        </div>

        {authed ? (
          <UserMenu />
        ) : (
          <NavLink to={`/${locale}/login`} className={linkClass}>
            {t('nav.login')}
          </NavLink>
        )}
      </div>
    </nav>
  );
}
