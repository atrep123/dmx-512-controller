:: filepath: c:\Users\atrep\Desktop\DMX 2\dmx-512-controller\install-dependencies.bat
@echo off
echo Installing backend dependencies...
"C:\Users\atrep\AppData\Local\Programs\Python\Python313\python.exe" -m pip install --upgrade pip
"C:\Users\atrep\AppData\Local\Programs\Python\Python313\python.exe" -m pip install -r server/requirements.txt
echo.
echo Dependencies installed successfully!
pause