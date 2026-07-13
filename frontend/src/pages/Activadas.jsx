import {
  LineChart,
  Line,
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

const MONTH_NUM = { ENE: 1, ABR: 4, JUL: 7, OCT: 10 };

function caducidadLabel(anio, mes) {
  const m = MONTH_NUM[mes];
  if (!anio || !m) return "";
  const lastDay = new Date(Number(anio), m, 0).getDate();
  return `${String(lastDay).padStart(2, "0")}/${String(m).padStart(2, "0")}/${anio}`;
}

// Diverging scale: spend fell (red) → flat (gray) → spend grew (green).
const RANGE_COLOR = {
  "<=-80%": "#b23b3b",
  "-80/-60%": "#d06a5f",
  "-60/-40%": "#e39b8f",
  "-40/-20%": "#f0c3b8",
  "-20/0%": "#c7ccd4",
  "0/+20%": "#bfe0cb",
  "+20/+40%": "#8fcda6",
  "+40/+60%": "#5cb383",
  ">=+60%": "#2f8f5b",
};

export default function Activadas() {
  const { anio, mes } = useFilters();
  const { data, loading, error } = useDatasets(["activacion_evolucion", "gasto_comparativa"], { anio, mes });
  return (
    <Status loading={loading} error={error}>
      {data && (
        <View
          evo={data.activacion_evolucion}
          gasto={data.gasto_comparativa}
          caducidad={caducidadLabel(anio, mes)}
        />
      )}
    </Status>
  );
}

function View({ evo, gasto, caducidad }) {
  const line = evo.map((r) => ({ punto: r.punto, pct: num(r.pct) }));
  const meses = [...new Set(gasto.map((r) => r.mes_rel))];

  return (
    <div className="grid" style={{ gap: "var(--s-lg)" }}>
      <Panel title="Evolución de la activación (%)" right={<Dummy />} note={null}>
        <div style={{ height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={line} margin={{ top: 28, right: 24, left: 8, bottom: 4 }}>
              <CartesianGrid {...grid} vertical={false} />
              <XAxis dataKey="punto" {...axis} />
              <YAxis {...axis} width={44} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<ChartTooltip fmt={(v) => `${v}%`} />} />
              <Line
                type="monotone"
                dataKey="pct"
                name="Activación"
                stroke={VIZ.blue}
                strokeWidth={2.5}
                dot={{ r: 4, fill: VIZ.blue }}
                activeDot={{ r: 6 }}
              >
                <LabelList
                  dataKey="pct"
                  position="top"
                  formatter={(v) => `${v}%`}
                  style={{ fill: VIZ.blue, fontSize: 12, fontWeight: 600 }}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="muted" style={{ fontSize: "0.75rem", margin: "4px 0 0" }}>
          D: fecha caducidad ({caducidad})
        </p>
      </Panel>

      <Panel
        title="Comparativa del gasto vs mes previo a la renovación (# tarjetas por rango de gasto)"
        right={<Dummy />}
      >
        <div
          className="grid"
          style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--s-lg)" }}
        >
          {meses.map((m) => (
            <Histogram key={m} mes={m} rows={gasto.filter((r) => r.mes_rel === m)} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Histogram({ mes, rows }) {
  const bars = rows.map((r) => ({ rango: r.rango, valor: num(r.valor) }));
  const empty = bars.every((b) => b.valor === 0);
  return (
    <div>
      <div className="section-label" style={{ margin: "0 0 var(--s-sm)" }}>
        {mes}
        {mes === "M0" && <span className="muted"> · mes de la renovación</span>}
      </div>
      <div style={{ height: 200 }}>
        {empty ? (
          <div
            className="muted"
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed var(--neutral-border)",
              borderRadius: "var(--r-md)",
              fontSize: "0.85rem",
            }}
          >
            Sin datos para el periodo
          </div>
        ) : (
          <ResponsiveContainer>
            <BarChart data={bars} margin={{ top: 20, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid {...grid} vertical={false} />
              <XAxis dataKey="rango" {...axis} tick={{ fill: "#5b6472", fontSize: 10 }} interval={0} />
              <YAxis {...axis} width={44} tickFormatter={n} />
              <Tooltip cursor={{ fill: "rgba(0,109,255,0.05)" }} content={<ChartTooltip fmt={n} />} />
              <Bar dataKey="valor" name="Tarjetas" radius={[3, 3, 0, 0]}>
                <LabelList dataKey="valor" position="top" formatter={n} style={{ fill: "#5b6472", fontSize: 10 }} />
                {bars.map((b) => (
                  <Cell key={b.rango} fill={RANGE_COLOR[b.rango] || VIZ.blue} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
