import { useEffect } from 'react';
import { useDeckStore } from '../store/useDeckStore.js';
import { listAvailable } from '../widgets/registry.js';

export function WidgetPicker() {
  const open = useDeckStore((s) => s.pickerOpen);
  const setOpen = useDeckStore((s) => s.setPickerOpen);
  const addWidget = useDeckStore((s) => s.addWidget);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  if (!open) return null;

  const items = listAvailable();

  return (
    <div className="picker__backdrop" onClick={() => setOpen(false)}>
      <div className="picker" onClick={(e) => e.stopPropagation()}>
        <div className="picker__header">
          <div>
            <div className="picker__title">Añadir widget</div>
            <div className="picker__sub">{items.length} disponibles</div>
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn" onClick={() => setOpen(false)}>Cerrar</button>
        </div>
        <div className="picker__grid">
          {items.map((it) => (
            <button
              key={it.type}
              className="picker__item"
              onClick={() => addWidget(it.type)}
            >
              <div className="picker__item-icon">
                {it.Icon && <it.Icon size={22} stroke={1.6} />}
              </div>
              <div className="picker__item-name">{it.name}</div>
              <div className="picker__item-desc">{it.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
