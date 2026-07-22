import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";
import { saveSession } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login(username, password);
      saveSession(data.access_token, data.user);
      router.push("/");
    } catch (err) {
      setError("Username atau password salah.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div
          className="login-header"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div className="logo-mark" style={{ marginBottom: "16px" }}>
            T
          </div>
          <h2>Task Management</h2>
          <p>Masukkan kredensial Anda untuk masuk</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Memproses..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
