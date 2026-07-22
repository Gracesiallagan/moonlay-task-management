import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const STATUS_OPTIONS = ["Todo", "In Progress", "Done"];

function toDatetimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

export default function TaskForm({ initialTask, users, onSubmit, submitLabel = "Simpan" }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTask?.title || "");
  const [description, setDescription] = useState(initialTask?.description || "");
  const [status, setStatus] = useState(initialTask?.status || "Todo");
  const [deadline, setDeadline] = useState(toDatetimeLocal(initialTask?.deadline));
  const [assigneeId, setAssigneeId] = useState(initialTask?.assignee?.id || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || "");
      setDescription(initialTask.description || "");
      setStatus(initialTask.status || "Todo");
      setDeadline(toDatetimeLocal(initialTask.deadline));
      setAssigneeId(initialTask.assignee?.id || "");
    }
  }, [initialTask]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        title,
        description,
        status,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        assignee_id: assigneeId || null,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Judul</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="form-group">
        <label>Deskripsi</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ minHeight: "100px" }} />
      </div>

      <div className="form-group">
        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Deadline</label>
        <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>

      <div className="form-group">
        <label>Assignee</label>
        <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
          <option key="unassigned" value="">-- Pilih assignee --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error-msg" style={{ marginBottom: "16px" }}>{error}</p>}

      <div style={{ display: "flex", gap: "12px" }}>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ flex: 1 }}>
          {loading ? "Menyimpan..." : submitLabel}
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => router.back()}
          style={{ flex: 1 }}
        >
          Kembali
        </button>
      </div>
    </form>
  );
}
