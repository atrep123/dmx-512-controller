@echo off
setlocal

set "REPO=C:\Users\atrep\Desktop\DMX 2\dmx-512-controller"
set "PYTHON_312=C:\Users\atrep\AppData\Local\Programs\Python\Python312\python.exe"
set "PYTHON_313=C:\Users\atrep\AppData\Local\Programs\Python\Python313\python.exe"

if not exist "%REPO%\package.json" (
    echo [ERROR] Nenalezena slozka repa: "%REPO%"
    pause
    exit /b 1
)

if exist "%PYTHON_312%" (
    set "PYTHON_EXE=%PYTHON_312%"
) else if exist "%PYTHON_313%" (
    set "PYTHON_EXE=%PYTHON_313%"
) else (
    call :PrintPythonMissing
    pause
    exit /b 1
)

set "CARGO_DEFAULT_BIN=%USERPROFILE%\.cargo\bin"
set "VS_BUILD_TOOLS=C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Tools\MSVC"

where cargo >nul 2>&1
if errorlevel 1 (
    if exist "%CARGO_DEFAULT_BIN%\cargo.exe" (
        set "PATH=%PATH%;%CARGO_DEFAULT_BIN%"
    )
)

where cargo >nul 2>&1
if errorlevel 1 (
    set "CARGO_MISSING=1"
)

where link >nul 2>&1
if errorlevel 1 (
    set "LINK_MISSING=1"
)

if "%PYTHON_EXE%"=="%PYTHON_313%" (
    if defined LINK_MISSING (
        call :EnsureLink
        where link >nul 2>&1
        if errorlevel 1 (
            call :PrintLinkMissing
            pause
            exit /b 1
        )
    )
)

if "%PYTHON_EXE%"=="%PYTHON_313%" (
    if defined CARGO_MISSING (
        call :PrintCargoMissing
        pause
        exit /b 1
    )
)

cd /d "%REPO%"

for /f "delims=" %%I in ('"%PYTHON_EXE%" -c "import platform; print(platform.python_version())"') do set "PY_VERSION=%%I"
echo === Pouzity Python: %PYTHON_EXE% (verze %PY_VERSION%) ===

echo === Upgrade pip ===
"%PYTHON_EXE%" -m pip install --upgrade pip || goto :error

echo === Python dependencies ===
"%PYTHON_EXE%" -m pip install -r server\requirements.txt || goto :error

echo === Node dependencies (npm install --legacy-peer-deps) ===
npm install --legacy-peer-deps || goto :error

echo Hotovo.
pause
exit /b 0

:EnsureLink
set "LINK_DIR="
if exist "%VS_BUILD_TOOLS%" (
    for /f "delims=" %%L in ('dir /b /s "%VS_BUILD_TOOLS%\link.exe" 2^>nul') do (
        set "LINK_DIR=%%~dpL"
        goto :FoundLink
    )
)
if exist "%ProgramFiles(x86)%\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC" (
    for /f "delims=" %%L in ('dir /b /s "%ProgramFiles(x86)%\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\link.exe" 2^>nul') do (
        set "LINK_DIR=%%~dpL"
        goto :FoundLink
    )
)
:FoundLink
if defined LINK_DIR (
    set "PATH=%PATH%;%LINK_DIR%"
)
exit /b 0

:PrintPythonMissing
echo [ERROR] Nenalezen Python 3.12 ani 3.13.
echo   - Nainstaluj Python 3.12 (doporu?eno) nebo uprav cestu ve scriptu.
exit /b 0

:PrintLinkMissing
echo [ERROR] Python 3.13 vyzaduje MSVC linker (link.exe) pro kompilaci pydantic-core.
echo   - Nainstaluj "Microsoft Visual C++ Build Tools" (Desktop development with C++) nebo pouzij Python 3.12.
exit /b 0

:PrintCargoMissing
echo [ERROR] Rust/Cargo nebyl nalezen. Spust instalaci Rust toolchainu z https://rustup.rs/ nebo pouzij Python 3.12.
exit /b 0

:error
echo.
echo [ERROR] Instalace selhala. Zkontroluj hlasky vyse.
pause
exit /b 1
