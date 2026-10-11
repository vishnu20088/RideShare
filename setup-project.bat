@echo off
echo ========================================================
echo   RideHub - Initial Project Setup
echo ========================================================
echo.
echo Step 1: Checking Java version...
java -version
if %errorlevel% neq 0 (
    echo [ERROR] Java 17 or Java 21 is required but not found in PATH!
    echo Please install Java 21 from: https://adoptium.net/
    pause
    exit /b 1
)

echo.
echo Step 2: Checking Node.js version...
node -v
if %errorlevel% neq 0 (
    echo [ERROR] Node.js 18+ is required but not found in PATH!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Step 3: Installing Frontend Dependencies...
cd "%~dp0frontend"
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies.
    pause
    exit /b 1
)
cd "%~dp0"

echo.
echo ========================================================
echo   SETUP COMPLETED SUCCESSFULLY!
echo ========================================================
echo.
echo Next steps:
echo 1. Double-click "start-backend.bat" to start the Java API
echo 2. Double-click "start-frontend.bat" to start the Web App
echo 3. Open http://localhost:5173 in your browser!
echo.
pause
