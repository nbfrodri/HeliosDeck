import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTranslation, DEFAULT_LOCALE } from '../i18n.jsx';

const DEMO = { username: 'emilys', password: 'emilyspass' };

export default function Login() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = locale || DEFAULT_LOCALE;
  const from = location.state?.from?.pathname ?? `/${lng}/dashboard`;

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
      setError(err.message ?? t('auth.fallbackError'));
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
        <h1 className="card__title">{t('auth.login.title')}</h1>
        <p className="card__body">
          {t('auth.login.intro')}{' '}
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
          {t('auth.login.demo')}
        </button>

        <div className="login-form__divider" aria-hidden>
          <span>{t('auth.login.or')}</span>
        </div>

        <label className="login-form__field">
          <span className="login-form__label">{t('auth.login.username')}</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="login-form__input"
          />
        </label>

        <label className="login-form__field">
          <span className="login-form__label">{t('auth.login.password')}</span>
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
          {submitting ? t('auth.login.submitting') : t('auth.login.submit')}
        </button>
      </form>
    </main>
  );
}
