#!/bin/bash

echo "🚀 Setting up ReactGuard Backend"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 18+."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file from template..."
    cp .env.example .env 2>/dev/null || echo "# Backend Environment Variables
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
ORACLE_ADDRESS=
REACTGUARD_ADDRESS=
POOL_ADDRESS=
DEMO_PORT=3001" > .env
    echo "📝 Please edit backend/.env and add your PRIVATE_KEY and contract addresses"
fi

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "To start the backend:"
echo "  cd backend"
echo "  npm start"
echo ""
echo "The backend will run on http://localhost:3001"