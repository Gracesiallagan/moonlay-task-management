import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../../lib/api";
import { getSession } from "../../lib/auth";
import TaskForm from "../../components/TaskForm";

export default function NewTaskPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const { token } = getSession();
    if (!token) {
      router.replace("/login");
      return;
    }
    api
      .getUsers()
      .then((allUsers) => {
        // Ensure uniqueness by name (case-insensitive) to avoid duplicate dropdown entries
        const uniqueByName = Array.from(
          new Map(
            allUsers.map((u) => [u.name.trim().toLowerCase(), u]),
          ).values(),
        );
        setUsers(uniqueByName);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(payload) {
    await api.createTask(payload);
    router.push("/");
  }

  return (
    <div className="container" style={{ maxWidth: "600px", marginTop: "40px" }}>
      <h2 style={{ marginBottom: "24px", fontWeight: "700" }}>
        Tambah Task Baru
      </h2>
      <div className="form-container">
        <TaskForm
          users={users}
          onSubmit={handleSubmit}
          submitLabel="Tambah Task"
        />
      </div>
    </div>
  );
}
