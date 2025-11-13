@echo off
chcp 65001 >nul
setlocal ENABLEDELAYEDEXPANSION

set "PORT=8080"
if not "%~1"=="" set "PORT=%~1"

set "SCRIPT_DIR=%~dp0"
set "VENV_DIR=%SCRIPT_DIR%.venv"

set "PYTHON_CMD="
if exist "%VENV_DIR%\Scripts\python.exe" set "PYTHON_CMD=%VENV_DIR%\Scripts\python.exe"
if exist "%VENV_DIR%\bin\python" set "PYTHON_CMD=%VENV_DIR%\bin\python"

if not defined PYTHON_CMD set "PYTHON_CMD=%PYTHON%"
if not defined PYTHON_CMD set "PYTHON_CMD=%PY%"

if not defined PYTHON_CMD (
    for %%C in (python python3 py) do (
        where %%C >nul 2>&1
        if not errorlevel 1 (
            set "PYTHON_CMD=%%C"
            goto :foundPython
        )
    )
)

:foundPython
if not defined PYTHON_CMD (
    echo [backend] Nenalezeno Python prostredi. Nastav promennou PYTHON nebo nainstaluj Python 3.11+.
    goto :end
)

pushd "%SCRIPT_DIR%"
set "PYTHONPATH=%SCRIPT_DIR%"
echo [backend] Startuji FastAPI server na http://localhost:%PORT% ...
"%PYTHON_CMD%" -m uvicorn server.app:app --host 0.0.0.0 --port %PORT% --reload
popd

:end
echo.
pause
endlocal
