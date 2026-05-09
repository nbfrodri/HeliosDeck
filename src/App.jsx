import { Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import { Sky } from './components/Sky.jsx';
import { NavBar } from './components/NavBar.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AdminRoute } from './components/AdminRoute.jsx';
import { I18nProvider, SUPPORTED_LOCALES, DEFAULT_LOCALE } from './i18n.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Earthquakes from './pages/Earthquakes.jsx';
import MapPage from './pages/MapPage.jsx';
import Admin from './pages/Admin.jsx';

function LocaleLayout() {
  const { locale } = useParams();
  if (!SUPPORTED_LOCALES.includes(locale)) {
    return <Navigate to={`/${DEFAULT_LOCALE}`} replace />;
  }
  return (
    <I18nProvider locale={locale}>
      <Sky />
      <NavBar />
      <Outlet />
    </I18nProvider>
  );
}

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/:locale" element={<LocaleLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="earthquakes"
            element={
              <ProtectedRoute>
                <Earthquakes />
              </ProtectedRoute>
            }
          />
          <Route
            path="map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to={`/${DEFAULT_LOCALE}`} replace />} />
      </Routes>
    </div>
  );
}
