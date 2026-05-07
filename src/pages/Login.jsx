import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const DEMO = { username: 'emilys', password: 'emilyspass' };

export default function Login() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to={from} replace />;
  }

  async function attempt(u, p) {
    setError(null);
    setSubmitting(true);
    try {
      await login(u, p);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message ?? 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page page--center">
      <form
        className="card login-form"
        onSubmit={(e) => {
          e.preventDefault();
          attempt(username.trim(), password);
        }}
        noValidate
      >
        <h1 className="card__title">Log in</h1>
        <p className="card__body">
          Authenticated against{' '}
          <a href="https://dummyjson.com/docs/auth" target="_blank" rel="noreferrer">
            dummyjson
          </a>
          .
        </p>

        <button
          type="button"
          className="btn btn--solid login-form__demo"
          onClick={() => attempt(DEMO.username, DEMO.password)}
          disabled={submitting}
        >
          Continue as demo user (emilys)
        </button>

        <div className="login-form__divider" aria-hidden>
          <span>or sign in</span>
        </div>

        <label className="login-form__field">
          <span className="login-form__label">Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="login-form__input"
          />
        </label>

        <label className="login-form__field">
          <span className="login-form__label">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="login-form__input"
          />
        </label>

        {error && (
          <div className="login-form__error" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn--accent btn--lg login-form__submit"
          disabled={submitting || !username || !password}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
