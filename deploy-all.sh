#!/bin/bash

# ReactGuard Complete Deployment Script
# This script deploys the entire ReactGuard system step by step

echo "🚀 ReactGuard Complete Deployment"
echo "=================================="

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it with your PRIVATE_KEY first."
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Step 2: Compile contracts
echo "🔨 Compiling smart contracts..."
npx hardhat compile

# Step 3: Deploy contracts
echo "⛓️  Deploying contracts to Somnia testnet..."
npx hardhat run scripts/deploy.js --network somnia

# Step 4: Setup subscription
echo "📡 Setting up Somnia Reactivity subscription..."
npx hardhat run scripts/setup-subscription.js --network somnia

# Step 5: Verify deployment
echo "🔍 Verifying deployment..."
npx hardhat run scripts/check-status.js --network somnia

# Step 6: Test system
echo "🧪 Testing system with attack simulation..."
npx hardhat run scripts/simulate-attack.js --network somnia

echo ""
echo "✅ Smart contracts deployed successfully!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Render/Railway using the backend/ folder"
echo "2. Deploy frontend to Vercel/Netlify using the frontend/ folder"
echo "3. Update VITE_BACKEND_URL in frontend/.env with your backend URL"
echo ""
echo "See DEPLOYMENT_GUIDE.md for detailed instructions."