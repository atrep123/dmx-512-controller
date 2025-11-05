:: filepath: c:\Users\atrep\Desktop\DMX 2\dmx-512-controller\start-backend.bat
@echo off
title DMX Backend Server
echo Starting backend server on port 8080...
"C:\Users\atrep\AppData\Local\Programs\Python\Python313\python.exe" -m uvicorn server.app:app --reload --port 8080
pause