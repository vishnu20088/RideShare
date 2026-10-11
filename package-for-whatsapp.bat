@echo off
echo ========================================================
echo   RideHub - Packaging Project for WhatsApp Sharing
echo ========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0package-for-whatsapp.ps1"
echo.
pause
