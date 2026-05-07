import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTranslation, DEFAULT_LOCALE } from '../i18n.jsx';

export function ProtectedRoute({ children }) {
  const { status } = useAuth();
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

  return children;
}
