import { useEffect, useState, useCallback } from "react";

const API = "/api";

export async function fetchDataset(name, { anio, mes } = {}) {
  const qs = new URLSearchParams();
  if (anio != null) qs.set("anio", anio);
  if (mes != null) qs.set("mes", mes);
  const suffix = qs.toString() ? `?${qs}` : "";
  const res = await fetch(`${API}/data/${name}${suffix}`);
  if (!res.ok) throw new Error(`No se pudo cargar '${name}' (${res.status})`);
  return res.json();
}

export function downloadUrl(name) {
  return `${API}/download/${name}`;
}
export function downloadAllUrl() {
  return `${API}/download-all`;
}

export async function uploadDataset(name, file) {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${API}/upload/${name}`, { method: "POST", body });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Error al subir '${name}'`);
  }
  return res.json();
}

/* Load one or several datasets at once, scoped to the given anio/mes.
   Returns { data, loading, error, reload }. data is keyed by dataset name. */
export function useDatasets(names, { anio, mes } = {}) {
  const key = `${names.join(",")}|${anio}|${mes}`;
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const reload = useCallback(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.all(names.map((n) => fetchDataset(n, { anio, mes })))
      .then((results) => {
        if (!alive) return;
        const data = {};
        names.forEach((n, i) => (data[n] = results[i]));
        setState({ data, loading: false, error: null });
      })
      .catch((err) => alive && setState({ data: null, loading: false, error: err.message }));
    return () => (alive = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(reload, [reload]);
  return { ...state, reload };
}

/* ---------- Segmento / Tipología client-side filtering ----------
   Applied to any row array carrying `segmento` and/or `tipo` columns
   (desglose.csv today). Filters that don't apply to a dataset are ignored. */
export function applyChips(rows, { segmentos, tipologias }) {
  return rows.filter((r) => {
    if ("segmento" in r && segmentos && !segmentos.has(r.segmento)) return false;
    if ("tipo" in r && tipologias && !tipologias.has(r.tipo)) return false;
    return true;
  });
}

/* ---------- formatters (Spanish locale) ---------- */
const nf = new Intl.NumberFormat("es-ES");

export const n = (v) => (v === "" || v == null ? "" : nf.format(Number(v)));
export const pct = (v) => (v === "" || v == null ? "" : `${Number(v)}%`);
export const num = (v) => Number(v || 0);
