import { useState } from "react";
import Link from "next/link";
import TaskDetailDrawer from "./TaskDetailDrawer";
import DescriptionModal from "./DescriptionModal";

function badgeClass(status) {
  if (status === "Done") return "badge badge-done";
  if (status === "In Progress") return "badge badge-in-progress";
  return "badge badge-todo";
}

function formatDate(value) {
  if (!value) return "No deadline";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function TaskItem({ task, onDelete, onViewDetails, onViewDescription }) {
  return (
    <div className="task-item">
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "17px",
            fontWeight: "600",
            cursor: "pointer",
            color: "var(--primary-color)",
          }}
          onClick={() => onViewDetails(task)}
        >
          {task.title}
        </h3>
        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "13px",
            color: "var(--text-muted)",
          }}
        >
          <span className={badgeClass(task.status)}>{task.status}</span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            📅 {formatDate(task.deadline)}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            👤 {task.assignee ? task.assignee.name : "Unassigned"}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button
          className="btn btn-primary"
          onClick={() => onViewDescription(task)}
        >
          View
        </button>
        <Link href={`/tasks/edit/${task.id}`} className="btn btn-secondary">
          Edit
        </Link>
        <button className="btn btn-danger" onClick={() => onDelete(task)}>
          Hapus
        </button>
      </div>
    </div>
  );
}

export default function TaskList({ tasks, onDelete }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalTask, setModalTask] = useState(null);

  if (!tasks.length) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "64px 0",
          color: "var(--text-muted)",
        }}
      >
        <p style={{ fontSize: "16px" }}>
          Belum ada task dengan status tersebut.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="task-grid">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={onDelete}
            onViewDetails={setSelectedTask}
            onViewDescription={setModalTask}
          />
        ))}
      </div>
      <TaskDetailDrawer
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
      <DescriptionModal task={modalTask} onClose={() => setModalTask(null)} />
    </>
  );
}
