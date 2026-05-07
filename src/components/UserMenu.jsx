import { IconLogout } from '@tabler/icons-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTranslation } from '../i18n.jsx';

export function UserMenu() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  if (!user) return null;

  const display = user.firstName || user.username;
  const label = t('nav.logout');

  return (
    <div className="user-menu" aria-label="Session">
      {user.image && (
        <img src={user.image} alt="" className="user-menu__avatar" />
      )}
      <span className="user-menu__name" title={user.username}>{display}</span>
      <button
        type="button"
        className="btn btn--icon"
        onClick={logout}
        title={label}
        aria-label={label}
      >
        <IconLogout size={14} stroke={1.8} />
      </button>
    </div>
  );
}
