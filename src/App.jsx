import { Routes, Route } from 'react-router-dom';
import { Sky } from './components/Sky.jsx';
import { NavBar } from './components/NavBar.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Earthquakes from './pages/Earthquakes.jsx';
import MapPage from './pages/MapPage.jsx';

export default function App() {
  return (
    <div className="app">
      <Sky />
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/earthquakes"
          element={
            <ProtectedRoute>
              <Earthquakes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
