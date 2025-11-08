"""Pydantic models and schema helpers."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, PositiveInt, field_validator

from .util.ulid import is_valid_ulid

CMD_SCHEMA = "demo.rgb.cmd.v1"
STATE_SCHEMA = "demo.rgb.state.v1"


class RGBCommand(BaseModel):
    """Incoming mutation command."""

    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    schema_: Literal[CMD_SCHEMA] = Field(
        CMD_SCHEMA,
        alias="schema",
        serialization_alias="schema",
    )
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

    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    schema_: Literal[STATE_SCHEMA] = Field(
        STATE_SCHEMA,
        alias="schema",
        serialization_alias="schema",
    )
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


class SceneModel(BaseModel):
    """Scene payload mirrored from frontend."""

    id: str
    name: str
    channelValues: dict[str, int]
    timestamp: PositiveInt
    description: str | None = None
    tags: list[str] | None = None
    favorite: bool | None = None

    @field_validator("name")
    def _validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("name must not be empty")
        return value


class ProjectMetaModel(BaseModel):
    id: str
    name: str
    venue: str | None = None
    eventDate: str | None = None
    notes: str | None = None
    createdAt: PositiveInt
    updatedAt: PositiveInt
    lastBackupAt: PositiveInt | None = None


class ProjectsResponse(BaseModel):
    activeId: str
    projects: list[ProjectMetaModel]


class ProjectCreateModel(BaseModel):
    name: str
    venue: str | None = None
    eventDate: str | None = None
    notes: str | None = None
    templateId: str | None = None


class ProjectUpdateModel(BaseModel):
    name: str | None = None
    venue: str | None = None
    eventDate: str | None = None
    notes: str | None = None


class BackupVersionModel(BaseModel):
    versionId: str
    createdAt: PositiveInt
    size: PositiveInt
    label: str | None = None
    provider: str
    encrypted: bool


class BackupListModel(BaseModel):
    projectId: str
    versions: list[BackupVersionModel]


class BackupCreateModel(BaseModel):
    label: str | None = None


class BackupRestoreModel(BaseModel):
    versionId: str


__all__ = [
    "RGBCommand",
    "RGBState",
    "WSSetMessage",
    "WSStateMessage",
    "RESTCommand",
    "SceneModel",
    "ProjectMetaModel",
    "ProjectsResponse",
    "ProjectCreateModel",
    "ProjectUpdateModel",
    "BackupVersionModel",
    "BackupListModel",
    "BackupCreateModel",
    "BackupRestoreModel",
    "CMD_SCHEMA",
    "STATE_SCHEMA",
]
