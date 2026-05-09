import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useUsers } from '../hooks/useUsers.js';
import { useTranslation } from '../i18n.jsx';

export default function Admin() {
  const { accessToken } = useAuth();
  const { t } = useTranslation();
  const { data, isLoading, isError, isFetching, error } = useUsers({ accessToken });

  const users = data?.users ?? [];
  const total = data?.total ?? users.length;

  const counts = useMemo(() => {
    const c = { admin: 0, moderator: 0, user: 0, other: 0 };
    for (const u of users) {
      if (u.role === 'admin') c.admin += 1;
      else if (u.role === 'moderator') c.moderator += 1;
      else if (u.role === 'user') c.user += 1;
      else c.other += 1;
    }
    return c;
  }, [users]);

  return (
    <main className="page page--admin">
      <header className="admin-header">
        <h1 className="admin-header__title">{t('admin.title')}</h1>
        <p className="admin-header__sub">
          {t('admin.subtitle', { shown: users.length, total })}
        </p>
      </header>

      {isLoading && (
        <div className="card auth-pending">
          <span className="auth-pending__spinner" aria-hidden />
          <span>{t('admin.loading')}</span>
        </div>
      )}

      {isError && (
        <div className="card login-form__error">
          {t('admin.loadFailed', {
            error: error?.message ?? t('admin.unknownError'),
          })}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="admin-grid">
          <section className="card admin-section admin-section--stats">
            <h2 className="admin-section__title">{t('admin.byRole')}</h2>
            <div className="admin-stats">
              <div className="admin-stat">
                <div className="admin-stat__label">{t('admin.role.admin')}</div>
                <div className="admin-stat__value">{counts.admin}</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat__label">{t('admin.role.moderator')}</div>
                <div className="admin-stat__value">{counts.moderator}</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat__label">{t('admin.role.user')}</div>
                <div className="admin-stat__value">{counts.user}</div>
              </div>
            </div>
          </section>

          <section className="card admin-section admin-section--list">
            <h2 className="admin-section__title">
              <span>{t('admin.users')}</span>
              {isFetching && (
                <span className="admin-section__refresh">{t('admin.refreshing')}</span>
              )}
            </h2>
            <div className="admin-table" role="table">
              <div className="admin-table__head" role="row">
                <div role="columnheader">{t('admin.col.user')}</div>
                <div role="columnheader">{t('admin.col.email')}</div>
                <div role="columnheader">{t('admin.col.role')}</div>
              </div>
              {users.map((u) => (
                <div className="admin-table__row" role="row" key={u.id}>
                  <div className="admin-user" role="cell">
                    {u.image && <img src={u.image} alt="" className="admin-user__avatar" />}
                    <div className="admin-user__name">
                      <strong>{u.firstName} {u.lastName}</strong>
                      <span className="admin-user__handle">@{u.username}</span>
                    </div>
                  </div>
                  <div className="admin-user__email" role="cell">{u.email}</div>
                  <div role="cell">
                    <span className={`role-badge role-badge--${u.role ?? 'unknown'}`}>
                      {t(`admin.role.${u.role}`) || u.role}
                    </span>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <p className="admin-section__empty">{t('admin.empty')}</p>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
