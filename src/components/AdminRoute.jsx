import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTranslation, DEFAULT_LOCALE } from '../i18n.jsx';

/**
 * @ai-assisted Claude proposed splitting the three states explicitly
 * (loading / unauthenticated / authenticated-but-not-admin) instead of
 * piggybacking on ProtectedRoute with a flag. Reasoning kept in
 * docs/plans/plan-admin-route.md.
 */
export function AdminRoute({ children }) {
  const { status, user } = useAuth();
  const location = useLocation();
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = locale || DEFAULT_LOCALE;

  if (status === 'loading') {
    return (
      <main className="page page--center">
        <div className="card auth-pending" role="status" aria-live="polite">
          <span className="auth-pending__spinner" aria-hidden />
          <span>{t('auth.checking')}</span>
        </div>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to={`/${lng}/login`} state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <main className="page page--center">
        <div className="card admin-forbidden" role="alert">
          <h1 className="card__title">{t('admin.forbidden.title')}</h1>
          <p className="card__body">
            {t('admin.forbidden.message', { role: user?.role ?? '—' })}
          </p>
          <Link to={`/${lng}/dashboard`} className="btn btn--accent">
            {t('admin.forbidden.back')}
          </Link>
        </div>
      </main>
    );
  }

  return children;
}
