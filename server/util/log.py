"""Structured logging utilities."""

from __future__ import annotations

import json
import logging
import sys
import time
from typing import Any

from ..config import get_settings


class JsonLogFormatter(logging.Formatter):
    """Render log records as JSON for easy ingestion."""

    def format(self, record: logging.LogRecord) -> str:  # noqa: D401
        data: dict[str, Any] = {
            "ts": int(time.time() * 1000),
            "level": record.levelname,
            "msg": record.getMessage(),
            "logger": record.name,
        }
        if record.exc_info:
            data["exc_info"] = self.formatException(record.exc_info)
        if record.stack_info:
            data["stack"] = self.formatStack(record.stack_info)
        if record.args and isinstance(record.args, dict):
            data.update(record.args)
        for key in ("cmdId", "seq", "src", "latency_ms"):
            value = getattr(record, key, None)
            if value is not None:
                data[key] = value
        return json.dumps(data, separators=(",", ":"))


def configure_logging() -> None:
    """Configure root logger for the application."""

    settings = get_settings()
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonLogFormatter())
    logging.basicConfig(level=settings.log_level, handlers=[handler], force=True)


__all__ = ["configure_logging", "JsonLogFormatter"]
