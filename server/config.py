"""Configuration for the DMX demo server."""

from __future__ import annotations

from pathlib import Path
from typing import Optional, Literal
import os

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
    # Optional test/DEV override for dedupe TTL (seconds). Read from env DEDUPE_TTL_SEC if defined.
    dedupe_ttl_override_sec: Optional[int] = Field(None, json_schema_extra={"env": "DEDUPE_TTL_SEC"})
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
    # New feature-flagged OLA output pipeline
    output_mode: Literal["null", "ola", "enttec"] = Field(
        "null", description="Output mode selector (null, ola, enttec).", json_schema_extra={"env": "OUTPUT_MODE"}
    )
    patch_file: Path = Field(
        Path("config/patch.yaml"), description="Optional universe patch mapping file.", json_schema_extra={"env": "PATCH_FILE"}
    )
    fades_enabled: bool = Field(False, description="Enable server-side DMX fades.", json_schema_extra={"env": "FADES_ENABLED"})
    # sACN (E1.31) input configuration
    sacn_enabled: bool = Field(False, description="Enable sACN (E1.31) receiver.", json_schema_extra={"env": "SACN_ENABLED"})
    sacn_bind_addr: str = Field("0.0.0.0", description="Bind address for sACN UDP.", json_schema_extra={"env": "SACN_BIND_ADDR"})
    sacn_port: PositiveInt = Field(5568, description="sACN UDP port.", json_schema_extra={"env": "SACN_PORT"})
    sacn_join_multicast: bool = Field(False, description="Join multicast groups for universes.", json_schema_extra={"env": "SACN_JOIN_MULTICAST"})
    sacn_universes: str = Field("0", description="CSV or ranges (e.g. 0,1,10-12) of universes to accept.", json_schema_extra={"env": "SACN_UNIVERSES"})
    sacn_source_timeout_ms: PositiveInt = Field(3000, description="TTL for sACN sources (ms).", json_schema_extra={"env": "SACN_SOURCE_TIMEOUT_MS"})
    local_priority: PositiveInt = Field(255, description="Local layer priority (relative to sACN 0-200).", json_schema_extra={"env": "LOCAL_PRIORITY"})
    # Fixtures/profiles layer
    fixtures_enabled: bool = Field(False, description="Enable fixture profiles and mapping.", json_schema_extra={"env": "FIXTURES_ENABLED"})
    fixture_profiles_dir: Path = Field(Path("config/fixtures"), description="Directory with fixture profiles (YAML/JSON).", json_schema_extra={"env": "FIXTURE_PROFILES_DIR"})
    fixture_patch_file: Path = Field(Path("config/patch.yaml"), description="Fixture patch file with instances.", json_schema_extra={"env": "FIXTURE_PATCH_FILE"})
    attr_default_merge: str = Field("LTP", description="Default merge policy for unknown attrs (LTP|HTP).", json_schema_extra={"env": "ATTR_DEFAULT_MERGE"})
    allow_origins: list[str] = Field(
        default_factory=lambda: ["*"],
        description="Allowed CORS origins for HTTP and WebSocket clients.",
    )
    projects_enabled: bool = Field(False, description="Enable multi-project storage.", json_schema_extra={"env": "PROJECTS_ENABLED"})
    projects_root: Path = Field(Path("data/projects"), description="Root directory for project data.", json_schema_extra={"env": "PROJECTS_ROOT"})
    cloud_backup_enabled: bool = Field(False, description="Enable project cloud backups.", json_schema_extra={"env": "CLOUD_BACKUP_ENABLED"})
    cloud_backup_provider: Literal["local", "s3"] = Field(
        "local",
        description="Backup provider (local filesystem or S3).",
        json_schema_extra={"env": "CLOUD_BACKUP_PROVIDER"},
    )
    cloud_backup_local_path: Path = Field(
        Path("data/backups"),
        description="Local backup directory (for provider=local).",
        json_schema_extra={"env": "CLOUD_BACKUP_LOCAL_PATH"},
    )
    cloud_backup_encryption_key: str | None = Field(
        None,
        description="Optional Fernet key for encrypting backups.",
        json_schema_extra={"env": "CLOUD_BACKUP_ENCRYPTION_KEY"},
    )
    cloud_backup_auto_interval_minutes: int = Field(
        0,
        ge=0,
        description="Auto-backup interval in minutes (0 disables scheduler).",
        json_schema_extra={"env": "CLOUD_BACKUP_AUTO_INTERVAL"},
    )
    cloud_backup_s3_bucket: str | None = Field(None, description="S3 bucket name.", json_schema_extra={"env": "CLOUD_BACKUP_S3_BUCKET"})
    cloud_backup_s3_prefix: str = Field(
        "dmx-controller/backups",
        description="S3 key prefix for backups.",
        json_schema_extra={"env": "CLOUD_BACKUP_S3_PREFIX"},
    )
    cloud_backup_s3_region: str | None = Field(None, description="S3 region.", json_schema_extra={"env": "CLOUD_BACKUP_S3_REGION"})
    cloud_backup_s3_access_key: str | None = Field(None, description="S3 access key.", json_schema_extra={"env": "CLOUD_BACKUP_S3_ACCESS_KEY"})
    cloud_backup_s3_secret_key: str | None = Field(None, description="S3 secret key.", json_schema_extra={"env": "CLOUD_BACKUP_S3_SECRET_KEY"})
    cloud_backup_s3_session_token: str | None = Field(None, description="S3 session token.", json_schema_extra={"env": "CLOUD_BACKUP_S3_SESSION_TOKEN"})
    dmx_input_enabled: bool = Field(False, description="Enable SparkFun DMX serial input.", json_schema_extra={"env": "DMX_INPUT_ENABLED"})
    dmx_input_port: str | None = Field(None, description="Serial port for DMX input (e.g. COM5, /dev/ttyUSB0).", json_schema_extra={"env": "DMX_INPUT_PORT"})
    dmx_input_baudrate: PositiveInt = Field(115200, description="Baudrate for DMX input serial.", json_schema_extra={"env": "DMX_INPUT_BAUDRATE"})
    dmx_input_universe: int = Field(0, ge=0, description="Universe index to inject DMX input into.", json_schema_extra={"env": "DMX_INPUT_UNIVERSE"})
    dmx_input_src: str = Field("dmx-input", description="Source label for DMX input commands.", json_schema_extra={"env": "DMX_INPUT_SRC"})
    dmx_input_channel_count: PositiveInt = Field(3, description="Number of channels to track (maps ch1->R, ch2->G, ch3->B).", json_schema_extra={"env": "DMX_INPUT_CHANNELS"})
    usb_enabled: bool = Field(False, description="Enable USB DMX output (Enttec).", json_schema_extra={"env": "USB_ENABLED"})
    usb_port: str | None = Field(None, description="Explicit serial port for Enttec DMX USB PRO.", json_schema_extra={"env": "USB_PORT"})
    usb_vendor_ids: list[int] = Field(
        default_factory=lambda: [0x0403],
        description="Comma-separated vendor IDs (hex) for USB auto-detect.",
        json_schema_extra={"env": "USB_VENDOR_IDS"},
    )
    usb_product_ids: list[int] = Field(
        default_factory=lambda: [0x6001, 0x6010, 0x0400],
        description="Comma-separated product IDs (hex) for USB auto-detect.",
        json_schema_extra={"env": "USB_PRODUCT_IDS"},
    )
    usb_scan_interval_sec: PositiveInt = Field(
        5,
        description="Polling interval for USB auto-detection (seconds).",
        json_schema_extra={"env": "USB_SCAN_INTERVAL"},
    )
    usb_baudrate: PositiveInt = Field(57600, description="Enttec DMX USB PRO baudrate.", json_schema_extra={"env": "USB_BAUDRATE"})
    usb_fps: PositiveInt = Field(40, description="USB DMX max frames per second.", json_schema_extra={"env": "USB_FPS"})

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

    @field_validator("usb_vendor_ids", "usb_product_ids", mode="before")
    def _parse_hex(cls, value: list[int] | str) -> list[int]:
        if isinstance(value, str):
            items: list[int] = []
            for part in value.split(","):
                part = part.strip()
                if not part:
                    continue
                if part.lower().startswith("0x"):
                    part = part[2:]
                try:
                    items.append(int(part, 16))
                except Exception:
                    continue
            return items
        return value


_SETTINGS_CACHE: Settings | None = None


def _sync_env_aliases() -> None:
    """Allow tests/env to provide either bare or DMX_-prefixed variables."""
    for field in Settings.model_fields.values():
        extra = getattr(field, "json_schema_extra", None)
        if not isinstance(extra, dict):
            continue
        env_name = extra.get("env")
        if not env_name:
            continue
        env_name = str(env_name)
        plain = os.environ.get(env_name)
        prefixed = f"DMX_{env_name}"
        if plain is not None and prefixed not in os.environ:
            os.environ[prefixed] = plain


def get_settings(force_reload: bool = False) -> Settings:
    """Return application settings, optionally forcing a refresh from env."""
    global _SETTINGS_CACHE
    if force_reload or _SETTINGS_CACHE is None:
        _sync_env_aliases()
        s = Settings()
        # Apply optional dedupe TTL override if provided via env (for tests/CI)
        try:
            if s.dedupe_ttl_override_sec is not None and s.dedupe_ttl_override_sec > 0:
                object.__setattr__(s, "cmd_dedupe_ttl_seconds", s.dedupe_ttl_override_sec)  # type: ignore[attr-defined]
        except Exception:
            # Ignore override errors; fallback to default
            pass
        _SETTINGS_CACHE = s
    return _SETTINGS_CACHE


def reset_settings_cache() -> None:
    """Clear the cached settings (useful for tests changing env)."""
    global _SETTINGS_CACHE
    _SETTINGS_CACHE = None


__all__ = ["Settings", "get_settings", "reset_settings_cache"]
