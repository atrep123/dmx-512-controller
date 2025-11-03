"""FastAPI routes and WebSocket handlers."""

from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, PlainTextResponse

from .context import AppContext
from .engine import Engine
from .models import CMD_SCHEMA, RESTCommand, RGBCommand, RGBState, WSSetMessage

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
        while True:
            data = await websocket.receive_text()
            message = WSSetMessage.model_validate(json.loads(data))
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
    return PlainTextResponse("\n".join(metrics_lines) + "\n")


__all__ = ["router"]
