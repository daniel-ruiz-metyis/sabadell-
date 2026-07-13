import { useRef, useState } from "react";
import { downloadAllUrl, uploadDataset } from "../api.js";
import { IconDownload, IconUpload } from "./icons.jsx";

/*
  Download every dataset as a zip of CSVs, edit them in Excel, then upload one
  back to change what the dashboard shows. The uploaded filename (minus .csv)
  must match the dataset name, e.g. "funnel.csv".
*/
export function DataControls({ onReload }) {
  const fileRef = useRef(null);
  const [msg, setMsg] = useState(null);

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const name = file.name.replace(/\.csv$/i, "");
    try {
      const res = await uploadDataset(name, file);
      setMsg({ ok: true, text: `${name}.csv actualizado (${res.rows} filas)` });
      onReload?.();
    } catch (err) {
      setMsg({ ok: false, text: err.message });
    }
    setTimeout(() => setMsg(null), 4000);
  }

  return (
    <div className="filter-group">
      <span className="filter-label">Datos (CSV)</span>
      <div className="data-controls">
        <a className="btn" href={downloadAllUrl()}>
          <IconDownload className="btn-ic" />
          Descargar
        </a>
        <button className="btn btn-primary" onClick={() => fileRef.current?.click()}>
          <IconUpload className="btn-ic" />
          Subir
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={onFile}
          style={{ display: "none" }}
        />
        {msg && (
          <span
            className="num"
            style={{
              fontSize: "0.75rem",
              color: msg.ok ? "var(--status-positive)" : "var(--status-negative)",
            }}
          >
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
