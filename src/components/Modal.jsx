import { useEffect } from 'react';
import { IconX } from '@tabler/icons-react';

export function Modal({ open, onClose, title, subtitle, children, footer, width = 520 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal__backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        style={{ width: `min(${width}px, 92vw)` }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <div style={{ flex: 1 }}>
            {title && <div className="modal__title">{title}</div>}
            {subtitle && <div className="modal__sub">{subtitle}</div>}
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Cerrar">
            <IconX size={16} stroke={1.8} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
