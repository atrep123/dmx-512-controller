:: filepath: c:\Users\atrep\Desktop\DMX 2\dmx-512-controller\start-all.bat
@echo off
echo Starting DMX 512 Controller...
echo.

:: Start backend in new window
start "DMX Backend" cmd /k start-backend.bat

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

:: Start frontend in new window
start "DMX Frontend" cmd /k start-frontend.bat

:: Wait 5 seconds for frontend to start
timeout /t 5 /nobreak >nul

:: Open browser
echo Opening browser...
start http://localhost:5002/

echo.
echo DMX Controller is starting up!
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5002
echo.
pause