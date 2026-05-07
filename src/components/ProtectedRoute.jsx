import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <main className="page page--center">
        <div className="card auth-pending" role="status" aria-live="polite">
          <span className="auth-pending__spinner" aria-hidden />
          <span>Checking session…</span>
        </div>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
