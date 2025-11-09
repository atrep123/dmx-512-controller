# -*- mode: python ; coding: utf-8 -*-

import os
from pathlib import Path
from PyInstaller.utils.hooks import collect_submodules


def _candidate_roots() -> list[Path]:
    """Return possible repo roots in priority order."""
    candidates: list[Path] = []
    env_root = os.environ.get("DMX_PROJECT_ROOT")
    if env_root:
        candidates.append(Path(env_root))
    spec_file = globals().get("__file__")
    if spec_file:
        try:
            candidates.append(Path(spec_file).resolve().parents[1])
        except Exception:
            pass
    candidates.append(Path.cwd())
    return candidates


def _ensure_server_root() -> Path:
    for root in _candidate_roots():
        server_dir = root / "server"
        if server_dir.exists():
            return root
    raise RuntimeError("Unable to locate repo root (set DMX_PROJECT_ROOT before invoking PyInstaller).")


def _locate_config_dir(repo_root: Path) -> Path:
    """Prefer server/config but fall back to repo-level config/."""
    for rel in (("server", "config"), ("config",)):
        candidate = repo_root.joinpath(*rel)
        if candidate.exists():
            return candidate
    raise FileNotFoundError(
        f"Missing config assets. Expected one of: {repo_root / 'server' / 'config'} or {repo_root / 'config'}."
    )


def _require_dir(path: Path, description: str) -> Path:
    if not path.exists():
        raise FileNotFoundError(f"Missing {description}: {path}")
    return path


repo_root = _ensure_server_root()
project_dir = repo_root / "server"
config_dir = _locate_config_dir(repo_root)
schemas_dir = _require_dir(project_dir / "schemas", "schemas directory")

datas = [
    (str(schemas_dir), "schemas"),
    (str(config_dir), "config"),
]

hiddenimports = []
for pkg in ("uvicorn", "pydantic_settings", "asyncio_mqtt", "anyio", "jsonschema"):
    hiddenimports += collect_submodules(pkg)

block_cipher = None


a = Analysis(
    [str(project_dir / "run_desktop.py")],
    pathex=[str(project_dir)],
    binaries=[],
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)
exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name="dmx-backend",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
