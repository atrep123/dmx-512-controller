import asyncio, contextlib, json, socket, threading, time
import requests, websockets, uvicorn

from server.app import create_app

def free_port():
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]

port = free_port()
config = uvicorn.Config("server.app:create_app", host="127.0.0.1", port=port, log_level="warning", factory=True)
server = uvicorn.Server(config)
th = threading.Thread(target=server.run, daemon=True)
th.start()

base = f"http://127.0.0.1:{port}"
for _ in range(100):
    try:
        r = requests.get(f"{base}/healthz", timeout=0.2)
        if r.status_code == 200:
            break
    except Exception:
        pass
    time.sleep(0.05)

async def main():
    uri = base.replace('http','ws') + '/ws?token=demo-key'
    async with websockets.connect(uri, ping_timeout=5) as ws:
        for _ in range(2):
            try:
                await asyncio.wait_for(ws.recv(), timeout=1)
            except asyncio.TimeoutError:
                break
        await ws.send(json.dumps({
            "type": "dmx.patch",
            "id": "ws-m",
            "ts": 0,
            "universe": 0,
            "patch": [{"ch": 1, "val": 123}],
        }))
        ack = await ws.recv()
        print('ack', ack)

asyncio.run(main())
metrics = requests.get(f"{base}/metrics", timeout=2).text
for line in metrics.splitlines():
    if 'dmx_core_cmds_total' in line:
        print(line)
server.should_exit = True
th.join(timeout=5)
