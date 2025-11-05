@echo off
setlocal

set "REPO=C:\Users\atrep\Desktop\DMX 2\dmx-512-controller"
set "PYTHON_312=C:\Users\atrep\AppData\Local\Programs\Python\Python312\python.exe"
set "PYTHON_313=C:\Users\atrep\AppData\Local\Programs\Python\Python313\python.exe"

if exist "%PYTHON_312%" (
    set "PYTHON_EXE=%PYTHON_312%"
) else if exist "%PYTHON_313%" (
    set "PYTHON_EXE=%PYTHON_313%"
) else (
    echo [ERROR] Nenalezen Python 3.12 ani 3.13.
    pause
    exit /b 1
)

cd /d "%REPO%"

echo Spoustim backend na http://127.0.0.1:8080 ...
echo (zavri okno pro ukonceni serveru)
echo.

"%PYTHON_EXE%" -m uvicorn server.app:app --reload --port 8080

pause
