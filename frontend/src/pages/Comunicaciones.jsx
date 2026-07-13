import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useDatasets, n, num } from "../api.js";
import { useFilters } from "../FilterContext.jsx";
import { Panel, Status, Dummy } from "../components/ui.jsx";
import { VIZ, axis, grid, ChartTooltip } from "../components/chartkit.jsx";
import { IconSend, IconMail, IconClick, IconBell, IconRefresh } from "../components/icons.jsx";

const FUNNEL_COLORS = ["#0a2540", "#006dff", "#b9d3ff", "#5aa5ff"];

export default function Comunicaciones() {
  const { anio, mes } = useFilters();
  const { data, loading, error } = useDatasets(
    ["comunicaciones_kpis", "comunicaciones_hitos", "comunicaciones_funnel", "comunicaciones_canales"],
    { anio, mes }
  );
  return (
    <Status loading={loading} error={error}>
      {data && (
        <View
          kpis={data.comunicaciones_kpis}
          hitos={data.comunicaciones_hitos}
          funnel={data.comunicaciones_funnel}
          canales={data.comunicaciones_canales}
        />
      )}
    </Status>
  );
}

function View({ kpis, hitos, funnel, canales }) {
  const k = Object.fromEntries(kpis.map((r) => [r.key, r.valor]));
  const topChannel = [...canales].sort((a, b) => num(b.apertura) - num(a.apertura))[0];

  const funnelData = funnel.map((r) => ({
    etapa: r.etapa,
    pct: num(r.pct),
    valor: num(r.valor),
  }));
  const canalData = canales.map((r) => ({
    canal: r.canal,
    apertura: num(r.apertura),
    clic: num(r.clic),
  }));

  return (
    <div className="grid" style={{ gap: "var(--s-lg)" }}>
      <div className="callout">
        <span aria-hidden="true">⚠</span>
        <span>
          A día de hoy no se realiza seguimiento de las comunicaciones operativas. De cara al
          futuro cuadro de mando, sería interesante contar con información relevante para Negocio
          que provenga del gestor de campañas.
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span className="source-pill">
          <IconRefresh width={15} height={15} /> Fuente: Latinia
        </span>
      </div>

      {/* KPI tiles */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--s-md)" }}>
        <IconKpi Icon={IconSend} figure={n(k.enviadas)} label="Comunicaciones enviadas (Ene-Abr)" tone="accent" />
        <IconKpi Icon={IconMail} figure={`${k.apertura}%`} label="Tasa de apertura media" />
        <IconKpi Icon={IconClick} figure={`${k.ctr}%`} label="Tasa de clic media (CTR)" />
        <IconKpi
          Icon={IconBell}
          figure={`${topChannel.canal} · ${k.canal_top}%`}
          label="Canal con mayor tasa de apertura"
        />
      </div>

      <Panel title="Detalle por hito de comunicación" right={<Dummy />}>
        <HitosTable hitos={hitos} />
      </Panel>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--s-lg)" }}>
        <Panel title="Funnel global de interacción" right={<Dummy />}>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={funnelData} margin={{ top: 28, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid {...grid} vertical={false} />
                <XAxis dataKey="etapa" {...axis} />
                <YAxis {...axis} width={44} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip cursor={{ fill: "rgba(0,109,255,0.05)" }} content={<FunnelTip />} />
                <Bar dataKey="pct" name="% del total" radius={[3, 3, 0, 0]}>
                  <LabelList
                    dataKey="valor"
                    position="insideBottom"
                    offset={8}
                    formatter={n}
                    style={{ fill: "#fff", fontSize: 11, fontWeight: 600 }}
                  />
                  <LabelList dataKey="pct" position="top" formatter={(v) => `${v}%`} style={{ fill: "#10151c", fontSize: 12, fontWeight: 700 }} />
                  {funnelData.map((d, i) => (
                    <Cell key={d.etapa} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Comparativa por canal — apertura vs clic" right={<Dummy />}>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={canalData} margin={{ top: 28, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid {...grid} vertical={false} />
                <XAxis dataKey="canal" {...axis} />
                <YAxis {...axis} width={44} domain={[0, 60]} tickFormatter={(v) => `${v}%`} />
                <Tooltip cursor={{ fill: "rgba(0,109,255,0.05)" }} content={<ChartTooltip fmt={(v) => `${v}%`} />} />
                <Bar dataKey="apertura" name="% Apertura" fill={VIZ.debito} radius={[3, 3, 0, 0]}>
                  <LabelList dataKey="apertura" position="top" formatter={(v) => `${v}%`} style={{ fill: "#5b6472", fontSize: 11 }} />
                </Bar>
                <Bar dataKey="clic" name="% Clic" fill={VIZ.clic} radius={[3, 3, 0, 0]}>
                  <LabelList dataKey="clic" position="top" formatter={(v) => `${v}%`} style={{ fill: "#5b6472", fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function IconKpi({ Icon, figure, label, tone }) {
  return (
    <div className="kpi">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className={`kpi-figure ${tone || ""}`} style={{ fontSize: "1.7rem" }}>{figure}</div>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "var(--sabadell-blue-tint)",
            color: "var(--sabadell-blue)",
            display: "grid",
            placeItems: "center",
            flex: "none",
          }}
        >
          <Icon width={18} height={18} />
        </span>
      </div>
      <div className="kpi-label" style={{ marginTop: "auto" }}>{label}</div>
    </div>
  );
}

function FunnelTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
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
      <div style={{ fontWeight: 600 }}>{label}</div>
      <div className="num">{n(p.valor)} · {p.pct}%</div>
    </div>
  );
}

function HitosTable({ hitos }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Hito de comunicación</th>
          <th>Momento</th>
          <th>Canales</th>
          <th className="num">Enviados</th>
          <th className="num">Entregados</th>
          <th className="num">% Apertura</th>
          <th className="num">% Clic</th>
        </tr>
      </thead>
      <tbody>
        {hitos.map((r) => (
          <tr key={r.hito}>
            <td>{r.hito}</td>
            <td>{r.momento}</td>
            <td>{r.canales}</td>
            <td className="num">{n(r.enviados)}</td>
            <td className="num">{n(r.entregados)}</td>
            <td className="num">{r.apertura}%</td>
            <td className="num">{r.clic}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
