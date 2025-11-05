"""FastAPI routes and WebSocket handlers."""

from __future__ import annotations

import asyncio
import time
import json
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, PlainTextResponse, Response

from .context import AppContext
from .engine import Engine
from .models import CMD_SCHEMA, RESTCommand, RGBCommand, RGBState, WSSetMessage
from .util.schema import load_schemas
from .fixtures.mapper import resolve_attrs
from .util.ulid import ulid_from_string

_schemas = load_schemas()

router = APIRouter()
logger = logging.getLogger("api")


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
        schema = _schemas._load("shared/schema/fixture.set.schema.json")
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
    # Unified snapshot from DMX engine (default beze zmny), s volitelnm sparse pvskem a ETagem
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
            errors = sorted(_schemas.command().iter_errors(data), key=lambda e: e.path)
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
            typ = str(data.get("type"))
            # Fixture set (if enabled)
            if typ == "fixture.set" and context.settings.fixtures_enabled:
                schema = _schemas._load("shared/schema/fixture.set.schema.json")
                fs_errors = sorted(schema.iter_errors(data), key=lambda e: e.path)
                if fs_errors:
                    await websocket.send_text(json.dumps({
                        "ack": data.get("id"), "accepted": False, "reason": "VALIDATION_FAILED",
                        "errors": [{"path": "/" + "/".join(map(str, e.path)), "msg": e.message} for e in fs_errors],
                        "ts": int(time.time() * 1000),
                    }))
                    continue
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
                # Validate fade schema
                fade_errors = sorted(_schemas.fade().iter_errors(data), key=lambda e: e.path)
                if fade_errors:
                    ack = {
                        "ack": data.get("id"),
                        "accepted": False,
                        "reason": "VALIDATION_FAILED",
                        "errors": [
                            {"path": "/" + "/".join(map(str, e.path)), "msg": e.message} for e in fade_errors
                        ],
                        "ts": int(time.time() * 1000),
                    }
                    await websocket.send_text(json.dumps(ack))
                    context.core.inc_cmd("ws", typ, False)
                    continue
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
            accepted = True
            context.core.inc_cmd("ws", typ, True)
            ack = {"ack": data.get("id"), "accepted": True, "ts": int(time.time() * 1000)}
            await websocket.send_text(json.dumps(ack))
            context.core.observe_ack(int((time.perf_counter() - start) * 1000))
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
