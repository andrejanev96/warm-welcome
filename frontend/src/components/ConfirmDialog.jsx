const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  tone = 'default',
}) => {
  if (!open) {
    return null;
  }

  const confirmButtonClass = [
    'confirm-dialog__button',
    'confirm-dialog__button--confirm',
    tone === 'danger' ? 'confirm-dialog__button--confirm-danger' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="confirm-dialog-overlay" role="alertdialog" aria-modal="true">
      <div className="confirm-dialog">
        {title ? <h3 className="confirm-dialog__title">{title}</h3> : null}
        {message ? <p className="confirm-dialog__message">{message}</p> : null}
        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="confirm-dialog__button confirm-dialog__button--cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={confirmButtonClass}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="confirm-dialog__loading">
                <span className="confirm-dialog__spinner" aria-hidden="true" />
                <span className="sr-only">Processing</span>
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
