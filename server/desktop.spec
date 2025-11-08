# -*- mode: python ; coding: utf-8 -*-

from pathlib import Path
from PyInstaller.utils.hooks import collect_submodules

project_dir = Path(__file__).resolve().parent

datas = [
    (str(project_dir / "schemas"), "schemas"),
    (str(project_dir / "config"), "config"),
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
