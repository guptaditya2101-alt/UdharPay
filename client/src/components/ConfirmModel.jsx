const ConfirmModal = ({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <h3>{title}</h3>

        <p>{message}</p>

        <div className="modal-actions">
          <button
            type="button"
            className="modal-cancel-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="modal-confirm-btn"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;