import { useRef, useState } from 'react';
import {
  IconPlus,
  IconMapPin,
  IconCurrentLocation,
  IconPencil,
  IconCheck,
  IconPalette,
  IconTrash
} from '@tabler/icons-react';
import { Link, NavLink } from 'react-router-dom';
import { useDeckStore } from '../store/useDeckStore.js';
import { useSettingsStore } from '../store/useSettingsStore.js';
import { Brand } from './Brand.jsx';
import { LocationSearch } from './LocationSearch.jsx';
import { SkySettings } from './SkySettings.jsx';
import { ConfirmDialog } from './ConfirmDialog.jsx';
import { UserMenu } from './UserMenu.jsx';

export function Toolbar() {
  const editMode = useDeckStore((s) => s.editMode);
  const toggleEditMode = useDeckStore((s) => s.toggleEditMode);
  const togglePicker = useDeckStore((s) => s.togglePicker);
  const resetDeck = useDeckStore((s) => s.reset);
  const location = useSettingsStore((s) => s.location);
  const requestGeolocation = useSettingsStore((s) => s.requestGeolocation);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchAnchor, setSearchAnchor] = useState(null);
  const [skyOpen, setSkyOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [gpsBusy, setGpsBusy] = useState(false);
  const locationBtnRef = useRef(null);

  const openSearch = () => {
    if (locationBtnRef.current) {
      setSearchAnchor(locationBtnRef.current.getBoundingClientRect());
    }
    setSearchOpen(true);
  };

  const onGps = async () => {
    setGpsBusy(true);
    try {
      await requestGeolocation();
    } catch {
      window.alert('No se pudo obtener la ubicación.');
    } finally {
      setGpsBusy(false);
    }
  };

  return (
    <>
      <header className="toolbar">
        <Link to="/" className="toolbar__brand-link" aria-label="Home">
          <Brand />
        </Link>
        <NavLink to="/earthquakes" className="toolbar__nav-link">
          Earthquakes
        </NavLink>
        <NavLink to="/map" className="toolbar__nav-link">
          Map
        </NavLink>
        <div className="toolbar__divider" />
        <button
          ref={locationBtnRef}
          className="btn btn--location"
          onClick={openSearch}
          title="Cambiar ubicación"
        >
          <IconMapPin size={14} stroke={1.8} />
          <span>{location?.label ?? 'Sin ubicación'}</span>
        </button>
        <button className="btn btn--icon" onClick={onGps} disabled={gpsBusy} title="Usar mi GPS">
          <IconCurrentLocation size={14} stroke={1.8} />
        </button>
        <div className="toolbar__divider" />
        <button className="btn btn--icon" onClick={() => setSkyOpen(true)} title="Personalizar cielo">
          <IconPalette size={14} stroke={1.8} />
        </button>
        <div className="toolbar__spacer" />
        <button className="btn" onClick={togglePicker}>
          <IconPlus size={14} stroke={1.9} />
          <span>Añadir widget</span>
        </button>
        <button
          className={`btn ${editMode ? 'btn--solid' : ''}`}
          onClick={toggleEditMode}
        >
          {editMode ? <IconCheck size={14} stroke={2.2} /> : <IconPencil size={14} stroke={1.8} />}
          <span>{editMode ? 'Hecho' : 'Editar'}</span>
        </button>
        {editMode && (
          <button
            className="btn btn--danger"
            onClick={() => setConfirmOpen(true)}
            title="Eliminar todos los widgets"
          >
            <IconTrash size={14} stroke={1.8} />
            <span>Reset</span>
          </button>
        )}
        <div className="toolbar__divider" />
        <UserMenu />
      </header>

      <LocationSearch
        open={searchOpen}
        anchorRect={searchAnchor}
        onClose={() => setSearchOpen(false)}
      />
      <SkySettings open={skyOpen} onClose={() => setSkyOpen(false)} />
      <ConfirmDialog
        open={confirmOpen}
        title="¿Reset del escritorio?"
        message="Se eliminarán todos los widgets y su disposición. Esta acción no se puede deshacer."
        confirmLabel="Eliminar todo"
        cancelLabel="Cancelar"
        destructive
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          resetDeck();
          setConfirmOpen(false);
        }}
      />
    </>
  );
}
