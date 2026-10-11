@echo off
echo ========================================================
echo   RideHub - Starting React Frontend Web App
echo ========================================================
echo.
cd "%~dp0frontend"

if not exist "node_modules\" (
    echo [INFO] node_modules not detected. Running npm install first...
    call npm install
)

echo [INFO] Launching Vite Dev Server...
call npm run dev

pause
