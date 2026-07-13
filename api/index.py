"""
Vercel entrypoint: re-exports the FastAPI app from backend/main.py as the
ASGI callable Vercel's Python runtime serves. Kept as a thin shim so the
same backend code runs locally (uvicorn) and on Vercel (serverless).
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from main import app  # noqa: E402
