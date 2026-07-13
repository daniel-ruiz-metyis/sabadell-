import { useDatasets, n, num } from "../api.js";
import { useFilters } from "../FilterContext.jsx";
import { Panel, Trend, Status, Dummy } from "../components/ui.jsx";

export default function Estampacion() {
  const { anio, mes } = useFilters();
  const { data, loading, error } = useDatasets(["estampacion", "estampacion_lotes"], { anio, mes });
  return (
    <Status loading={loading} error={error}>
      {data && <View estampadores={data.estampacion} lotes={data.estampacion_lotes} />}
    </Status>
  );
}

function View({ estampadores, lotes }) {
  return (
    <div className="grid" style={{ gap: "var(--s-lg)" }}>
      <Panel
        title="Proceso de estampación"
        right={<Dummy />}
      >
        <div className="grid" style={{ gap: "var(--s-md)" }}>
          {estampadores.map((e) => (
            <EstampadorRow key={e.estampador} e={e} />
          ))}
        </div>
      </Panel>

      <Panel title="Tabla tarjetas estampadas" right={<Dummy />}>
        <LotesTable lotes={lotes} />
      </Panel>
    </div>
  );
}

function EstampadorRow({ e }) {
  const vs = num(e.vs_objetivo_dias);
  const late = vs > 0;
  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: "180px repeat(4, 1fr)", gap: "var(--s-md)", alignItems: "stretch" }}
    >
      <div
        style={{
          background: "var(--sabadell-blue)",
          color: "#fff",
          borderRadius: "var(--r-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          fontSize: "1.05rem",
          padding: "var(--s-md)",
        }}
      >
        {e.estampador}
      </div>

      <Card
        label="Fecha de envío a estampación"
        figure={e.fecha_envio}
        foot={
          <span className={vs === 0 ? "trend up" : "trend down"}>
            vs fecha objetivo: {vs > 0 ? `+${vs}` : vs} días
          </span>
        }
      />
      <Card label="Tarjetas enviadas a estampar" figure={n(e.enviadas)} />
      <Card
        label="Tarjetas estampadas"
        figure={`${e.estampadas_pct}%`}
        foot={<Trend dir="up" />}
      />
      <Card
        label="Plazo de estampación (días)"
        figure={e.plazo_dias}
        tone={late ? "alert" : ""}
        foot={
          <>
            <Trend dir={late ? "up" : "down"} children={late ? "MoM + días" : "MoM - días"} />
            <span className="muted">Objetivo: {e.objetivo_dias}</span>
          </>
        }
      />
    </div>
  );
}

function Card({ label, figure, tone, foot }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className={`kpi-figure ${tone || ""}`} style={{ fontSize: "1.6rem" }}>
        {figure}
      </div>
      {foot && <div className="kpi-foot">{foot}</div>}
    </div>
  );
}

function LotesTable({ lotes }) {
  const sum = (c) => lotes.reduce((a, r) => a + num(r[c]), 0);
  return (
    <table>
      <thead>
        <tr>
          <th>Lote</th>
          <th>Fecha envío</th>
          <th>Fecha recepción</th>
          <th className="num">Enviadas</th>
          <th className="num">Recibidas estampadas</th>
          <th className="num">No estampadas</th>
          <th className="num">Plazo (días)</th>
        </tr>
      </thead>
      <tbody>
        {lotes.map((r) => (
          <tr key={r.lote}>
            <td>{r.lote}</td>
            <td className="num">{r.fecha_envio}</td>
            <td className="num">{r.fecha_recepcion}</td>
            <td className="num">{n(r.enviadas)}</td>
            <td className="num">{n(r.recibidas)}</td>
            <td className="num">{n(r.no_estampadas)}</td>
            <td className="num">{r.plazo_dias}</td>
          </tr>
        ))}
        <tr className="total">
          <td>Total</td>
          <td className="num">—</td>
          <td className="num">—</td>
          <td className="num">{n(sum("enviadas"))}</td>
          <td className="num">{n(sum("recibidas"))}</td>
          <td className="num">{n(sum("no_estampadas"))}</td>
          <td className="num">—</td>
        </tr>
      </tbody>
    </table>
  );
}
