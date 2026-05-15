/**
 * components/NomineeCard.jsx
 * Displays a single nominee in the voting grid.
 * Highlights when selected; calls onSelect on click.
 */

export default function NomineeCard({ nominee, selected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        ...styles.card,
        borderColor: selected ? nominee.color : "transparent",
        boxShadow: selected ? `0 0 0 2px ${nominee.color}40` : "var(--shadow)",
      }}
    >
      {/* Color stripe */}
      <div style={{ ...styles.stripe, background: nominee.color }} />

      {/* Radio indicator */}
      <div style={styles.radioRow}>
        <div style={{ ...styles.radio, borderColor: selected ? nominee.color : "var(--surface2)" }}>
          {selected && <div style={{ ...styles.radioDot, background: nominee.color }} />}
        </div>
      </div>

      <h3 style={styles.name}>{nominee.name}</h3>
      <span style={{ ...styles.party, color: nominee.color }}>{nominee.party}</span>
      <p style={styles.bio}>{nominee.bio}</p>
    </div>
  );
}

const styles = {
  card: {
    background: "var(--surface)",
    borderRadius: "var(--radius)",
    border: "2px solid transparent",
    padding: "20px",
    cursor: "pointer",
    transition: "border-color 0.2s, box-shadow 0.2s, transform 0.1s",
    position: "relative",
    overflow: "hidden",
  },
  stripe: { position: "absolute", top: 0, left: 0, right: 0, height: 4, borderRadius: "12px 12px 0 0" },
  radioRow: { display: "flex", justifyContent: "flex-end", marginBottom: 12, marginTop: 8 },
  radio: { width: 20, height: 20, borderRadius: "50%", border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: "50%" },
  name: { fontSize: "1.1rem", fontWeight: 700, marginBottom: 4 },
  party: { fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" },
  bio: { color: "var(--muted)", fontSize: "0.875rem", marginTop: 10, lineHeight: 1.5 },
};