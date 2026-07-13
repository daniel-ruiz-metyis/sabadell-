import { Fragment, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDatasets, fetchDataset, applyChips, n, num } from "../api.js";
import { useFilters } from "../FilterContext.jsx";
import { Panel, Trend, Status } from "../components/ui.jsx";
import { VIZ, axis, grid, ChartTooltip } from "../components/chartkit.jsx";

const STAGES = [
  { key: "enviadas", label: "Enviadas a Estampar", kind: "count" },
  { key: "estampadas", label: "Estampadas. Envío a clientes", kind: "count" },
  { key: "activadas", label: "Tarjetas activadas", kind: "pct", tone: "accent" },
  { key: "bloqueadas", label: "Tarjetas bloqueadas", kind: "pct", tone: "alert" },
  { key: "pendientes", label: "Pendientes de entrega", kind: "pct" },
  { key: "otros", label: "Otros Motivos", kind: "pct" },
];
const WATERFALL = ["enviadas", "estampadas", "activadas", "bloqueadas", "pendientes", "otros"];
const SHORT = {
  enviadas: "Enviadas",
  estampadas: "Estampadas",
  activadas: "Activadas",
  bloqueadas: "Bloqueadas",
  pendientes: "Pendientes",
  otros: "Otros motivos",
};
const OBJETIVOS = { activadas: 78, bloqueadas: 18, pendientes: 2, otros: 2 };

export default function Renovacion() {
  const { anio, mes, chips, combos } = useFilters();
  const { data, loading, error } = useDatasets(["desglose", "funnel_meta"], { anio, mes });
  const [prevDesglose, setPrevDesglose] = useState(null);

  useEffect(() => {
    if (!combos || !anio || !mes) return;
    const idx = combos.findIndex((c) => c.anio === anio && c.mes === mes);
    const prev = idx > 0 ? combos[idx - 1] : null;
    if (!prev) {
      setPrevDesglose(null);
      return;
    }
    let alive = true;
    fetchDataset("desglose", { anio: prev.anio, mes: prev.mes }).then((rows) => alive && setPrevDesglose(rows));
    return () => (alive = false);
  }, [combos, anio, mes]);

  return (
    <Status loading={loading} error={error}>
      {data && (
        <View
          desgloseAll={data.desglose}
          desglose={applyChips(data.desglose, chips)}
          prevDesglose={prevDesglose ? applyChips(prevDesglose, chips) : null}
          meta={data.funnel_meta[0]}
        />
      )}
    </Status>
  );
}

function aggregate(rows) {
  const sum = (c) => rows.reduce((a, r) => a + num(r[c]), 0);
  const enviadas = sum("enviadas");
  const activadas = sum("activadas");
  const bloqueadas = sum("bloqueadas");
  const pendientes = sum("pendientes");
  const otros = sum("otros");
  return { enviadas, activadas, bloqueadas, pendientes, otros };
}

function View({ desgloseAll, desglose, prevDesglose, meta }) {
  const cur = aggregate(desglose);
  const prev = prevDesglose ? aggregate(prevDesglose) : null;

  const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0);
  const stageValue = {
    enviadas: cur.enviadas,
    estampadas: cur.enviadas,
    activadas: pct(cur.activadas, cur.enviadas),
    bloqueadas: pct(cur.bloqueadas, cur.enviadas),
    pendientes: pct(cur.pendientes, cur.enviadas),
    otros: pct(cur.otros, cur.enviadas),
  };
  const prevStageValue = prev && {
    enviadas: prev.enviadas,
    estampadas: prev.enviadas,
    activadas: pct(prev.activadas, prev.enviadas),
    bloqueadas: pct(prev.bloqueadas, prev.enviadas),
    pendientes: pct(prev.pendientes, prev.enviadas),
    otros: pct(prev.otros, prev.enviadas),
  };
  const momDir = (key) =>
    prevStageValue ? (stageValue[key] >= prevStageValue[key] ? "up" : "down") : null;

  const wf = WATERFALL.map((k) => {
    const rows = desglose;
    const credito = rows.filter((r) => r.tipo === "CREDITO").reduce((a, r) => a + num(r[k]), 0);
    const debito = rows.filter((r) => r.tipo === "DEBITO").reduce((a, r) => a + num(r[k]), 0);
    const otrosT = rows.filter((r) => r.tipo === "OTROS").reduce((a, r) => a + num(r[k]), 0);
    return { stage: SHORT[k], credito, debito, otros: otrosT };
  });

  return (
    <div className="grid" style={{ gap: "var(--s-lg)" }}>
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(9, minmax(0, 1fr))", gap: "var(--s-md)" }}
      >
        <FunnelKpi label="Total tarjetas" figure={n(meta.total_tarjetas)} />
        <FunnelKpi
          label="Exclusiones inactividad"
          figure={`${meta.exclusiones_pct}%`}
          dir="up"
        />
        <FunnelKpi label="Cambios de dirección" figure={`${meta.cambios_pct}%`} dir="down" />
        {STAGES.map((s) => (
          <FunnelKpi
            key={s.key}
            label={s.label}
            figure={
              s.kind === "pct" ? `${stageValue[s.key]}%` : n(stageValue[s.key])
            }
            tone={s.tone}
            dir={momDir(s.key)}
            objetivo={OBJETIVOS[s.key]}
          />
        ))}
      </div>

      <Panel title="Funnel del proceso de renovación (# tarjetas)" right={<Legend />}>
        <div style={{ height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={wf} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid {...grid} vertical={false} />
              <XAxis dataKey="stage" {...axis} />
              <YAxis {...axis} width={56} tickFormatter={n} />
              <Tooltip cursor={{ fill: "rgba(0,109,255,0.06)" }} content={<ChartTooltip fmt={n} />} />
              <Bar dataKey="credito" name="Crédito" stackId="a" fill={VIZ.credito} />
              <Bar dataKey="debito" name="Débito" stackId="a" fill={VIZ.debito} />
              <Bar dataKey="otros" name="Otros" stackId="a" fill={VIZ.otros} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Tabla desglose de tarjetas" note="filtrada por segmento / tipología">
        <DesgloseTable rows={desglose} />
      </Panel>
    </div>
  );
}

function FunnelKpi({ label, figure, tone, dir, objetivo }) {
  return (
    <div className="kpi" style={{ minHeight: 132 }}>
      <div className="kpi-label">{label}</div>
      <div className={`kpi-figure ${tone || ""}`} style={{ fontSize: "1.7rem" }}>
        {figure}
      </div>
      <div className="kpi-foot" style={{ flexDirection: "column", alignItems: "flex-start", gap: 3 }}>
        {dir && <Trend dir={dir} />}
        {objetivo != null && <span className="muted">Objetivo {objetivo}%</span>}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="legend-inline">
      <Sw c={VIZ.debito} /> Débito <Sw c={VIZ.credito} /> Crédito <Sw c={VIZ.otros} /> Otros
    </div>
  );
}
function Sw({ c }) {
  return (
    <span className="legend-swatch" style={{ background: c, marginRight: 2, marginLeft: 8 }} />
  );
}

const COLS = ["enviadas", "activadas", "bloqueadas", "pendientes", "otros"];
const COL_LABEL = {
  enviadas: "Enviadas a clientes",
  activadas: "Activadas",
  bloqueadas: "Bloqueadas",
  pendientes: "Pendientes de entrega",
  otros: "Otros motivos",
};

function DesgloseTable({ rows }) {
  if (rows.length === 0) {
    return <p className="muted">No hay tarjetas para la combinación de filtros seleccionada.</p>;
  }
  const segments = [...new Set(rows.map((r) => r.segmento))];
  const sum = (rs, c) => rs.reduce((a, r) => a + num(r[c]), 0);
  const grand = Object.fromEntries(COLS.map((c) => [c, sum(rows, c)]));

  return (
    <table>
      <thead>
        <tr>
          <th>Segmento / Tipología</th>
          {COLS.map((c) => (
            <th key={c} className="num">{COL_LABEL[c]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {segments.map((seg) => {
          const segRows = rows.filter((r) => r.segmento === seg);
          return (
            <Fragment key={seg}>
              <tr className="group">
                <td>{seg}</td>
                {COLS.map((c) => (
                  <td key={c} className="num">{n(sum(segRows, c))}</td>
                ))}
              </tr>
              {segRows.map((r, i) => (
                <tr key={`${seg}-${r.tipo}-${i}`}>
                  <td className="indent">{r.tipo}</td>
                  {COLS.map((c) => (
                    <td key={c} className="num">{n(r[c])}</td>
                  ))}
                </tr>
              ))}
            </Fragment>
          );
        })}
        <tr className="total">
          <td>TOTAL</td>
          {COLS.map((c) => (
            <td key={c} className="num">{n(grand[c])}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
