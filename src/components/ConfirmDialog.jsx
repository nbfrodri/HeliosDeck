import { Modal } from './Modal.jsx';

export function ConfirmDialog({
  open,
  title = 'Confirmar',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  onCancel,
  onConfirm
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} width={460}
      footer={
        <>
          <button className="btn" onClick={onCancel}>{cancelLabel}</button>
          <button
            className={destructive ? 'btn btn--destructive' : 'btn btn--solid'}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ margin: 0, color: 'var(--text-2)', fontSize: 14, lineHeight: 1.55 }}>
        {message}
      </p>
    </Modal>
  );
}
