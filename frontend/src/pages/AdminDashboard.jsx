/**
 * pages/AdminDashboard.jsx
 * Real-time admin dashboard.
 *
 * Features:
 *  - Verifies admin session on mount; redirects to /admin if not logged in
 *  - Connects to Socket.io and listens for "voteUpdate" events
 *  - Shows: total votes, per-nominee count, bar chart, pie chart
 */

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import api from "../lib/api.js";
import { useSocket } from "../hooks/useSocket.js";

export default function AdminDashboard() {
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const { nominees, totalVotes } = useSocket();

  // Guard: redirect to login if no admin session
  useEffect(() => {
    api.get("/auth/me").then(({ data }) => {
      if (!data.loggedIn) {
        navigate("/admin", { replace: true });
      } else {
        setAuthChecked(true);
      }
    });
  }, [navigate]);

  async function handleLogout() {
    await api.post("/auth/logout");
    navigate("/admin", { replace: true });
  }

  if (!authChecked) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p style={{ color: "var(--muted)" }}>Authenticating…</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>📊 Admin Dashboard</h1>
          <p style={styles.subtitle}>Results update live via WebSocket</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/" style={styles.link}>View Poll ↗</Link>
          <button className="btn btn-danger" onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      {/* Total votes KPI */}
      <div className="card" style={styles.kpi}>
        <p style={styles.kpiLabel}>Total Votes Cast</p>
        <p style={styles.kpiValue}>{totalVotes}</p>
        <div style={styles.liveBadge}>
          <span style={styles.liveDot} />
          LIVE
        </div>
      </div>

      {/* Nominee cards with vote count */}
      <div style={styles.nomineeGrid}>
        {nominees.map((n) => {
          const pct = totalVotes > 0 ? ((n.votes / totalVotes) * 100).toFixed(1) : "0.0";
          return (
            <div className="card" key={n.id} style={{ ...styles.nomineeCard, borderTop: `4px solid ${n.color}` }}>
              <p style={styles.nomineeName}>{n.name}</p>
              <p style={{ color: n.color, fontSize: "0.8rem", fontWeight: 600, marginBottom: 12 }}>{n.party}</p>
              <p style={styles.voteCount}>{n.votes}</p>
              <p style={styles.votePct}>{pct}%</p>
              {/* Mini progress bar */}
              <div style={styles.barBg}>
                <div style={{ ...styles.barFill, width: `${pct}%`, background: n.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      {nominees.length > 0 && (
        <div style={styles.charts}>
          {/* Horizontal Bar Chart */}
          <div className="card" style={styles.chartCard}>
            <h2 style={styles.chartTitle}>Vote Distribution (Bar)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={nominees} layout="vertical" margin={{ left: 16, right: 32, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#f1f5f9", fontSize: 12 }} width={130} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8 }}
                  labelStyle={{ color: "#f1f5f9" }}
                  itemStyle={{ color: "#94a3b8" }}
                />
                <Bar dataKey="votes" radius={[0, 6, 6, 0]}>
                  {nominees.map((n) => (
                    <Cell key={n.id} fill={n.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="card" style={styles.chartCard}>
            <h2 style={styles.chartTitle}>Vote Share (Pie)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={nominees}
                  dataKey="votes"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    percent > 0 ? `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%` : ""
                  }
                  labelLine={false}
                >
                  {nominees.map((n) => (
                    <Cell key={n.id} fill={n.color} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ color: "#f1f5f9", fontSize: "0.8rem" }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8 }}
                  itemStyle={{ color: "#94a3b8" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {totalVotes === 0 && (
        <p style={{ textAlign: "center", color: "var(--muted)", marginTop: 48 }}>
          No votes yet. Share the poll link to start collecting votes.
        </p>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px 48px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  title: { fontSize: "1.8rem", fontWeight: 800 },
  subtitle: { color: "var(--muted)", marginTop: 4 },
  link: { color: "var(--muted)", fontSize: "0.9rem", padding: "10px 16px", background: "var(--surface)", borderRadius: 8 },
  kpi: { display: "flex", alignItems: "center", gap: 24, marginBottom: 28, position: "relative" },
  kpiLabel: { color: "var(--muted)", fontSize: "0.9rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" },
  kpiValue: { fontSize: "3.5rem", fontWeight: 900, color: "var(--accent-light)", lineHeight: 1, marginLeft: 8 },
  liveBadge: { marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "#10b98120", border: "1px solid #10b981", borderRadius: 20, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 700, color: "#10b981" },
  liveDot: { width: 8, height: 8, borderRadius: "50%", background: "#10b981", animation: "pulse 1.5s infinite" },
  nomineeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 28 },
  nomineeCard: { textAlign: "center" },
  nomineeName: { fontWeight: 700, fontSize: "0.95rem", marginBottom: 4 },
  voteCount: { fontSize: "2.2rem", fontWeight: 900, lineHeight: 1, marginBottom: 2 },
  votePct: { color: "var(--muted)", fontSize: "0.9rem", marginBottom: 12 },
  barBg: { background: "var(--surface2)", borderRadius: 4, height: 6, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4, transition: "width 0.6s ease" },
  charts: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  chartCard: {},
  chartTitle: { fontSize: "1rem", fontWeight: 700, marginBottom: 20, color: "var(--muted)" },
};