import { IconX } from '@tabler/icons-react';
import { useDeckStore } from '../store/useDeckStore.js';
import { useSettingsStore } from '../store/useSettingsStore.js';
import { getDescriptor } from '../widgets/registry.js';
import { useTranslation } from '../i18n.jsx';

export function DeckWidget({ instance }) {
  const editMode = useDeckStore((s) => s.editMode);
  const removeWidget = useDeckStore((s) => s.removeWidget);
  const location = useSettingsStore((s) => s.location);
  const { t } = useTranslation();

  const desc = getDescriptor(instance.type);
  if (!desc) return null;

  const Component = desc.Component;

  return (
    <div className={`widget widget--${instance.type} ${editMode ? 'widget--edit' : ''}`}>
      <div className="widget__chrome">
        <span className="widget__icon">
          {desc.Icon && <desc.Icon size={13} stroke={1.8} />}
        </span>
        <span className="widget__title">{t(desc.nameKey)}</span>
        <button
          className="widget__close"
          aria-label={t('widget.removeAria')}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            removeWidget(instance.id);
          }}
        >
          <IconX size={12} stroke={2} />
        </button>
      </div>
      <div className="widget__body">
        <Component instance={instance} settings={instance.settings} location={location} />
      </div>
    </div>
  );
}
