/* Shared Recharts styling so every chart reads as one system. */
export const VIZ = {
  debito: "#006dff",
  credito: "#0052c2",
  otros: "#b9d3ff",
  blue: "#006dff",
  clic: "#5aa5ff",
};

export const axis = {
  tick: { fill: "#5b6472", fontSize: 12 },
  axisLine: { stroke: "#e2e7ee" },
  tickLine: false,
};

export const grid = { stroke: "#e2e7ee", strokeDasharray: "0" };

export function ChartTooltip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--neutral-surface)",
        border: "1px solid var(--neutral-border)",
        borderRadius: 8,
        boxShadow: "var(--shadow-overlay)",
        padding: "8px 12px",
        fontSize: "0.8rem",
      }}
    >
      {label != null && (
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      )}
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: p.color || p.fill,
              display: "inline-block",
            }}
          />
          <span className="muted">{p.name}:</span>
          <span className="num" style={{ fontWeight: 600 }}>
            {fmt ? fmt(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}
