@echo off
echo ======================================================================
echo   Starting House Price Intelligence ^& Prediction Platform
echo ======================================================================

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

if exist "%SCRIPT_DIR%.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%SCRIPT_DIR%.venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

echo Starting Backend on http://localhost:8000 and Frontend on http://localhost:3000...
"%PYTHON_EXE%" run.py
pause
