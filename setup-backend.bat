@echo off
echo 🚀 Setting up ReactGuard Backend
echo ================================

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js detected
node -v

REM Navigate to backend directory
cd backend

REM Install dependencies
echo 📦 Installing backend dependencies...
call npm install

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  Creating .env file from template...
    echo # Backend Environment Variables > .env
    echo SOMNIA_RPC_URL=https://dream-rpc.somnia.network >> .env
    echo PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE >> .env
    echo ORACLE_ADDRESS= >> .env
    echo REACTGUARD_ADDRESS= >> .env
    echo POOL_ADDRESS= >> .env
    echo DEMO_PORT=3001 >> .env
    echo 📝 Please edit backend/.env and add your PRIVATE_KEY and contract addresses
)

echo.
echo ✅ Backend setup complete!
echo.
echo To start the backend:
echo   cd backend
echo   npm start
echo.
echo The backend will run on http://localhost:3001
pause