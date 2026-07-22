import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../../../lib/api";
import { getSession } from "../../../lib/auth";
import TaskForm from "../../../components/TaskForm";

export default function EditTaskPage() {
  const router = useRouter();
  const { id } = router.query;
  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const { token } = getSession();
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!id) return;

    Promise.all([api.getTask(id), api.getUsers()])
      .then(([taskData, allUsers]) => {
        setTask(taskData);
        // Ensure uniqueness by name (case-insensitive) to avoid duplicate dropdown entries
        const uniqueByName = Array.from(
          new Map(
            allUsers.map((u) => [u.name.trim().toLowerCase(), u]),
          ).values(),
        );
        setUsers(uniqueByName);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  async function handleSubmit(payload) {
    await api.updateTask(id, payload);
    router.push("/");
  }

  return (
    <div className="container" style={{ maxWidth: "600px", marginTop: "40px" }}>
      <h2 style={{ marginBottom: "24px", fontWeight: "700" }}>Edit Task</h2>
      {error && <p className="error-msg">{error}</p>}
      <div className="form-container">
        {task ? (
          <TaskForm
            initialTask={task}
            users={users}
            onSubmit={handleSubmit}
            submitLabel="Simpan Perubahan"
          />
        ) : (
          !error && <p style={{ textAlign: "center" }}>Memuat...</p>
        )}
      </div>
    </div>
  );
}
