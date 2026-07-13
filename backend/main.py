"""
Banco Sabadell Operations Dashboard - MVP backend.

Deliberately simple: every dataset is a CSV file in ./data. The API reads those
CSVs and returns them as JSON. Datasets can be downloaded (to edit in Excel) and
re-uploaded to change what the dashboard shows. No database, no ORM.

On Vercel the deployment bundle is read-only, so uploads write to a separate
writable overlay directory (OS temp dir) instead of DATA_DIR. Reads check the
overlay first, falling back to the bundled CSV. Locally (no VERCEL env var)
the overlay and DATA_DIR are the same folder, so uploads persist normally.
"""

import csv
import io
import os
import tempfile
import zipfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse

DATA_DIR = Path(__file__).parent / "data"

if os.environ.get("VERCEL"):
    WRITABLE_DIR = Path(tempfile.gettempdir()) / "sabadell-dashboard-data"
    WRITABLE_DIR.mkdir(parents=True, exist_ok=True)
else:
    WRITABLE_DIR = DATA_DIR

app = FastAPI(title="Banco Sabadell Operations Dashboard API")

# Dev convenience: the React dev server runs on a different port.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _validate_name(name: str) -> str:
    if not name.replace("_", "").isalnum():
        raise HTTPException(status_code=400, detail="Invalid dataset name")
    return name


def _read_path(name: str) -> Path:
    """Overlay (previously uploaded) copy if present, else the bundled CSV."""
    _validate_name(name)
    overlay = WRITABLE_DIR / f"{name}.csv"
    if overlay.exists():
        return overlay
    return DATA_DIR / f"{name}.csv"


def _write_path(name: str) -> Path:
    _validate_name(name)
    return WRITABLE_DIR / f"{name}.csv"


def _read_csv(path: Path) -> list[dict]:
    with path.open(newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


@app.get("/api/datasets")
def list_datasets() -> list[str]:
    names = {p.stem for p in DATA_DIR.glob("*.csv")}
    names |= {p.stem for p in WRITABLE_DIR.glob("*.csv")}
    return sorted(names)


@app.get("/api/data/{name}")
def get_dataset(name: str, anio: Optional[str] = None, mes: Optional[str] = None):
    path = _read_path(name)
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
    path = _read_path(name)
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found")
    return Response(
        content=path.read_bytes(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{name}.csv"'},
    )


@app.get("/api/download-all")
def download_all():
    names = {p.stem for p in DATA_DIR.glob("*.csv")}
    names |= {p.stem for p in WRITABLE_DIR.glob("*.csv")}
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for name in sorted(names):
            zf.write(_read_path(name), arcname=f"{name}.csv")
    return Response(
        content=buffer.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": 'attachment; filename="sabadell-dashboard-data.zip"'},
    )


@app.post("/api/upload/{name}")
async def upload_dataset(name: str, file: UploadFile = File(...)):
    path = _write_path(name)
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
    return {
        "status": "ok",
        "datasets": len(list(DATA_DIR.glob("*.csv"))),
        "writable_overlay": str(WRITABLE_DIR) if WRITABLE_DIR != DATA_DIR else None,
    }
