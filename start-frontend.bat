:: filepath: c:\Users\atrep\Desktop\DMX 2\dmx-512-controller\start-frontend.bat
@echo off
title DMX Frontend Server
echo Starting frontend server on port 5002...
npm run dev -- --host --port 5002
pause