"""Pydantic models and schema helpers."""

from __future__ import annotations

from typing import Annotated, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    NonNegativeInt,
    PositiveFloat,
    PositiveInt,
    field_validator,
)

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


class DMXTestRequest(BaseModel):
    type: Literal["serial", "artnet"]
    path: str | None = None
    ip: str | None = None
    channel: PositiveInt = Field(1, le=512)
    value: PositiveInt = Field(255, le=255)


class DesktopPreferences(BaseModel):
    channel: Literal["stable", "beta"] = "stable"
    telemetryOptIn: bool = False
    completedAt: PositiveInt | None = None


CustomBlockKind = Literal[
    "master-dimmer",
    "scene-button",
    "effect-toggle",
    "fixture-slider",
    "motor-pad",
    "servo-knob",
    "markdown-note",
]
CustomBlockSize = Literal["xs", "sm", "md", "lg"]


class CustomBlockPosition(BaseModel):
    col: NonNegativeInt = 0
    row: NonNegativeInt = 0
    width: PositiveInt = Field(3, le=24)
    height: PositiveInt = Field(1, le=24)


class CustomBlockBase(BaseModel):
    id: str
    title: str | None = None
    description: str | None = None
    size: CustomBlockSize | None = None
    position: CustomBlockPosition | None = None


class MasterDimmerBlock(CustomBlockBase):
    kind: Literal["master-dimmer"]
    showPercent: bool | None = True


class SceneButtonBlock(CustomBlockBase):
    kind: Literal["scene-button"]
    sceneId: str | None = None
    behavior: Literal["recall", "toggle", "preview"] = "recall"


class EffectToggleBlock(CustomBlockBase):
    kind: Literal["effect-toggle"]
    effectId: str | None = None
    behavior: Literal["toggle", "on", "off"] = "toggle"


class FixtureSliderBlock(CustomBlockBase):
    kind: Literal["fixture-slider"]
    fixtureId: str | None = None
    channelId: str | None = None
    min: NonNegativeInt | None = Field(0, le=255)
    max: NonNegativeInt | None = Field(255, le=255)
    showValue: bool | None = True

    @field_validator("max")
    @classmethod
    def _validate_max(cls, value: int | None) -> int | None:
        if value is None:
            return value
        return min(255, max(0, value))

    @field_validator("min")
    @classmethod
    def _validate_min(cls, value: int | None) -> int | None:
        if value is None:
            return value
        return min(255, max(0, value))


class MotorPadBlock(CustomBlockBase):
    kind: Literal["motor-pad"]
    motorId: str | None = None
    axis: Literal["pan", "tilt", "linear"] = "pan"
    speedScale: PositiveFloat | None = None


class ServoKnobBlock(CustomBlockBase):
    kind: Literal["servo-knob"]
    servoId: str | None = None
    showTarget: bool | None = True


class MarkdownNoteBlock(CustomBlockBase):
    kind: Literal["markdown-note"]
    content: str = ""


CustomBlockModel = Annotated[
    MasterDimmerBlock
    | SceneButtonBlock
    | EffectToggleBlock
    | FixtureSliderBlock
    | MotorPadBlock
    | ServoKnobBlock
    | MarkdownNoteBlock,
    Field(discriminator="kind"),
]


class CustomLayoutGrid(BaseModel):
    columns: PositiveInt = Field(12, le=24)
    rowHeight: PositiveFloat = 1.0
    gap: PositiveFloat = 1.0


class CustomLayoutModel(BaseModel):
    id: str
    name: str = "Dashboard"
    grid: CustomLayoutGrid | None = None
    blocks: list[CustomBlockModel] = Field(default_factory=list)
    updatedAt: PositiveInt | None = None


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
    "DMXTestRequest",
    "DesktopPreferences",
    "CustomLayoutModel",
    "CustomBlockModel",
    "CMD_SCHEMA",
    "STATE_SCHEMA",
]
