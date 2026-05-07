import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n.jsx';

export default function Home() {
  const { locale, t } = useTranslation();
  return (
    <main className="page page--center">
      <div className="home-hero">
        <h1 className="home-hero__title">HeliosDeck</h1>
        <p className="home-hero__lede">{t('home.lede')}</p>
        <div className="home-hero__actions">
          <Link to={`/${locale}/dashboard`} className="btn btn--accent btn--lg">
            {t('home.openDashboard')}
          </Link>
          <Link to={`/${locale}/login`} className="btn btn--ghost-lg">
            {t('home.login')}
          </Link>
        </div>
      </div>
    </main>
  );
}
