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
import { useTranslation } from '../i18n.jsx';

export function Toolbar() {
  const editMode = useDeckStore((s) => s.editMode);
  const toggleEditMode = useDeckStore((s) => s.toggleEditMode);
  const togglePicker = useDeckStore((s) => s.togglePicker);
  const resetDeck = useDeckStore((s) => s.reset);
  const location = useSettingsStore((s) => s.location);
  const requestGeolocation = useSettingsStore((s) => s.requestGeolocation);
  const { t } = useTranslation();

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
      window.alert(t('toolbar.gpsFailed'));
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
          {t('nav.earthquakes')}
        </NavLink>
        <NavLink to="/map" className="toolbar__nav-link">
          {t('nav.map')}
        </NavLink>
        <div className="toolbar__divider" />
        <button
          ref={locationBtnRef}
          className="btn btn--location"
          onClick={openSearch}
          title={t('toolbar.changeLocation')}
        >
          <IconMapPin size={14} stroke={1.8} />
          <span>{location?.label ?? t('toolbar.noLocation')}</span>
        </button>
        <button className="btn btn--icon" onClick={onGps} disabled={gpsBusy} title={t('toolbar.useGps')}>
          <IconCurrentLocation size={14} stroke={1.8} />
        </button>
        <div className="toolbar__divider" />
        <button className="btn btn--icon" onClick={() => setSkyOpen(true)} title={t('toolbar.customizeSky')}>
          <IconPalette size={14} stroke={1.8} />
        </button>
        <div className="toolbar__spacer" />
        <button className="btn" onClick={togglePicker}>
          <IconPlus size={14} stroke={1.9} />
          <span>{t('toolbar.addWidget')}</span>
        </button>
        <button
          className={`btn ${editMode ? 'btn--solid' : ''}`}
          onClick={toggleEditMode}
        >
          {editMode ? <IconCheck size={14} stroke={2.2} /> : <IconPencil size={14} stroke={1.8} />}
          <span>{editMode ? t('toolbar.done') : t('toolbar.edit')}</span>
        </button>
        {editMode && (
          <button
            className="btn btn--danger"
            onClick={() => setConfirmOpen(true)}
            title={t('toolbar.removeAllTooltip')}
          >
            <IconTrash size={14} stroke={1.8} />
            <span>{t('toolbar.reset')}</span>
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
        title={t('toolbar.resetConfirmTitle')}
        message={t('toolbar.resetConfirmMessage')}
        confirmLabel={t('toolbar.resetConfirmAction')}
        cancelLabel={t('common.cancel')}
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
