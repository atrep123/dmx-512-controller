"""Standalone entry point for packaged desktop builds."""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

import uvicorn


def _bundle_root() -> Path:
    if getattr(sys, "frozen", False):
        return Path(sys._MEIPASS)  # type: ignore[attr-defined]
    return Path(__file__).resolve().parent


def hydrate_env() -> None:
    root = _bundle_root()
    os.environ.setdefault("DMX_CONFIG_DIR", str(root / "config"))
    os.environ.setdefault("DMX_SCHEMA_PATH", str(root / "schemas"))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the DMX backend (desktop bundle).")
    parser.add_argument(
        "--host",
        default=os.getenv("DMX_HOST", "127.0.0.1"),
        help="Bind host (default: 127.0.0.1 or DMX_HOST env).",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("DMX_PORT", "8080")),
        help="Bind port (default: 8080 or DMX_PORT env).",
    )
    parser.add_argument(
        "--log-level",
        default=os.getenv("DMX_LOG_LEVEL", "info"),
        help="Uvicorn log level (default: info).",
    )
    return parser.parse_args()


def main() -> None:
    hydrate_env()
    args = parse_args()
    uvicorn.run(
        "server.app:app",
        host=args.host,
        port=args.port,
        log_level=args.log_level.lower(),
    )


if __name__ == "__main__":
    main()
