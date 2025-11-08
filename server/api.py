"""FastAPI routes and WebSocket handlers."""

from __future__ import annotations

import asyncio
import time
import json
import logging
from typing import Any, AsyncIterator, Callable, TypeVar
import contextlib
import socket
import struct

import serial  # type: ignore

from fastapi import APIRouter, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, PlainTextResponse, Response, StreamingResponse

from .context import AppContext
from .engine import Engine
from .models import (
    CMD_SCHEMA,
    RESTCommand,
    RGBCommand,
    RGBState,
    WSSetMessage,
    SceneModel,
    ProjectsResponse,
    ProjectCreateModel,
    ProjectUpdateModel,
    ProjectMetaModel,
    BackupVersionModel,
    BackupListModel,
    BackupCreateModel,
    BackupRestoreModel,
    DMXTestRequest,
)
from .util.schema import load_schemas
from .fixtures.mapper import resolve_attrs
from .util.ulid import ulid_from_string
from .drivers.enttec import EnttecDMXUSBPro, USBDeviceInfo, find_enttec_device
from .dmx.autodetect import enumerate_serial_devices, enumerate_artnet_nodes
from .services.projects import switch_active_project, create_project_backup, list_backups, restore_backup, serialize_project
from .backups.base import BackupVersion

_schemas = load_schemas()

router = APIRouter()
logger = logging.getLogger("api")
T = TypeVar("T")


def get_context(request: Request) -> AppContext:
    context = getattr(request.app.state, "context", None)
    if not isinstance(context, AppContext):
        raise HTTPException(status_code=503, detail="service context unavailable")
    return context


def get_context_ws(websocket: WebSocket) -> AppContext:
    context = getattr(websocket.app.state, "context", None)
    if not isinstance(context, AppContext):
        raise HTTPException(status_code=503, detail="service context unavailable")
    return context


def get_engine(context: AppContext = Depends(get_context)) -> Engine:
    if context.engine is None:
        raise HTTPException(status_code=503, detail="engine not ready")
    return context.engine


async def _run_blocking(func: Callable[..., T], *args: Any, **kwargs: Any) -> T:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, lambda: func(*args, **kwargs))


async def _safe_enumerate(label: str, func: Callable[[], list[dict[str, Any]]]) -> list[dict[str, Any]]:
    try:
        return await _run_blocking(func)
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.warning("dmx %s enumeration failed: %s", label, exc)
        return []


def _projects_enabled(context: AppContext) -> None:
    if not context.projects_enabled or context.projects_store is None or context.projects_index is None:
        raise HTTPException(status_code=404, detail="projects feature disabled")


def _backups_enabled(context: AppContext) -> None:
    if context.backup_client is None:
        raise HTTPException(status_code=404, detail="cloud backup disabled")


def _projects_payload(context: AppContext) -> dict[str, Any]:
    assert context.projects_index is not None
    return {
        "activeId": context.projects_index.activeId,
        "projects": [serialize_project(meta) for meta in context.projects_index.projects],
    }


def _serialize_backup(version: BackupVersion) -> dict[str, Any]:
    return {
        "versionId": version.version_id,
        "createdAt": version.created_at,
        "size": version.size,
        "label": version.label,
        "provider": version.provider,
        "encrypted": version.encrypted,
    }


def _send_dmx_serial_frame(path: str, channel: int, value: int) -> None:
    frame = bytearray(513)
    frame[0] = 0  # start code
    if 1 <= channel <= 512:
        frame[channel] = value
    length = len(frame)
    packet = bytearray([0x7E, 0x06, length & 0xFF, (length >> 8) & 0xFF])
    packet.extend(frame)
    packet.append(0xE7)
    with serial.Serial(path, baudrate=57600, timeout=0.2) as handle:  # type: ignore[attr-defined]
        handle.write(packet)


def _send_artnet_frame(ip: str, channel: int, value: int) -> None:
    frame = bytearray(512)
    if 1 <= channel <= 512:
        frame[channel - 1] = value
    header = bytearray()
    header.extend(b"Art-Net\x00")
    header.extend(struct.pack("<H", 0x5000))
    header.extend(struct.pack("<H", 14 + len(frame)))
    header.extend(b"\x00\x00")  # protocol version
    header.extend(b"\x00\x00")  # sequence + physical
    header.extend(struct.pack("<H", 0))  # universe
    header.extend(struct.pack(">H", len(frame)))
    payload = header + frame
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    with contextlib.closing(sock):
        sock.sendto(payload, (ip, 6454))


def _serialize_usb_device(info: USBDeviceInfo) -> dict[str, Any]:
    return {
        "port": info.port,
        "vendorId": info.vid,
        "productId": info.pid,
        "manufacturer": info.manufacturer,
        "product": info.product,
        "serialNumber": info.serial_number,
    }


@router.get("/usb/devices")
async def list_usb_devices(context: AppContext = Depends(get_context)) -> dict[str, Any]:
    devices = context.usb_devices or []
    return {"devices": [_serialize_usb_device(dev) for dev in devices]}


@router.post("/usb/refresh")
async def refresh_usb_devices(context: AppContext = Depends(get_context)) -> dict[str, Any]:
    monitor = context.usb_monitor
    if monitor is None:
        raise HTTPException(status_code=404, detail="usb monitor disabled")
    devices = await monitor.refresh_now()
    context.usb_devices = devices
    return {"devices": [_serialize_usb_device(dev) for dev in devices]}


@router.post("/usb/reconnect")
async def reconnect_usb_driver(context: AppContext = Depends(get_context)) -> dict[str, Any]:
    settings = context.settings
    candidate = find_enttec_device(settings.usb_port, settings.usb_vendor_ids, settings.usb_product_ids)
    if candidate is None:
        raise HTTPException(status_code=404, detail="no enttec-compatible device found")
    driver = EnttecDMXUSBPro(
        port=candidate.port,
        baudrate=settings.usb_baudrate,
        fps=settings.usb_fps,
    )
    try:
        await driver.open()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"failed to open {candidate.port}: {exc}") from exc
    # swap driver in context/engine
    if context.usb_driver is not None:
        try:
            await context.usb_driver.close()
        except Exception:
            pass
    context.usb_driver = driver
    if context.engine is not None:
        context.engine.ola_cb = driver  # type: ignore[assignment]
    return {"port": candidate.port}


@router.get("/dmx/devices")
async def api_list_dmx_devices() -> dict[str, Any]:
    serial_devices, artnet_nodes = await asyncio.gather(
        _safe_enumerate("serial", enumerate_serial_devices),
        _safe_enumerate("artnet", enumerate_artnet_nodes),
    )
    return {"serial": serial_devices, "artnet": artnet_nodes}


@router.post("/dmx/test")
async def api_test_dmx(payload: DMXTestRequest) -> dict[str, Any]:
    channel = payload.channel
    value = payload.value
    if payload.type == "serial":
        if not payload.path:
            raise HTTPException(status_code=400, detail="serial path required")
        try:
            await _run_blocking(_send_dmx_serial_frame, payload.path, channel, value)
        except Exception as exc:
            logger.exception("serial DMX test failed for %s: %s", payload.path, exc)
            raise HTTPException(status_code=502, detail=f"serial test failed: {exc}") from exc
        target = payload.path
    else:
        if not payload.ip:
            raise HTTPException(status_code=400, detail="artnet ip required")
        try:
            await _run_blocking(_send_artnet_frame, payload.ip, channel, value)
        except Exception as exc:
            logger.exception("Art-Net DMX test failed for %s: %s", payload.ip, exc)
            raise HTTPException(status_code=502, detail=f"artnet test failed: {exc}") from exc
        target = payload.ip
    return {"status": "ok", "type": payload.type, "target": target, "channel": channel, "value": value}


@router.get("/projects", response_model=ProjectsResponse)
async def api_list_projects(context: AppContext = Depends(get_context)) -> dict[str, Any]:
    _projects_enabled(context)
    return _projects_payload(context)


@router.post("/projects", response_model=ProjectsResponse, status_code=201)
async def api_create_project(payload: ProjectCreateModel, context: AppContext = Depends(get_context)) -> dict[str, Any]:
    _projects_enabled(context)
    assert context.projects_store is not None
    assert context.projects_index is not None
    await context.projects_store.create_project(
        context.projects_index,
        name=payload.name,
        venue=payload.venue,
        event_date=payload.eventDate,
        notes=payload.notes,
        template_id=payload.templateId,
    )
    return _projects_payload(context)


@router.put("/projects/{project_id}", response_model=ProjectMetaModel)
async def api_update_project(
    project_id: str,
    payload: ProjectUpdateModel,
    context: AppContext = Depends(get_context),
) -> dict[str, Any]:
    _projects_enabled(context)
    assert context.projects_store is not None
    assert context.projects_index is not None
    updates = payload.model_dump(exclude_none=True)
    try:
        project = await context.projects_store.update_project(context.projects_index, project_id, updates)
    except KeyError:
        raise HTTPException(status_code=404, detail="project not found") from None
    return serialize_project(project)


@router.post("/projects/{project_id}/select", response_model=ProjectsResponse)
async def api_select_project(project_id: str, context: AppContext = Depends(get_context)) -> dict[str, Any]:
    _projects_enabled(context)
    try:
        await switch_active_project(context, project_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="project not found") from None
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return _projects_payload(context)


@router.get("/projects/{project_id}/backups", response_model=BackupListModel)
async def api_list_backups(project_id: str, context: AppContext = Depends(get_context)) -> dict[str, Any]:
    _projects_enabled(context)
    _backups_enabled(context)
    versions = await list_backups(context, project_id)
    return {"projectId": project_id, "versions": [_serialize_backup(v) for v in versions]}


@router.post("/projects/{project_id}/backups", response_model=BackupVersionModel, status_code=201)
async def api_create_backup(
    project_id: str,
    payload: BackupCreateModel,
    context: AppContext = Depends(get_context),
) -> dict[str, Any]:
    _projects_enabled(context)
    _backups_enabled(context)
    if context.active_project is None or context.active_project.id != project_id:
        raise HTTPException(status_code=409, detail="select project before creating backup")
    version = await create_project_backup(context, label=payload.label)
    return _serialize_backup(version)


@router.post("/projects/{project_id}/restore")
async def api_restore_backup(
    project_id: str,
    payload: BackupRestoreModel,
    context: AppContext = Depends(get_context),
) -> dict[str, Any]:
    _projects_enabled(context)
    _backups_enabled(context)
    if context.active_project is None or context.active_project.id != project_id:
        raise HTTPException(status_code=409, detail="select project before restoring backup")
    try:
        await restore_backup(context, project_id, payload.versionId)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="backup not found") from None
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"status": "ok"}


@router.get("/rgb", response_model=RGBState)
async def read_rgb(engine: Engine = Depends(get_engine)) -> RGBState:
    return RGBState.model_validate(engine.state)


@router.post("/rgb", status_code=202)
async def post_rgb(payload: RESTCommand, engine: Engine = Depends(get_engine)) -> dict[str, Any]:
    command = RGBCommand.model_validate({**payload.model_dump(), "schema": CMD_SCHEMA})
    await engine.submit(command)
    return {"status": "accepted"}


async def _apply_unified_to_engine(engine: Engine, payload: dict[str, Any], src: str) -> bool:
    """Translate a unified Command into an RGBCommand understood by the demo engine.

    For now we support only universe 0 and map ch1->R, ch2->G, ch3->B. Other channels/universes are ignored.
    Returns True if the command was accepted for processing.
    """
    t = payload.get("type")
    if t not in {"dmx.set", "dmx.patch"}:
        # Not implemented (scene/effect/motor). Reject.
        return False
    universe = int(payload.get("universe", 0))
    if universe != 0:
        # ignore non-zero universes in demo engine
        return False
    # Start from current state
    r = int(engine.state.get("r", 0))
    g = int(engine.state.get("g", 0))
    b = int(engine.state.get("b", 0))
    if t == "dmx.set":
        ch = int(payload.get("channel", 0))
        val = int(payload.get("value", 0))
        if ch == 1:
            r = val
        elif ch == 2:
            g = val
        elif ch == 3:
            b = val
    else:  # dmx.patch
        for item in payload.get("patch", []) or []:
            ch = int(item.get("ch", 0))
            val = int(item.get("val", 0))
            if ch == 1:
                r = val
            elif ch == 2:
                g = val
            elif ch == 3:
                b = val
    # derive a ULID for dedupe: prefer msg.id; fallback to cmdId if present; otherwise new ULID
    raw_id = str(payload.get("id") or payload.get("cmdId") or "")
    cmd_id = ulid_from_string(raw_id) if raw_id else ulid_from_string("auto:" + src)
    cmd = RGBCommand.model_validate({
        "schema": CMD_SCHEMA,
        "cmdId": cmd_id,
        "src": src,
        "r": r,
        "g": g,
        "b": b,
        "ts": None,
    })
    return await engine.submit(cmd)


@router.post("/command")
async def post_command(request: Request, context: AppContext = Depends(get_context), engine: Engine = Depends(get_engine)) -> Any:
    import time
    start = time.perf_counter()
    payload = await request.json()
    # Schema validation
    typ = str(payload.get("type"))
    if typ == "dmx.fade":
        schema_errors = sorted(_schemas.fade().iter_errors(payload), key=lambda e: e.path)
    else:
        schema_errors = sorted(_schemas.command().iter_errors(payload), key=lambda e: e.path)
    if schema_errors:
        ack = {
            "ack": payload.get("id"),
            "accepted": False,
            "reason": "VALIDATION_FAILED",
            "errors": [
                {"path": "/" + "/".join(map(str, e.path)), "msg": e.message} for e in schema_errors
            ],
            "ts": int(time.time() * 1000),
        }
        context.core.inc_cmd("rest", str(payload.get("type")), False)
        context.core.observe_ack(int((time.perf_counter() - start) * 1000))
        return ack
    # Canonicalize patch (if present)
    patch = payload.get("patch")
    if typ == "dmx.patch" and isinstance(patch, list):
        items: dict[int, int] = {}
        errors: list[dict[str, str]] = []
        for i, it in enumerate(patch):
            try:
                ch = int(it.get("ch"))
                val = int(it.get("val"))
            except Exception:
                errors.append({"path": f"/patch/{i}", "msg": "invalid item"})
                continue
            if not (1 <= ch <= 512):
                errors.append({"path": f"/patch/{i}/ch", "msg": "out of range"})
                continue
            if not (0 <= val <= 255):
                errors.append({"path": f"/patch/{i}/val", "msg": "out of range"})
                continue
            items[ch] = val  # LWW
        if errors:
            ack = {
                "ack": payload.get("id"),
                "accepted": False,
                "reason": "VALIDATION_FAILED",
                "errors": errors,
                "ts": int(time.time() * 1000),
            }
            context.core.inc_cmd("rest", typ, False)
            context.core.observe_ack(int((time.perf_counter() - start) * 1000))
            return ack
        if len(items) == 0:
            ack = {
                "ack": payload.get("id"),
                "accepted": False,
                "reason": "VALIDATION_FAILED",
                "errors": [{"path": "/patch", "msg": "empty"}],
                "ts": int(time.time() * 1000),
            }
            context.core.inc_cmd("rest", typ, False)
            context.core.observe_ack(int((time.perf_counter() - start) * 1000))
            return ack
        if len(items) > 64:
            ack = {
                "ack": payload.get("id"),
                "accepted": False,
                "reason": "PATCH_TOO_LARGE",
                "ts": int(time.time() * 1000),
            }
            context.core.inc_cmd("rest", typ, False)
            context.core.observe_ack(int((time.perf_counter() - start) * 1000))
            return ack
        payload["patch"] = [{"ch": ch, "val": val} for ch, val in items.items()]
        context.core.set_patch_size(len(items))
    # Simple per-source rate limit (per proto/ip/universe)
    client_ip = request.client.host if request.client else "unknown"
    universe = int(payload.get("universe", 0)) if isinstance(payload, dict) else 0
    if not context.rlimit.allow("rest", client_ip, universe):
        ack = {
            "ack": payload.get("id"),
            "accepted": False,
            "reason": "RATE_LIMITED",
            "ts": int(time.time() * 1000),
        }
        context.core.inc_cmd("rest", typ, False)
        context.core.observe_ack(int((time.perf_counter() - start) * 1000))
        return ack
    # Handle commands by type
    if typ == "fixture.set" and context.settings.fixtures_enabled:
        schema = _schemas.fixture()
        fs_errors = sorted(schema.iter_errors(payload), key=lambda e: e.path)
        if fs_errors:
            return {"ack": payload.get("id"), "accepted": False, "reason": "VALIDATION_FAILED", "errors": [{"path": "/" + "/".join(map(str, e.path)), "msg": e.message} for e in fs_errors]}
        fx_id = str(payload.get("fixtureId"))
        inst = (context.fixture_instances or {}).get(fx_id)
        if inst is None:
            context.core.fixture_apply_total = getattr(context.core, "fixture_apply_total", {})
            key = ("error", "not_found")
            context.core.fixture_apply_total[key] = context.core.fixture_apply_total.get(key, 0) + 1
            return {"ack": payload.get("id"), "accepted": False, "reason": "not_found"}
        items = resolve_attrs(inst, payload.get("attrs", {}))
        context.core.fixture_attrs_total = getattr(context.core, "fixture_attrs_total", {})
        for k in payload.get("attrs", {}).keys():
            context.core.fixture_attrs_total[k] = context.core.fixture_attrs_total.get(k, 0) + 1
        delta, rev, ts2 = context.dmx.apply_local_patch(inst.universe, items)
        if delta:
            await context.hub.send_payload({"type": "state.update", "rev": rev, "ts": ts2, "universe": inst.universe, "delta": delta, "full": False})
        context.core.fixture_apply_total = getattr(context.core, "fixture_apply_total", {})
        keyok = ("ok", "resolve")
        context.core.fixture_apply_total[keyok] = context.core.fixture_apply_total.get(keyok, 0) + 1
        return {"ack": payload.get("id"), "accepted": True, "ts": int(time.time() * 1000)}
    if typ == "dmx.fade" and context.settings.fades_enabled:
        # Enqueue fade task and Ack
        universe = int(payload.get("universe", 0))
        duration_ms = int(payload.get("durationMs", 0))
        easing = str(payload.get("easing", "linear"))
        now_ms = int(time.time() * 1000)
        context.dmx  # ensure
        # Build a minimal getter for current values
        def get_current(u: int, ch: int) -> int:
            snap = context.dmx.snapshot().get(u, {})
            return int(snap.get(ch, 0))
        from .dmx.fade_engine import FadeEngine  # local import
        # reuse engine task created in app; attach if exists
        fe: FadeEngine | None = getattr(context, "_fade_engine", None)
        if fe is None:
            # best-effort: fallback to immediate patch if fade engine missing
            typ = "dmx.patch"
        else:
            fe.add_fade(universe=universe, patch=payload.get("patch", []), duration_ms=duration_ms, now_ms=now_ms, get_current=get_current, easing=easing)
            context.core.inc_cmd("rest", typ, True)
            return {"ack": payload.get("id"), "accepted": True, "ts": int(time.time() * 1000)}

    # Apply to DMX engine and broadcast delta
    universe = int(payload.get("universe", 0))
    # LTP: cancel fade channels if enabled
    if context.settings.fades_enabled:
        fe = getattr(context, "_fade_engine", None)
        if fe is not None:
            try:
                chans = [int(it.get("ch")) for it in payload.get("patch", [])]
                fe.cancel_channels(universe, chans, metrics=context.core, reason="ltp")
            except Exception:
                pass
    delta, rev, ts2 = context.dmx.apply_patch(universe, payload.get("patch", []))
    if delta:
        if universe == 0:
            try:
                rgb_map = {it["ch"]: it["val"] for it in delta}
                r = int(rgb_map.get(1, engine.state["r"]))
                g = int(rgb_map.get(2, engine.state["g"]))
                b = int(rgb_map.get(3, engine.state["b"]))
                cmd = RGBCommand.model_validate({
                    "schema": CMD_SCHEMA,
                    "cmdId": ulid_from_string(str(payload.get("id") or "rest")),
                    "src": "rest",
                    "r": r,
                    "g": g,
                    "b": b,
                    "ts": None,
                })
                await engine.submit(cmd)
            except Exception:
                pass
        await context.hub.send_payload({
            "type": "state.update",
            "rev": rev,
            "ts": ts2,
            "universe": universe,
            "delta": delta,
            "full": False,
        })
        if context.ola_manager is not None:
            try:
                context.ola_manager.apply_patch(universe, delta)
                await context.ola_manager.maybe_send(universe)
            except Exception:
                pass
    accepted = True
    context.core.inc_cmd("rest", typ, True)
    ack = {"ack": payload.get("id"), "accepted": True, "ts": int(time.time() * 1000)}
    # Log summary
    try:
        patch_size = len(payload.get("patch", [])) if typ == "dmx.patch" else 0
        logger.info(
            "cmd proto=rest type=%s id=%s universe=%s patch_size=%d accepted=%s",
            typ,
            payload.get("id"),
            payload.get("universe"),
            patch_size,
            str(bool(accepted)).lower(),
        )
    except Exception:
        pass
    context.core.observe_ack(int((time.perf_counter() - start) * 1000))
    return ack


@router.get("/state")
async def get_state(request: Request, sparse: int = 0, context: AppContext = Depends(get_context)) -> Response:
    # Unified snapshot from DMX engine (default beze změny), s volitelným sparse přívěskem a ETagem
    dmx = context.dmx
    etag = f'W/"rev-{dmx.rev}"'
    inm = request.headers.get("if-none-match")
    if inm == etag:
        return Response(status_code=304, headers={"ETag": etag})
    body: dict[str, Any] = {"ts": dmx.ts, "universes": dmx.snapshot()}
    if int(sparse or 0) == 1:
        universes_sparse: dict[str, dict[str, int]] = {}
        for u, chmap in dmx.snapshot().items():
            sparse_map: dict[str, int] = {}
            for k, v in chmap.items():
                try:
                    if int(v) != 0:
                        sparse_map[str(k)] = int(v)
                except Exception:
                    continue
            universes_sparse[str(u)] = sparse_map
        body["universesSparse"] = universes_sparse
        body["sparse"] = True
    return JSONResponse(content=body, headers={"ETag": etag})


@router.get("/scenes", response_model=list[SceneModel])
async def get_scenes(context: AppContext = Depends(get_context)) -> list[SceneModel]:
    """Return all stored scenes."""

    return [SceneModel.model_validate(scene) for scene in context.scenes or []]


@router.put("/scenes", response_model=list[SceneModel])
async def put_scenes(payload: list[SceneModel], context: AppContext = Depends(get_context)) -> list[SceneModel]:
    """Replace scenes with provided list and persist to disk."""

    serialized = [scene.model_dump() for scene in payload]
    context.scenes = serialized
    store = context.scenes_store
    if store is not None:
        await store.save(serialized)
    # keep snapshot in sync
    if context.show_snapshot is not None:
        context.show_snapshot["scenes"] = serialized
        if context.show_store is not None:
            await context.show_store.save(context.show_snapshot)
    return payload


def _current_show_payload(context: AppContext) -> dict[str, Any]:
    snapshot = dict(context.show_snapshot or {})
    scenes = context.scenes or snapshot.get("scenes") or []
    payload = {
        "version": snapshot.get("version", "1.1"),
        "exportedAt": int(time.time() * 1000),
        "universes": snapshot.get("universes") or [],
        "fixtures": snapshot.get("fixtures") or [],
        "scenes": scenes,
        "effects": snapshot.get("effects") or [],
        "stepperMotors": snapshot.get("stepperMotors") or [],
        "servos": snapshot.get("servos") or [],
    }
    return payload


@router.get("/export")
async def export_show(context: AppContext = Depends(get_context)) -> StreamingResponse:
    """Export the full show configuration as JSON."""

    payload = _current_show_payload(context)

    async def iterator() -> AsyncIterator[bytes]:
        data = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        yield data.encode("utf-8")

    return StreamingResponse(iterator(), media_type="application/json")


@router.post("/import")
async def import_show(payload: dict[str, Any], context: AppContext = Depends(get_context)) -> dict[str, Any]:
    """Import a show payload and persist scenes."""

    scenes_data = payload.get("scenes") or []
    if not isinstance(scenes_data, list):
        scenes_data = []
    validated_scenes: list[dict[str, Any]] = [
        SceneModel.model_validate(scene).model_dump() for scene in scenes_data
    ]
    payload["scenes"] = validated_scenes
    context.scenes = validated_scenes
    if context.scenes_store is not None:
        await context.scenes_store.save(validated_scenes)
    context.show_snapshot = payload
    if context.show_store is not None:
        await context.show_store.save(payload)
    return payload


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    context = get_context_ws(websocket)
    engine = context.engine
    if engine is None:
        await websocket.close(code=1013)
        return
    await context.hub.register(websocket)
    try:
        await websocket.send_text(json.dumps({
            "type": "state",
            "r": engine.state["r"],
            "g": engine.state["g"],
            "b": engine.state["b"],
            "seq": engine.state["seq"],
            "ts": engine.state["ts"],
        }))
        # Unified state.update initial full snapshots for all universes
        snapshot = context.dmx.snapshot()
        for uni, chmap in snapshot.items():
            delta = [{"ch": int(k), "val": int(v)} for k, v in chmap.items()]
            await websocket.send_text(json.dumps({
                "type": "state.update",
                "rev": context.dmx.rev,
                "ts": context.dmx.ts,
                "universe": int(uni),
                "delta": delta,
                "full": True,
            }))
        while True:
            import time
            start = time.perf_counter()
            data_text = await websocket.receive_text()
            data = json.loads(data_text)
            # Backward compatible 'set' message
            if isinstance(data, dict) and data.get("type") == "set":
                message = WSSetMessage.model_validate(data)
                command = RGBCommand.model_validate({
                    "schema": CMD_SCHEMA,
                    "cmdId": message.cmdId,
                    "src": message.src,
                    "r": message.r,
                    "g": message.g,
                    "b": message.b,
                    "ts": None,
                })
                await engine.submit(command)
                # legacy clients didn't expect ack; skip
                continue
            # Unified Command over WS
            typ = str(data.get("type"))
            if typ == "fixture.set" and context.settings.fixtures_enabled:
                validator = _schemas.fixture()
            elif typ == "dmx.fade":
                validator = _schemas.fade()
            else:
                validator = _schemas.command()
            errors = sorted(validator.iter_errors(data), key=lambda e: e.path)
            if errors:
                ack = {
                    "ack": data.get("id"),
                    "accepted": False,
                    "reason": "VALIDATION_FAILED",
                    "errors": [
                        {"path": "/" + "/".join(map(str, e.path)), "msg": e.message} for e in errors
                    ],
                    "ts": int(time.time() * 1000),
                }
                await websocket.send_text(json.dumps(ack))
                context.core.observe_ack(int((time.perf_counter() - start) * 1000))
                context.core.inc_cmd("ws", str(data.get("type")), False)
                continue
            # Fixture set (if enabled)
            if typ == "fixture.set" and context.settings.fixtures_enabled:
                fx_id = str(data.get("fixtureId"))
                inst = (context.fixture_instances or {}).get(fx_id)
                if inst is None:
                    context.core.fixture_apply_total = getattr(context.core, "fixture_apply_total", {})
                    key = ("error", "not_found")
                    context.core.fixture_apply_total[key] = context.core.fixture_apply_total.get(key, 0) + 1
                    await websocket.send_text(json.dumps({"ack": data.get("id"), "accepted": False, "reason": "not_found"}))
                    continue
                items = resolve_attrs(inst, data.get("attrs", {}))
                # Metrics per attr
                context.core.fixture_attrs_total = getattr(context.core, "fixture_attrs_total", {})
                for k in data.get("attrs", {}).keys():
                    context.core.fixture_attrs_total[k] = context.core.fixture_attrs_total.get(k, 0) + 1
                # apply as local patch
                delta, rev, ts_local = context.dmx.apply_local_patch(inst.universe, items)
                if delta:
                    await context.hub.send_payload({
                        "type": "state.update", "rev": rev, "ts": ts_local,
                        "universe": inst.universe, "delta": delta, "full": False,
                    })
                context.core.fixture_apply_total = getattr(context.core, "fixture_apply_total", {})
                keyok = ("ok", "resolve")
                context.core.fixture_apply_total[keyok] = context.core.fixture_apply_total.get(keyok, 0) + 1
                await websocket.send_text(json.dumps({"ack": data.get("id"), "accepted": True, "ts": int(time.time() * 1000)}))
                continue
            if typ == "dmx.fade" and context.settings.fades_enabled:
                # Enqueue fade
                universe = int(data.get("universe", 0))
                duration_ms = int(data.get("durationMs", 0))
                easing = str(data.get("easing", "linear"))
                now_ms = int(time.time() * 1000)
                def get_current(u: int, ch: int) -> int:
                    snap = context.dmx.snapshot().get(u, {})
                    return int(snap.get(ch, 0))
                fe = getattr(context, "_fade_engine", None)
                if fe is not None:
                    fe.add_fade(universe=universe, patch=data.get("patch", []), duration_ms=duration_ms, now_ms=now_ms, get_current=get_current, easing=easing)
                    ack = {"ack": data.get("id"), "accepted": True, "ts": int(time.time() * 1000)}
                    await websocket.send_text(json.dumps(ack))
                    context.core.inc_cmd("ws", typ, True)
                    continue
            # canonicalize patch as above
            patch = data.get("patch")
            errors_list: list[dict[str, str]] = []
            if typ == "dmx.patch" and isinstance(patch, list):
                items: dict[int, int] = {}
                for i, it in enumerate(patch):
                    try:
                        ch = int(it.get("ch"))
                        val = int(it.get("val"))
                    except Exception:
                        errors_list.append({"path": f"/patch/{i}", "msg": "invalid item"})
                        continue
                    if not (1 <= ch <= 512):
                        errors_list.append({"path": f"/patch/{i}/ch", "msg": "out of range"})
                        continue
                    if not (0 <= val <= 255):
                        errors_list.append({"path": f"/patch/{i}/val", "msg": "out of range"})
                        continue
                    items[ch] = val
                if errors_list:
                    ack = {
                        "ack": data.get("id"),
                        "accepted": False,
                        "reason": "VALIDATION_FAILED",
                        "errors": errors_list,
                        "ts": int(time.time() * 1000),
                    }
                    await websocket.send_text(json.dumps(ack))
                    context.core.observe_ack(int((time.perf_counter() - start) * 1000))
                    context.core.inc_cmd("ws", typ, False)
                    continue
                if len(items) == 0:
                    ack = {
                        "ack": data.get("id"),
                        "accepted": False,
                        "reason": "VALIDATION_FAILED",
                        "errors": [{"path": "/patch", "msg": "empty"}],
                        "ts": int(time.time() * 1000),
                    }
                    await websocket.send_text(json.dumps(ack))
                    context.core.observe_ack(int((time.perf_counter() - start) * 1000))
                    context.core.inc_cmd("ws", typ, False)
                    continue
                if len(items) > 64:
                    ack = {
                        "ack": data.get("id"),
                        "accepted": False,
                        "reason": "PATCH_TOO_LARGE",
                        "ts": int(time.time() * 1000),
                    }
                    await websocket.send_text(json.dumps(ack))
                    context.core.observe_ack(int((time.perf_counter() - start) * 1000))
                    context.core.inc_cmd("ws", typ, False)
                    continue
                data["patch"] = [{"ch": ch, "val": val} for ch, val in items.items()]
                context.core.set_patch_size(len(items))
            # Rate limit per client ip
            client_ip = getattr(websocket.client, 'host', 'unknown') if hasattr(websocket, 'client') else 'unknown'
            universe = int(data.get("universe", 0)) if isinstance(data, dict) else 0
            if not context.rlimit.allow("ws", client_ip, universe):
                ack = {
                    "ack": data.get("id"),
                    "accepted": False,
                    "reason": "RATE_LIMITED",
                    "ts": int(time.time() * 1000),
                }
                await websocket.send_text(json.dumps(ack))
                context.core.observe_ack(int((time.perf_counter() - start) * 1000))
                context.core.inc_cmd("ws", typ, False)
                continue
            # Apply to DMX engine and broadcast delta
            universe = int(data.get("universe", 0))
            # LTP: cancel ongoing fades for given channels
            if context.settings.fades_enabled:
                fe = getattr(context, "_fade_engine", None)
                if fe is not None:
                    try:
                        chans = [int(it.get("ch")) for it in data.get("patch", [])]
                        fe.cancel_channels(universe, chans, metrics=context.core, reason="ltp")
                    except Exception:
                        pass
            delta, rev, ts2 = context.dmx.apply_patch(universe, data.get("patch", []))
            accepted = True
            context.core.inc_cmd("ws", typ, True)
            ack = {"ack": data.get("id"), "accepted": True, "ts": int(time.time() * 1000)}
            await websocket.send_text(json.dumps(ack))
            context.core.observe_ack(int((time.perf_counter() - start) * 1000))
            if delta:
                # Mirror RGB legacy engine for universe 0 ch1..3 so legacy state stays meaningful
                if universe == 0:
                    try:
                        rgb_map = {it["ch"]: it["val"] for it in delta}
                        r = int(rgb_map.get(1, engine.state["r"]))
                        g = int(rgb_map.get(2, engine.state["g"]))
                        b = int(rgb_map.get(3, engine.state["b"]))
                        cmd = RGBCommand.model_validate({
                            "schema": CMD_SCHEMA,
                            "cmdId": ulid_from_string(str(data.get("id") or "ws")),
                            "src": "ws",
                            "r": r,
                            "g": g,
                            "b": b,
                            "ts": None,
                        })
                        await engine.submit(cmd)
                    except Exception:
                        pass
                await context.hub.send_payload({
                    "type": "state.update",
                    "rev": rev,
                    "ts": ts2,
                    "universe": universe,
                    "delta": delta,
                    "full": False,
                })
                if context.ola_manager is not None:
                    try:
                        context.ola_manager.apply_patch(universe, delta)
                        await context.ola_manager.maybe_send(universe)
                    except Exception:
                        pass
            try:
                patch_size = len(data.get("patch", [])) if typ == "dmx.patch" else 0
                logger.info(
                    "cmd proto=ws type=%s id=%s universe=%s patch_size=%d accepted=%s",
                    typ,
                    data.get("id"),
                    data.get("universe"),
                    patch_size,
                    str(bool(accepted)).lower(),
                )
            except Exception:
                pass
    except WebSocketDisconnect:
        pass
    except Exception as exc:
        logger.error("ws_error", exc_info=exc)
        await websocket.close(code=1011)
    finally:
        await context.hub.unregister(websocket)


@router.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/readyz")
async def readyz(context: AppContext = Depends(get_context)) -> JSONResponse:
    ready = context.engine is not None and context.mqtt_connected and context.engine.queue_empty()
    status = 200 if ready else 503
    return JSONResponse(status_code=status, content={
        "ready": ready,
        "mqttConnected": context.mqtt_connected,
        "queueDepth": context.engine.queue_depth() if context.engine else None,
    })


@router.get("/metrics")
async def metrics(context: AppContext = Depends(get_context)) -> PlainTextResponse:
    if not context.settings.metrics_enabled:
        raise HTTPException(status_code=404, detail="metrics disabled")
    metrics_lines = [
        "# HELP dmx_engine_processed_total Commands processed successfully",
        "# TYPE dmx_engine_processed_total counter",
        f"dmx_engine_processed_total {context.metrics.processed}",
        "# HELP dmx_engine_deduped_total Commands deduplicated",
        "# TYPE dmx_engine_deduped_total counter",
        f"dmx_engine_deduped_total {context.metrics.deduped}",
        "# HELP dmx_core_dedup_hits_total Unified dedupe hits (alias of engine deduped)",
        "# TYPE dmx_core_dedup_hits_total counter",
        f"dmx_core_dedup_hits_total {context.metrics.deduped}",
        "# HELP dmx_engine_queue_depth Current engine queue depth",
        "# TYPE dmx_engine_queue_depth gauge",
        f"dmx_engine_queue_depth {context.engine.queue_depth() if context.engine else 0}",
        "# HELP dmx_ws_clients WebSocket clients connected",
        "# TYPE dmx_ws_clients gauge",
        f"dmx_ws_clients {await context.hub.count()}",
        "# HELP dmx_mqtt_connected MQTT connection state",
        "# TYPE dmx_mqtt_connected gauge",
        f"dmx_mqtt_connected {1 if context.mqtt_connected else 0}",
        "# HELP dmx_engine_last_latency_ms Last command latency in milliseconds",
        "# TYPE dmx_engine_last_latency_ms gauge",
        f"dmx_engine_last_latency_ms {context.metrics.last_latency_ms}",
    ]
    # Core metrics (new unified flow)
    metrics_lines.extend(context.core.prometheus_lines())
    return PlainTextResponse("\n".join(metrics_lines) + "\n")


@router.get("/universes/{universe}/frame")
async def get_universe_frame(universe: int, sacn: int = 0, context: AppContext = Depends(get_context)) -> Any:
    mgr = context.ola_manager
    if sacn == 1:
        frame = context.dmx.sacn_frame(universe)
        return {"universe": int(universe), "sacn": True, "frame": frame}
    if mgr is None:
        raise HTTPException(status_code=404, detail="ola manager disabled")
    frame = mgr.frame_snapshot(universe)
    # Resolve actual OLA universe mapping
    ola_universe = mgr.mapping.get(int(universe), int(universe))
    return {"universe": int(universe), "olaUniverse": ola_universe, "frame": frame}


@router.get("/sacn/sources")
async def sacn_sources(context: AppContext = Depends(get_context)) -> Any:
    receiver = None
    # find receiver task if attached
    # For simplicity, expose via context attributes if present
    # Here we return an empty list if not available
    sources: list[dict[str, Any]] = []
    try:
        # type: ignore[attr-defined]
        rec = getattr(context, "_sacn_receiver", None)
        receiver = rec
    except Exception:
        receiver = None
    if receiver is None:
        return sources
    now_ms = int(time.time() * 1000)
    for (uni, cid), s in list(receiver.sources.items()):
        sources.append({
            "universe": int(uni),
            "cid": cid.hex(),
            "priority": int(s.priority),
            "seq": int(s.last_seq),
            "lastSeenMs": int(now_ms - s.last_seen_ms),
            "active": True,
        })
    return sources


__all__ = ["router"]

# Fixtures endpoints (feature-flagged)
@router.get("/profiles")
async def get_profiles(context: AppContext = Depends(get_context)) -> Any:
    if not context.settings.fixtures_enabled:
        raise HTTPException(status_code=404, detail="fixtures disabled")
    out = []
    for pid, prof in (context.fixture_profiles or {}).items():
        out.append({"id": pid, "channels": [c.__dict__ for c in prof.channels], "defaults": prof.defaults})
    return out


@router.get("/fixtures")
async def get_fixtures(context: AppContext = Depends(get_context)) -> Any:
    if not context.settings.fixtures_enabled:
        raise HTTPException(status_code=404, detail="fixtures disabled")
    out = []
    for fid, inst in (context.fixture_instances or {}).items():
        out.append({
            "id": fid, "name": inst.name, "profile": inst.profile.id, "universe": inst.universe,
            "address": inst.address, "range": sorted(list(inst.occupied)), "attr_map": inst.attr_map,
        })
    return out


@router.post("/fixtures/reload")
async def fixtures_reload(context: AppContext = Depends(get_context)) -> Any:
    if not context.settings.fixtures_enabled:
        raise HTTPException(status_code=404, detail="fixtures disabled")
    from .fixtures.profiles import load_profiles
    from .fixtures.patch import load_patch
    try:
        profiles = load_profiles(context.settings.fixture_profiles_dir)
        instances = load_patch(context.settings.fixture_patch_file, profiles)
        context.fixture_profiles = profiles
        context.fixture_instances = instances
        context.core.fixture_reload_total = getattr(context.core, "fixture_reload_total", {})
        context.core.fixture_reload_total["ok"] = context.core.fixture_reload_total.get("ok", 0) + 1
        return {"status": "ok", "profiles": len(profiles), "fixtures": len(instances)}
    except Exception as exc:
        context.core.fixture_reload_total = getattr(context.core, "fixture_reload_total", {})
        context.core.fixture_reload_total["error"] = context.core.fixture_reload_total.get("error", 0) + 1
        # overlaps counter
        if "overlap" in str(exc):
            context.core.fixture_overlaps_total = getattr(context.core, "fixture_overlaps_total", 0) + 1
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/fixtures/dry-run")
async def fixtures_dry_run(body: dict[str, Any], context: AppContext = Depends(get_context)) -> Any:
    if not context.settings.fixtures_enabled:
        raise HTTPException(status_code=404, detail="fixtures disabled")
    fx = (context.fixture_instances or {}).get(str(body.get("fixtureId", "")))
    if fx is None:
        raise HTTPException(status_code=404, detail="fixture not found")
    items = resolve_attrs(fx, body.get("attrs", {}))
    return {"universe": fx.universe, "items": items}


@router.post("/fixture")
async def post_fixture(request: Request, context: AppContext = Depends(get_context)) -> Any:
    """Apply logical fixture.set via REST (feature-flagged)."""
    if not context.settings.fixtures_enabled:
        raise HTTPException(status_code=404, detail="fixtures disabled")
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="invalid json")
    # Validate against schema
    schema = _schemas._load("shared/schema/fixture.set.schema.json")
    fs_errors = sorted(schema.iter_errors(payload), key=lambda e: e.path)
    if fs_errors:
        return {
            "ack": payload.get("id"),
            "accepted": False,
            "reason": "VALIDATION_FAILED",
            "errors": [{"path": "/" + "/".join(map(str, e.path)), "msg": e.message} for e in fs_errors],
        }
    fx_id = str(payload.get("fixtureId"))
    inst = (context.fixture_instances or {}).get(fx_id)
    if inst is None:
        context.core.fixture_apply_total = getattr(context.core, "fixture_apply_total", {})
        key = ("error", "not_found")
        context.core.fixture_apply_total[key] = context.core.fixture_apply_total.get(key, 0) + 1
        return {"ack": payload.get("id"), "accepted": False, "reason": "not_found"}
    items = resolve_attrs(inst, payload.get("attrs", {}))
    # Attribute metrics
    context.core.fixture_attrs_total = getattr(context.core, "fixture_attrs_total", {})
    for k in (payload.get("attrs", {}) or {}).keys():
        context.core.fixture_attrs_total[k] = context.core.fixture_attrs_total.get(k, 0) + 1
    delta, rev, ts2 = context.dmx.apply_local_patch(inst.universe, items)
    if delta:
        await context.hub.send_payload({
            "type": "state.update",
            "rev": rev,
            "ts": ts2,
            "universe": inst.universe,
            "delta": delta,
            "full": False,
        })
        if context.ola_manager is not None:
            try:
                context.ola_manager.apply_patch(inst.universe, delta)
                await context.ola_manager.maybe_send(inst.universe)
            except Exception:
                pass
    context.core.fixture_apply_total = getattr(context.core, "fixture_apply_total", {})
    keyok = ("ok", "resolve")
    context.core.fixture_apply_total[keyok] = context.core.fixture_apply_total.get(keyok, 0) + 1
    return {"ack": payload.get("id"), "accepted": True}
