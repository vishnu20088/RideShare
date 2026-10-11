@echo off
echo ========================================================
echo   RideHub - Starting Spring Boot Backend
echo ========================================================
echo.
cd "%~dp0backend"

:: If pre-compiled jar exists in target, run it directly for instant startup
if exist "target\ridehub-backend-1.0.0.jar" (
    echo [INFO] Starting pre-compiled RideHub backend JAR...
    java -jar target\ridehub-backend-1.0.0.jar
) else (
    echo [INFO] Running via Maven Wrapper...
    call mvnw.cmd spring-boot:run
)

pause
