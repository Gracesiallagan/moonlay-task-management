import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api } from "../lib/api";
import { getSession, clearSession } from "../lib/auth";
import TaskList from "../components/TaskList";
import Chatbot from "../components/Chatbot";
import ConfirmModal from "../components/ConfirmModal";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [limit, setLimit] = useState(10); // Default limit
  const [confirmTask, setConfirmTask] = useState(null);

  useEffect(() => {
    const { token, user } = getSession();
    if (!token) {
      router.replace("/login");
      return;
    }
    setUser(user);
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (filter !== "All") {
      result = result.filter((t) => t.status === filter);
    }
    return result.slice(0, limit); // Apply limit
  }, [tasks, filter, limit]);

  async function handleDelete(task) {
    // show confirm modal instead of browser confirm
    setConfirmTask(task);
  }

  async function confirmDelete() {
    if (!confirmTask) return;
    try {
      await api.deleteTask(confirmTask.id);
      setConfirmTask(null);
      loadTasks();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  if (!user) return null;

  return (
    <div>
      <div className="topbar">
        <div className="brand">
          <div className="logo-mark">T</div>
          TaskManagement
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <span
            style={{
              fontSize: "15px",
              fontWeight: "500",
              color: "var(--text-main)",
            }}
          >
            Halo, {user.name}
          </span>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>
            Daftar Task
          </h2>
          <Link href="/tasks/new" className="btn btn-primary">
            + Tambah Task
          </Link>
        </div>

        {/* Filter Controls */}
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            {["All", "Todo", "In Progress", "Done"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`btn ${filter === s ? "btn-primary" : "btn-secondary"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
              Tampil:
            </span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
              }}
            >
              {[5, 10, 25, 50, 100].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <p style={{ textAlign: "center", marginTop: "40px" }}>Memuat...</p>
        )}
        {error && <p className="error-msg">{error}</p>}

        {!loading && !error && (
          <TaskList tasks={filteredTasks} onDelete={handleDelete} />
        )}
      </div>

      <Chatbot />
      <ConfirmModal
        open={!!confirmTask}
        title="Hapus task"
        message={confirmTask ? `Hapus task "${confirmTask.title}"?` : ""}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmTask(null)}
      />
    </div>
  );
}
