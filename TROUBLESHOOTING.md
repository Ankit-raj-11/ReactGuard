# 🔧 ReactGuard Troubleshooting Guide

## Common Issues and Solutions

### 1. "Module not found: dotenv" Error

**Problem**: Backend fails to start with `Error: Cannot find module 'dotenv'`

**Solution**:
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# If still failing, install dotenv specifically
npm install dotenv

# Start the backend
npm start
```

### 2. "Module not found: ethers" Error

**Problem**: Backend fails with `Error: Cannot find module 'ethers'`

**Solution**:
```bash
cd backend
npm install ethers express dotenv
npm start
```

### 3. Backend Setup Script

**For your friend to run**:

**Windows**:
```cmd
setup-backend.bat
```

**Linux/Mac**:
```bash
chmod +x setup-backend.sh
./setup-backend.sh
```

### 4. Manual Backend Setup

If scripts don't work, do this manually:

```bash
# 1. Navigate to backend
cd backend

# 2. Install all dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Edit .env file with your values
# Add your PRIVATE_KEY and contract addresses

# 5. Start the backend
npm start
```

### 5. Environment Variables Missing

**Problem**: Backend starts but shows "Missing contract addresses"

**Solution**: Update `backend/.env` with:
```env
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
PRIVATE_KEY=0xYourPrivateKeyHere
ORACLE_ADDRESS=0x3B24D72964eB7D148dB1c77BA5E8E05A3e4a71Df
REACTGUARD_ADDRESS=0x95Cc0Edf7DA5EC63471CD8C57bA5899423CC2CEA
POOL_ADDRESS=0x027E3FA613Db4d06B65555215fC35A7dDEAe6BDA
DEMO_PORT=3001
```

### 6. Port Already in Use

**Problem**: `Error: listen EADDRINUSE :::3001`

**Solution**:
```bash
# Kill process using port 3001
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# Linux/Mac:
lsof -ti:3001 | xargs kill -9

# Or use a different port
# Edit backend/.env and change DEMO_PORT=3002
```

### 7. Node.js Version Issues

**Problem**: Syntax errors or module import issues

**Solution**: Ensure Node.js 18+ is installed
```bash
node -v  # Should show v18.x.x or higher

# If older version, update Node.js from https://nodejs.org
```

### 8. Frontend Not Connecting to Backend

**Problem**: Frontend shows connection errors

**Solution**: Update `frontend/.env`:
```env
VITE_BACKEND_URL=http://localhost:3001
```

### 9. Smart Contracts Not Deployed

**Problem**: Backend shows "Contract not found" errors

**Solution**: Deploy contracts first:
```bash
# From root directory
npx hardhat run scripts/deploy.js --network somnia
npx hardhat run scripts/setup-subscription.js --network somnia
```

### 10. Complete Fresh Setup

If everything fails, start fresh:

```bash
# 1. Clone the repo
git clone <repo-url>
cd ReactGuard

# 2. Install root dependencies
npm install

# 3. Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your values
cd ..

# 4. Setup frontend
cd frontend
npm install
cp .env.example .env
# Edit .env with your values
cd ..

# 5. Deploy contracts (if not done)
npx hardhat run scripts/deploy.js --network somnia

# 6. Start backend
cd backend
npm start

# 7. Start frontend (new terminal)
cd frontend
npm run dev
```

## Quick Verification

After setup, verify everything works:

1. **Backend**: Visit http://localhost:3001/demo/status
2. **Frontend**: Visit http://localhost:5173
3. **Contracts**: Run `npx hardhat run scripts/check-status.js --network somnia`

## Getting Help

If issues persist:
1. Check Node.js version: `node -v` (need 18+)
2. Check if ports are free: `netstat -an | grep 3001`
3. Check .env files have correct values
4. Try running each component separately

## Dependencies Summary

**Root**:
- hardhat
- ethers
- @somnia-chain/reactivity-contracts

**Backend**:
- dotenv
- ethers
- express

**Frontend**:
- react
- vite
- ethers