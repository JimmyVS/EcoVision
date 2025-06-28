@echo off

SET "PROJECT_DIR=%~dp0"
SET "PROJECT_DIR=%PROJECT_DIR:~0,-1%"  REM Remove trailing backslash if needed

cd /d "%PROJECT_DIR%"

echo Starting Flask Backend Server (Port 5000)...
start "EcoVision Backend" cmd /k "python server.py --host=0.0.0.0 --port=5000"

echo Giving backend a moment to start...
timeout /t 5 /nobreak >nul

cd /d "%PROJECT_DIR%\templates"

echo Starting Frontend HTTP Server (Port 8000)...
start "EcoVision Frontend" cmd /k "python -m http.server 8000 --bind 0.0.0.0"

echo Giving frontend a moment to start...
timeout /t 3 /nobreak >nul

FOR /F "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4 Address"') do SET "LOCAL_IP=%%a"
SETLOCAL EnableDelayedExpansion
SET "LOCAL_IP=!LOCAL_IP: =!"

echo Opening EcoVision in your browser...
start http://!LOCAL_IP!:8000/

echo.
echo All components of EcoVision should now be running.
echo Access it at: http://!LOCAL_IP!:8000 on this network.
echo This window will close in 10 seconds...
timeout /t 10 >nul
exit
