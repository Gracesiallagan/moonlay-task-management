export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3 style={{ margin: 0 }}>{title}</h3>
        </div>
        <div style={{ marginTop: 8, marginBottom: 18 }}>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message}</p>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
