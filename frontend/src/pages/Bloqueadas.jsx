import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useDatasets, n, num } from "../api.js";
import { useFilters } from "../FilterContext.jsx";
import { Panel, Trend, Status, Dummy } from "../components/ui.jsx";
import { ChartTooltip } from "../components/chartkit.jsx";

const PIE_COLORS = ["#006dff", "#5aa5ff", "#10151c"];

export default function Bloqueadas() {
  const { anio, mes } = useFilters();
  const { data, loading, error } = useDatasets(
    ["bloqueo_motivos", "bloqueo_clientes", "bloqueo_segmento", "bloqueo_territorio", "desglose"],
    { anio, mes }
  );
  return (
    <Status loading={loading} error={error}>
      {data && (
        <View
          motivos={data.bloqueo_motivos}
          clientes={data.bloqueo_clientes}
          segmento={data.bloqueo_segmento}
          territorio={data.bloqueo_territorio}
          desglose={data.desglose}
        />
      )}
    </Status>
  );
}

function View({ motivos, clientes, segmento, territorio, desglose }) {
  const total = motivos.find((r) => r.categoria === "total");
  const byCat = (c) => motivos.filter((r) => r.categoria === c);
  const clientesTotal = clientes.find((r) => r.label === "Total");
  const enviadasTotal = desglose.reduce((a, r) => a + num(r.enviadas), 0);
  const bloqueadasPct = enviadasTotal > 0 ? Math.round((num(total.valor) / enviadasTotal) * 1000) / 10 : 0;
  const clientesPct = enviadasTotal > 0 ? Math.round((num(clientesTotal.valor) / enviadasTotal) * 1000) / 10 : 0;

  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--s-lg)" }}>
      {/* Left: reasons + origin */}
      <Panel
        title="Motivos y origen del bloqueo (# tarjetas)"
        right={<HeadStat value={n(total.valor)} unit="tarjetas" pill={`${bloqueadasPct}%`} />}
      >
        <BarSet title="Total" rows={[total]} valueKey="valor" />
        <div className="section-label">Motivos de bloqueo</div>
        <BarSet rows={byCat("motivo")} valueKey="valor" />
        <div className="section-label">Origen del bloqueo</div>
        <BarSet rows={byCat("origen")} valueKey="valor" />
      </Panel>

      {/* Right: client view + segment + territory */}
      <Panel
        title="Visión cliente de las tarjetas bloqueadas (# clientes)"
        right={<HeadStat value={n(clientesTotal.valor)} unit="clientes" pill={`${clientesPct}%`} />}
      >
        <BarSet rows={clientes} valueKey="valor" showPct />

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--s-md)", marginTop: "var(--s-md)" }}>
          <div>
            <div className="section-label">Segmento comercial</div>
            <SegmentPie rows={segmento} />
          </div>
          <div>
            <div className="section-label">Territorio</div>
            <TerritoryBars rows={territorio} />
          </div>
        </div>
        <div style={{ marginTop: "var(--s-sm)" }}>
          <Dummy />
        </div>
      </Panel>
    </div>
  );
}

function HeadStat({ value, unit, pill }) {
  return (
    <div style={{ display: "flex", gap: "var(--s-sm)", alignItems: "center" }}>
      <div
        style={{
          border: "1px solid var(--neutral-border)",
          borderRadius: "var(--r-sm)",
          padding: "6px 12px",
          textAlign: "center",
        }}
      >
        <div className="kpi-figure num" style={{ fontSize: "1.2rem" }}>{value}</div>
        <div className="kpi-label" style={{ fontSize: "0.62rem" }}>{unit}</div>
      </div>
      <div
        style={{
          border: "1px solid var(--neutral-border)",
          borderRadius: "var(--r-sm)",
          padding: "10px 14px",
          color: "var(--status-warning)",
          fontWeight: 700,
        }}
      >
        {pill}
      </div>
    </div>
  );
}

function BarSet({ rows, valueKey, showPct }) {
  const max = Math.max(...rows.map((r) => num(r[valueKey])), 1);
  return (
    <div>
      {rows.map((r) => (
        <div className="hbar-row" key={r.label}>
          <span className="hbar-label">{r.label}</span>
          <div className="hbar-track">
            <div className="hbar-fill" style={{ width: `${(num(r[valueKey]) / max) * 100}%` }} />
          </div>
          <span className="hbar-value">
            {n(r[valueKey])}
            {showPct && r.pct ? <span className="muted"> · {r.pct}%</span> : null}
            {r.mom_dir ? <span style={{ marginLeft: 8 }}><Trend dir={r.mom_dir} /></span> : null}
          </span>
        </div>
      ))}
    </div>
  );
}

function SegmentPie({ rows }) {
  const data = rows.map((r) => ({ name: r.segmento, value: num(r.valor), pct: r.pct }));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--s-md)" }}>
      <div style={{ width: 130, height: 130 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={0} outerRadius={60} stroke="none">
              {data.map((d, i) => (
                <Cell key={d.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip fmt={n} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="legend">
        {data.map((d, i) => (
          <div className="legend-item" key={d.name}>
            <span className="legend-swatch" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span>{d.name}</span>
            <span className="num muted">· {n(d.value)} ({d.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TerritoryBars({ rows }) {
  const top = [...rows].sort((a, b) => num(b.valor) - num(a.valor)).slice(0, 6);
  const max = Math.max(...top.map((r) => num(r.valor)), 1);
  return (
    <div>
      {top.map((r) => (
        <div key={r.codigo} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6, marginBottom: 6 }}>
          <div style={{ fontSize: "0.78rem" }}>{r.territorio}</div>
          <div className="num" style={{ fontSize: "0.78rem", fontWeight: 600 }}>{n(r.valor)}</div>
          <div className="hbar-track" style={{ gridColumn: "1 / -1", height: 8 }}>
            <div className="hbar-fill" style={{ width: `${(num(r.valor) / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
