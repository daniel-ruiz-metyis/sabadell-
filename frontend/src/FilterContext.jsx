import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchDataset } from "./api.js";

const FilterCtx = createContext(null);

const SEGMENTO_TO_CSV = { Particulares: "PARTICULARES", Empresas: "EMPRESAS" };
const TIPOLOGIA_TO_CSV = { Credito: "CREDITO", Debito: "DEBITO", Otros: "OTROS" };

/*
  Global filter state: anio/mes (drive server-side query params, real data
  changes per combo) and segmento/tipología (drive client-side row filtering
  on datasets that carry those dimensions — see applyChips in api.js).
*/
export function FilterProvider({ children }) {
  const [combos, setCombos] = useState(null);
  const [anio, setAnio] = useState(null);
  const [mes, setMes] = useState(null);
  const [segmento, setSegmento] = useState({ Particulares: true, Empresas: true });
  const [tipologia, setTipologia] = useState({ Credito: true, Debito: true, Otros: true });

  function reloadCombos() {
    fetchDataset("combos").then((rows) => {
      setCombos(rows);
      const stillValid = rows.some((c) => c.anio === anio && c.mes === mes);
      if (!stillValid) {
        const last = rows[rows.length - 1];
        if (last) {
          setAnio(last.anio);
          setMes(last.mes);
        }
      }
    });
  }

  useEffect(reloadCombos, []);

  const years = useMemo(
    () => (combos ? [...new Set(combos.map((c) => c.anio))] : []),
    [combos]
  );
  const monthsForYear = useMemo(
    () => (combos ? combos.filter((c) => c.anio === anio).map((c) => c.mes) : []),
    [combos, anio]
  );
  const current = useMemo(
    () => (combos ? combos.find((c) => c.anio === anio && c.mes === mes) : null),
    [combos, anio, mes]
  );

  function selectAnio(a) {
    setAnio(a);
    const stillValid = combos.some((c) => c.anio === a && c.mes === mes);
    if (!stillValid) {
      const first = combos.find((c) => c.anio === a);
      if (first) setMes(first.mes);
    }
  }

  const toggle = (setter) => (k) => setter((s) => ({ ...s, [k]: !s[k] }));

  const segmentosCsv = useMemo(
    () => new Set(Object.entries(segmento).filter(([, v]) => v).map(([k]) => SEGMENTO_TO_CSV[k])),
    [segmento]
  );
  const tipologiasCsv = useMemo(
    () => new Set(Object.entries(tipologia).filter(([, v]) => v).map(([k]) => TIPOLOGIA_TO_CSV[k])),
    [tipologia]
  );

  const ready = combos !== null && anio !== null && mes !== null;

  const value = {
    ready,
    reloadCombos,
    combos,
    years,
    monthsForYear,
    anio,
    mes,
    fechaConsulta: current?.fecha_consulta,
    selectAnio,
    selectMes: setMes,
    segmento,
    tipologia,
    toggleSegmento: toggle(setSegmento),
    toggleTipologia: toggle(setTipologia),
    chips: { segmentos: segmentosCsv, tipologias: tipologiasCsv },
  };

  return <FilterCtx.Provider value={value}>{children}</FilterCtx.Provider>;
}

export function useFilters() {
  const ctx = useContext(FilterCtx);
  if (!ctx) throw new Error("useFilters must be used within FilterProvider");
  return ctx;
}
