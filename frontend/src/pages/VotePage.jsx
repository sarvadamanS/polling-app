/**
 * pages/VotePage.jsx
 * The public-facing voting screen.
 * - Fetches nominees from API
 * - Checks if this session already voted
 * - Lets user pick one nominee and submit their vote
 * - Shows a thank-you screen after voting
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";
import NomineeCard from "../components/NomineeCard.jsx";

export default function VotePage() {
  const [nominees, setNominees] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load nominees and check vote status on mount
  useEffect(() => {
    Promise.all([api.get("/nominees"), api.get("/votes/status")])
      .then(([nomRes, statusRes]) => {
        setNominees(nomRes.data);
        setHasVoted(statusRes.data.hasVoted);
        setVotedFor(statusRes.data.votedFor);
      })
      .catch(() => setError("Failed to load the poll. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  // Cast vote
  async function handleVote() {
    if (!selected) return;
    setSubmitting(true);
    setError("");
    try {
      await api.post("/votes", { nomineeId: selected });
      setHasVoted(true);
      setVotedFor(selected);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loader />;

  const votedNominee = nominees.find((n) => n.id === votedFor);

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>🗳️ Election 2024</h1>
          <p style={styles.subtitle}>Cast your vote — one per session</p>
        </div>
        <Link to="/admin" style={styles.adminLink}>Admin ↗</Link>
      </header>

      {/* Already voted */}
      {hasVoted ? (
        <div className="card" style={styles.thankYou}>
          <div style={styles.checkCircle}>✓</div>
          <h2 style={{ marginBottom: 8 }}>Thank you for voting!</h2>
          {votedNominee && (
            <p style={{ color: "var(--muted)" }}>
              You voted for <strong style={{ color: votedNominee.color }}>{votedNominee.name}</strong>
            </p>
          )}
          <p style={{ color: "var(--muted)", marginTop: 8, fontSize: "0.9rem" }}>
            Each session can only cast one vote.
          </p>
        </div>
      ) : (
        /* Voting form */
        <div style={styles.content}>
          <p style={styles.instruction}>Select your preferred candidate:</p>

          <div style={styles.grid}>
            {nominees.map((nominee) => (
              <NomineeCard
                key={nominee.id}
                nominee={nominee}
                selected={selected === nominee.id}
                onSelect={() => setSelected(nominee.id)}
              />
            ))}
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button
              className="btn btn-primary"
              onClick={handleVote}
              disabled={!selected || submitting}
              style={{ fontSize: "1.1rem", padding: "14px 40px", opacity: (!selected || submitting) ? 0.5 : 1 }}
            >
              {submitting ? "Submitting…" : "Cast Vote"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ color: "var(--muted)", fontSize: "1.2rem" }}>Loading poll…</div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 900, margin: "0 auto", padding: "24px 16px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 },
  title: { fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em" },
  subtitle: { color: "var(--muted)", marginTop: 4 },
  adminLink: { background: "var(--surface)", padding: "8px 16px", borderRadius: 8, color: "var(--muted)", fontSize: "0.9rem" },
  content: { paddingBottom: 48 },
  instruction: { color: "var(--muted)", marginBottom: 20, fontSize: "1rem" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 },
  thankYou: { maxWidth: 440, margin: "80px auto", textAlign: "center", padding: 48 },
  checkCircle: { width: 64, height: 64, borderRadius: "50%", background: "var(--success)", color: "#fff", fontSize: "2rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" },
  error: { color: "var(--danger)", marginTop: 16, textAlign: "center" },
};