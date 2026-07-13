import { useFilters } from "../FilterContext.jsx";
import { DataControls } from "./DataControls.jsx";

/*
  Año / Mes drive real server-side filtering (see FilterContext + api.js).
  Segmento / Tipología drive client-side row filtering on datasets that carry
  those dimensions (desglose.csv). All four are genuinely interactive.
*/
export function FilterBar({ onReload }) {
  const {
    ready,
    years,
    monthsForYear,
    anio,
    mes,
    fechaConsulta,
    selectAnio,
    selectMes,
    segmento,
    tipologia,
    toggleSegmento,
    toggleTipologia,
  } = useFilters();

  if (!ready) {
    return <div className="filterbar muted">Cargando filtros…</div>;
  }

  return (
    <div className="filterbar">
      <SelectGroup label="Año caducidad" options={years} value={anio} onSelect={selectAnio} />
      <SelectGroup label="Mes caducidad" options={monthsForYear} value={mes} onSelect={selectMes} />
      <ReadOnly label="Fecha de consulta" value={fechaConsulta} />

      <ToggleGroup label="Segmento tarjeta" state={segmento} onToggle={toggleSegmento} />
      <ToggleGroup label="Tipología tarjeta" state={tipologia} onToggle={toggleTipologia} />

      <div className="filter-spacer" />
      <DataControls onReload={onReload} />
    </div>
  );
}

function ReadOnly({ label, value }) {
  return (
    <div className="filter-group">
      <span className="filter-label">{label}</span>
      <div className="filter-row">
        <span className="chip readonly">{value}</span>
      </div>
    </div>
  );
}

function SelectGroup({ label, options, value, onSelect }) {
  return (
    <div className="filter-group">
      <span className="filter-label">{label}</span>
      <div className="filter-row">
        {options.map((opt) => (
          <button
            key={opt}
            className={`chip ${opt === value ? "on" : ""}`}
            aria-pressed={opt === value}
            onClick={() => onSelect(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleGroup({ label, state, onToggle }) {
  return (
    <div className="filter-group">
      <span className="filter-label">{label}</span>
      <div className="filter-row">
        {Object.entries(state).map(([k, on]) => (
          <button
            key={k}
            className={`chip ${on ? "on" : ""}`}
            aria-pressed={on}
            onClick={() => onToggle(k)}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
