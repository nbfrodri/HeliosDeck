import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main className="page page--center">
      <div className="home-hero">
        <h1 className="home-hero__title">HeliosDeck</h1>
        <p className="home-hero__lede">
          A geophysical aggregator dashboard. Live earthquakes, weather, and
          sun/moon ephemerides — composable as widgets.
        </p>
        <div className="home-hero__actions">
          <Link to="/dashboard" className="btn btn--accent btn--lg">
            Open dashboard
          </Link>
          <Link to="/login" className="btn btn--ghost-lg">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
