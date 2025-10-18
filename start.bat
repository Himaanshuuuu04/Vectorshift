@echo off
REM Quick start script for Windows - Vectorshift Application
REM This script starts both the backend and frontend servers

echo.
echo 🚀 Starting Vectorshift Application...
echo.

REM Check for Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Python is not installed
    exit /b 1
)

REM Check for npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: npm is not installed
    exit /b 1
)

REM Start backend
echo 📦 Starting Backend Server (FastAPI)...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing backend dependencies...
pip install -q -r requirements.txt

REM Start backend in new window
echo Starting backend on http://localhost:8000
start "Backend Server" cmd /k "venv\Scripts\activate.bat && uvicorn main:app --reload --port 8000"

cd ..

REM Start frontend
echo.
echo 📦 Starting Frontend Server (React)...
cd frontend

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

REM Start frontend in new window
echo Starting frontend on http://localhost:3000
start "Frontend Server" cmd /k "npm start"

cd ..

echo.
echo ✅ Both servers are starting in separate windows!
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Close the server windows to stop the application
echo.

pause
