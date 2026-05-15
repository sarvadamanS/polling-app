/**
 * pages/AdminLogin.jsx
 * Admin login form. On success, redirects to /admin/dashboard.
 * Default credentials: admin / admin123
 */

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api.js";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in, skip login screen
  useEffect(() => {
    api.get("/auth/me").then(({ data }) => {
      if (data.loggedIn) navigate("/admin/dashboard", { replace: true });
    });
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/login", { username, password });
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div className="card" style={styles.card}>
        <h1 style={styles.title}>🔐 Admin Login</h1>
        <p style={styles.hint}>Default: <code>admin</code> / <code>admin123</code></p>

        <div style={styles.field}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            autoComplete="username"
          />
        </div>

        <div style={styles.field}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            onKeyDown={(e) => e.key === "Enter" && handleLogin(e)}
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button
          className="btn btn-primary"
          onClick={handleLogin}
          disabled={loading}
          style={{ width: "100%", justifyContent: "center", marginTop: 8, opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Logging in…" : "Log In"}
        </button>

        <Link to="/" style={styles.back}>← Back to voting</Link>
      </div>
    </div>
  );
}

const styles = {
  page: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 16 },
  card: { width: "100%", maxWidth: 420, padding: 40 },
  title: { fontSize: "1.6rem", fontWeight: 800, marginBottom: 8 },
  hint: { color: "var(--muted)", fontSize: "0.875rem", marginBottom: 28, background: "var(--surface2)", padding: "8px 12px", borderRadius: 8 },
  field: { marginBottom: 20 },
  error: { color: "var(--danger)", fontSize: "0.9rem", marginBottom: 12 },
  back: { display: "block", textAlign: "center", marginTop: 24, color: "var(--muted)", fontSize: "0.9rem" },
};