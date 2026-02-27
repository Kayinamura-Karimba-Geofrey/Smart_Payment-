@echo off
echo Starting EdgeWallet RFID System...

start cmd /k "cd backend && npm install && npm run dev"
timeout /t 5
start cmd /k "cd frontend && npm install && npm start"

echo.
echo System starting!
echo Backend: http://localhost:8265
echo Frontend: http://localhost:8256
pause
