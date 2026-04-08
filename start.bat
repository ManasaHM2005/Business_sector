@echo off
echo Starting AI Campus Brain Hackathon Project...

echo Starting Backend Server (FastAPI)...
start cmd /k "cd backend && call ..\venv\Scripts\activate.bat 2>nul || title Backend API && uvicorn main:app --reload"

echo Starting Frontend Server...
start cmd /k "cd frontend && title Frontend UI && python -m http.server 3000"

echo Servers are initializing!
echo [API]  http://127.0.0.1:8000
echo [PAGE] http://127.0.0.1:3000

echo Opening the application in your default web browser...
timeout /t 3 >nul
start http://127.0.0.1:3000
