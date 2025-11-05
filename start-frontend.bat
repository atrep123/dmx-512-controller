@echo off
set "REPO=C:\Users\atrep\Desktop\DMX 2\dmx-512-controller"
cd /d "%REPO%"

echo Spoustim Vite dev server na http://localhost:5002 ...
echo (ponech okno otevrene pro beh serveru)
echo.

npm run dev -- --host --port 5002

pause
