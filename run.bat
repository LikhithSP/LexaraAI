@echo off
echo Starting MyGPT Clone with Gemini API...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Check if requirements are installed
echo Checking dependencies...
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if .env file exists and has API key
if not exist ".env" (
    echo Error: .env file not found
    echo Please create a .env file with your Gemini API key
    pause
    exit /b 1
)

findstr /c:"GEMINI_API_KEY" .env >nul
if errorlevel 1 (
    echo Warning: Please configure your GEMINI_API_KEY in the .env file
    pause
)

echo.
echo Starting server at http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

python main.py
