@echo off
setlocal

REM Usage: scripts\build-server-exe.bat

pushd %~dp0\..
if not exist .venv (
    echo [i] Consider creating a virtualenv to keep build deps isolated.
)

echo [1/3] Installing backend dependencies (including PyInstaller)...
python -m pip install --upgrade pip >nul
python -m pip install -r server/requirements.txt

echo [2/3] Building PyInstaller onefile bundle...
pyinstaller --noconfirm --onefile --clean server/desktop.spec
if errorlevel 1 (
    echo Build failed.
    popd
    exit /b 1
)

set "DESKTOP_BIN=desktop\src-tauri\resources\bin"
if not exist "%DESKTOP_BIN%" (
    mkdir "%DESKTOP_BIN%"
)
echo [3/3] Copying payload into %DESKTOP_BIN%\dmx-backend.exe
copy /Y server\dist\dmx-backend.exe "%DESKTOP_BIN%\dmx-backend.exe" >nul
if errorlevel 1 (
    echo Failed to copy backend into desktop resources.
    popd
    exit /b 1
)
echo [done] PyInstaller artifact ready at server\dist\dmx-backend.exe and synced for Tauri sidecar.
popd
exit /b 0
