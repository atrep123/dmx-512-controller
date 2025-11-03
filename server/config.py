"""Configuration for the DMX demo server."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, PositiveInt, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    app_name: str = Field("dmx-demo", description="Service name used in logs and metrics.")
    host: str = Field("0.0.0.0", description="Host for the HTTP server to bind to.")
    port: PositiveInt = Field(8080, description="HTTP server port.")
    mqtt_host: str = Field("localhost", description="MQTT broker host.")
    mqtt_port: PositiveInt = Field(1883, description="MQTT broker port.")
    mqtt_username: str | None = Field(None, description="MQTT username (optional).")
    mqtt_password: str | None = Field(None, description="MQTT password (optional).")
    mqtt_client_id_prefix: str = Field(
        "dmx-demo",
        description="Prefix for MQTT client identifiers.",
    )
    mqtt_keepalive: PositiveInt = Field(30, description="MQTT keepalive seconds.")
    queue_size: PositiveInt = Field(10_000, description="Max pending mutation commands.")
    cmd_dedupe_ttl_seconds: PositiveInt = Field(
        15 * 60,
        description="Time-to-live for command id dedupe entries.",
    )
    cmd_dedupe_capacity: PositiveInt = Field(4096, description="Max dedupe cache size.")
    metrics_enabled: bool = Field(True, description="Expose /metrics endpoint if True.")
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = Field(
        "INFO",
        description="Log level for the structured logger.",
    )
    persistence_path: Path = Field(
        Path("data/state.json"),
        description="Path where the last known state is stored.",
    )
    dedupe_path: Path = Field(
        Path("data/cmd_seen.json"),
        description="Path for persisted dedupe information.",
    )
    ola_enabled: bool = Field(False, description="Enable OLA DMX output.")
    ola_url: str = Field("http://localhost:9090/set_dmx", description="OLA HTTP endpoint.")
    ola_universe: PositiveInt = Field(1, description="OLA DMX universe to drive.")
    ola_fps: PositiveInt = Field(44, description="Max FPS for OLA updates.")
    allow_origins: list[str] = Field(
        default_factory=lambda: ["*"],
        description="Allowed CORS origins for HTTP and WebSocket clients.",
    )

    model_config = SettingsConfigDict(
        env_prefix="DMX_",
        env_file=".env",
        env_file_encoding="utf-8",
    )

    @field_validator("allow_origins", mode="before")
    def _split_origins(cls, value: list[str] | str) -> list[str]:  # noqa: D401
        """Support comma separated origins in env variables."""

        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached application settings."""

    return Settings()


__all__ = ["Settings", "get_settings"]
