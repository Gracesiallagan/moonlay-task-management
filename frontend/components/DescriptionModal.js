export default function DescriptionModal({ task, onClose }) {
  if (!task) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="drawer-header">
          <h2 style={{ margin: 0 }}>{task.title}</h2>
          <button className="btn btn-secondary" onClick={onClose}>
            ✕
          </button>
        </div>

        <p style={{ color: "var(--text-muted)", marginTop: 8 }}>
          Status: {task.status} •{" "}
          {task.assignee ? task.assignee.name : "Unassigned"}
        </p>

        <div style={{ marginTop: 18, lineHeight: 1.8, fontSize: 15 }}>
          {task.description ? (
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
              {task.description}
            </p>
          ) : (
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              Tidak ada deskripsi.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
