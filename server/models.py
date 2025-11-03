"""Pydantic models and schema helpers."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, PositiveInt, field_validator

from .util.ulid import is_valid_ulid

CMD_SCHEMA = "demo.rgb.cmd.v1"
STATE_SCHEMA = "demo.rgb.state.v1"


class RGBCommand(BaseModel):
    """Incoming mutation command."""

    model_config = ConfigDict(extra="forbid")

    schema: Literal[CMD_SCHEMA] = Field(CMD_SCHEMA)
    cmdId: str = Field(..., description="Unique command identifier (ULID).")
    src: str = Field(..., description="Source identifier of the command.")
    r: int = Field(..., ge=0, le=255)
    g: int = Field(..., ge=0, le=255)
    b: int = Field(..., ge=0, le=255)
    ts: PositiveInt | None = Field(None, description="Client supplied timestamp in ms.")

    @field_validator("cmdId")
    def _validate_cmd_id(cls, value: str) -> str:
        if not is_valid_ulid(value):
            raise ValueError("cmdId must be a ULID")
        return value


class RGBState(BaseModel):
    """Canonical RGB state."""

    model_config = ConfigDict(extra="forbid")

    schema: Literal[STATE_SCHEMA] = Field(STATE_SCHEMA)
    r: int = Field(..., ge=0, le=255)
    g: int = Field(..., ge=0, le=255)
    b: int = Field(..., ge=0, le=255)
    seq: int = Field(..., ge=0)
    updatedBy: str
    ts: PositiveInt


class WSSetMessage(BaseModel):
    """WebSocket mutation request."""

    model_config = ConfigDict(extra="forbid")

    type: Literal["set"]
    cmdId: str
    src: str
    r: int
    g: int
    b: int

    @field_validator("cmdId")
    def _validate_cmd(cls, value: str) -> str:
        if not is_valid_ulid(value):
            raise ValueError("cmdId must be a ULID")
        return value


class WSStateMessage(BaseModel):
    """WebSocket state broadcast."""

    model_config = ConfigDict(extra="forbid")

    type: Literal["state"] = "state"
    r: int
    g: int
    b: int
    seq: int
    ts: PositiveInt

class RESTCommand(BaseModel):
    """REST payload that omits schema attribute."""

    model_config = ConfigDict(extra="forbid")

    cmdId: str
    src: str
    r: int
    g: int
    b: int
    ts: PositiveInt | None = None

    @field_validator("cmdId")
    def _validate_cmd_id(cls, value: str) -> str:
        if not is_valid_ulid(value):
            raise ValueError("cmdId must be a ULID")
        return value


__all__ = [
    "RGBCommand",
    "RGBState",
    "WSSetMessage",
    "WSStateMessage",
    "RESTCommand",
    "CMD_SCHEMA",
    "STATE_SCHEMA",
]
