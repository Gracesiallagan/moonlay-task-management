export default function TaskDetailDrawer({ task, onClose }) {
  if (!task) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2 style={{ margin: 0 }}>Detail Task</h2>
          <button className="btn btn-secondary" onClick={onClose}>✕</button>
        </div>
        <h3>{task.title}</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Status: {task.status}</p>
        <p style={{ marginTop: "24px", lineHeight: "1.6" }}>{task.description || "Tidak ada deskripsi."}</p>
      </div>
    </div>
  );
}
