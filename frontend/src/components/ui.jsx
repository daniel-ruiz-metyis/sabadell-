import { IconUp, IconDown } from "./icons.jsx";

export function Panel({ title, note, right, children, style }) {
  return (
    <section className="panel" style={style}>
      {(title || right) && (
        <div className="panel-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {title && <h2 className="panel-title">{title}</h2>}
            {note && <span className="dummy-tag">{note}</span>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

/* Trend indicator: color is never alone, it always rides with an arrow (a11y). */
export function Trend({ dir, children }) {
  if (!dir) return null;
  const up = dir === "up";
  return (
    <span className={`trend ${up ? "up" : "down"}`}>
      {up ? <IconUp width={13} height={13} /> : <IconDown width={13} height={13} />}
      {children || (up ? "MoM +%" : "MoM -%")}
    </span>
  );
}

export function Kpi({ label, figure, tone, foot }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className={`kpi-figure ${tone || ""}`}>{figure}</div>
      {foot && <div className="kpi-foot">{foot}</div>}
    </div>
  );
}

export function Dummy() {
  return <span className="dummy-tag">datos dummy</span>;
}

/* Wraps a page's data loading. Renders children(data) once loaded. */
export function Status({ loading, error, children }) {
  if (loading) return <div className="loading">Cargando datos…</div>;
  if (error) return <div className="errbox">No se pudieron cargar los datos: {error}</div>;
  return children;
}
