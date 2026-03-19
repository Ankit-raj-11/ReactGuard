@echo off
REM ReactGuard Complete Deployment Script for Windows
REM This script deploys the entire ReactGuard system step by step

echo 🚀 ReactGuard Complete Deployment
echo ==================================

REM Check if .env exists
if not exist ".env" (
    echo ❌ .env file not found. Please create it with your PRIVATE_KEY first.
    exit /b 1
)

REM Step 1: Install dependencies
echo 📦 Installing dependencies...
call npm install
cd backend && call npm install && cd ..
cd frontend && call npm install && cd ..

REM Step 2: Compile contracts
echo 🔨 Compiling smart contracts...
call npx hardhat compile

REM Step 3: Deploy contracts
echo ⛓️  Deploying contracts to Somnia testnet...
call npx hardhat run scripts/deploy.js --network somnia

REM Step 4: Setup subscription
echo 📡 Setting up Somnia Reactivity subscription...
call npx hardhat run scripts/setup-subscription.js --network somnia

REM Step 5: Verify deployment
echo 🔍 Verifying deployment...
call npx hardhat run scripts/check-status.js --network somnia

REM Step 6: Test system
echo 🧪 Testing system with attack simulation...
call npx hardhat run scripts/simulate-attack.js --network somnia

echo.
echo ✅ Smart contracts deployed successfully!
echo.
echo Next steps:
echo 1. Deploy backend to Render/Railway using the backend/ folder
echo 2. Deploy frontend to Vercel/Netlify using the frontend/ folder
echo 3. Update VITE_BACKEND_URL in frontend/.env with your backend URL
echo.
echo See DEPLOYMENT_GUIDE.md for detailed instructions.