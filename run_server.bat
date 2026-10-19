@echo off
set PORT=8000
echo ========================================================
echo   Nightwalker Local Preview Server
echo ========================================================
echo.
echo   Opening http://localhost:%PORT% in your default browser...
echo   Press Ctrl+C to stop the server.
echo.
start http://localhost:%PORT%
python -m http.server %PORT%
