"""
Banco Sabadell Operations Dashboard - MVP backend.

Deliberately simple: every dataset is a CSV file in ./data. The API reads those
CSVs and returns them as JSON. Datasets can be downloaded (to edit in Excel) and
re-uploaded to change what the dashboard shows. No database, no ORM.
"""

import csv
import io
import zipfile
from pathlib import Path

from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse

DATA_DIR = Path(__file__).parent / "data"

app = FastAPI(title="Banco Sabadell Operations Dashboard API")

# Dev convenience: the React dev server runs on a different port.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _dataset_path(name: str) -> Path:
    """Resolve a dataset name to a CSV path, refusing anything outside DATA_DIR."""
    if not name.replace("_", "").isalnum():
        raise HTTPException(status_code=400, detail="Invalid dataset name")
    path = (DATA_DIR / f"{name}.csv").resolve()
    if DATA_DIR.resolve() not in path.parents:
        raise HTTPException(status_code=400, detail="Invalid dataset name")
    return path


def _read_csv(path: Path) -> list[dict]:
    with path.open(newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


@app.get("/api/datasets")
def list_datasets() -> list[str]:
    return sorted(p.stem for p in DATA_DIR.glob("*.csv"))


@app.get("/api/data/{name}")
def get_dataset(name: str, anio: Optional[str] = None, mes: Optional[str] = None):
    path = _dataset_path(name)
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found")
    rows = _read_csv(path)
    # Only filter datasets that actually carry an anio/mes dimension; datasets
    # without those columns (e.g. combos.csv itself) are returned unfiltered.
    if rows and "anio" in rows[0]:
        if anio is not None:
            rows = [r for r in rows if r["anio"] == anio]
        if mes is not None:
            rows = [r for r in rows if r["mes"] == mes]
    return JSONResponse(rows)


@app.get("/api/download/{name}")
def download_dataset(name: str):
    path = _dataset_path(name)
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found")
    return Response(
        content=path.read_bytes(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{name}.csv"'},
    )


@app.get("/api/download-all")
def download_all():
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(DATA_DIR.glob("*.csv")):
            zf.write(path, arcname=path.name)
    return Response(
        content=buffer.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": 'attachment; filename="sabadell-dashboard-data.zip"'},
    )


@app.post("/api/upload/{name}")
async def upload_dataset(name: str, file: UploadFile = File(...)):
    path = _dataset_path(name)
    raw = await file.read()
    text = raw.decode("utf-8-sig")
    # Validate it parses as CSV before overwriting the live dataset.
    try:
        rows = list(csv.DictReader(io.StringIO(text)))
    except csv.Error as exc:
        raise HTTPException(status_code=400, detail=f"Not a valid CSV: {exc}")
    if not rows:
        raise HTTPException(status_code=400, detail="CSV has no data rows")
    path.write_text(text, encoding="utf-8")
    return {"dataset": name, "rows": len(rows), "status": "updated"}


@app.get("/api/health")
def health():
    return {"status": "ok", "datasets": len(list(DATA_DIR.glob("*.csv")))}
