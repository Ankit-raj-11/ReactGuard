# 🚀 ReactGuard — Complete Deployment Guide

This guide covers deploying the entire ReactGuard system: smart contracts, backend API, and frontend dashboard.

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- A wallet with Somnia testnet STT tokens (≥32 STT for subscription)
- GitHub account (for hosting deployments)

---

## 🔧 1. Local Development Setup

### A. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd ReactGuard

# Install root dependencies (for smart contracts)
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### B. Environment Configuration

1. **Root `.env` file** (for smart contracts):
```env
# Your wallet private key (needs STT for gas)
PRIVATE_KEY=0xYourPrivateKeyHere

# Somnia Testnet
SOMNIA_RPC_URL=https://dream-rpc.somnia.network

# Contract addresses (will be populated after deployment)
ORACLE_ADDRESS=
REACTGUARD_ADDRESS=
POOL_ADDRESS=

# Frontend vars (Vite prefix)
VITE_RPC_URL=https://dream-rpc.somnia.network
VITE_ORACLE_ADDRESS=
VITE_REACTGUARD_ADDRESS=
VITE_POOL_ADDRESS=
```

2. **Backend `.env` file** (`backend/.env`):
```env
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
PRIVATE_KEY=0xYourPrivateKeyHere

# Contract addresses (will be populated after deployment)
ORACLE_ADDRESS=
REACTGUARD_ADDRESS=
POOL_ADDRESS=

# Server configuration
DEMO_PORT=3001
WS_PORT=8080
```

3. **Frontend `.env` file** (`frontend/.env`):
```env
VITE_RPC_URL=https://dream-rpc.somnia.network
VITE_ORACLE_ADDRESS=
VITE_REACTGUARD_ADDRESS=
VITE_POOL_ADDRESS=
VITE_BACKEND_URL=http://localhost:3001
```

---

## ⛓️ 2. Smart Contract Deployment

### A. Deploy Contracts to Somnia Testnet

```bash
# Compile contracts
npx hardhat compile

# Deploy to Somnia testnet
npx hardhat run scripts/deploy.js --network somnia
```

This will:
- Deploy MockOracle, ReactGuard, and MockLendingPool contracts
- Automatically update all `.env` files with contract addresses
- Display deployment summary

### B. Setup Somnia Reactivity Subscription

```bash
# Create the on-chain subscription (requires ≥32 STT)
npx hardhat run scripts/setup-subscription.js --network somnia
```

This creates the subscription that allows Somnia validators to automatically trigger ReactGuard when price drops occur.

### C. Verify Deployment

```bash
# Check system status
npx hardhat run scripts/check-status.js --network somnia

# Test the system
npx hardhat run scripts/simulate-attack.js --network somnia
```

---

## 🖥️ 3. Backend Deployment

The backend is a Node.js Express API that provides "zero-click" demo functionality.

### Option A: Deploy to Render (Recommended)

1. **Push to GitHub**: Ensure your code is in a GitHub repository

2. **Deploy to Render**:
   - Go to [render.com](https://render.com) and sign up
   - Click **New +** → **Web Service**
   - Connect your GitHub repository
   - Configure:
     - **Name**: `reactguard-backend`
     - **Root Directory**: `backend`
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `node demo-server.js`
     - **Plan**: Free

3. **Set Environment Variables** in Render dashboard:
   ```
   SOMNIA_RPC_URL=https://dream-rpc.somnia.network
   PRIVATE_KEY=0xYourPrivateKeyHere
   ORACLE_ADDRESS=0x3B24D72964eB7D148dB1c77BA5E8E05A3e4a71Df
   REACTGUARD_ADDRESS=0x95Cc0Edf7DA5EC63471CD8C57bA5899423CC2CEA
   POOL_ADDRESS=0x027E3FA613Db4d06B65555215fC35A7dDEAe6BDA
   DEMO_PORT=3001
   ```

4. **Deploy**: Render will build and deploy your API
   - You'll get a URL like `https://reactguard-backend.onrender.com`
   - Save this URL for frontend configuration

### Option B: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Select `backend` folder as root
4. Add the same environment variables as above
5. Deploy

### Option C: Local Development

```bash
cd backend
npm start
# Backend runs on http://localhost:3001
```

---

## 🎨 4. Frontend Deployment

The frontend is a React/Vite application that provides the dashboard interface.

### Option A: Deploy to Vercel (Recommended)

1. **Update Frontend Environment**:
   Update `frontend/.env` with your backend URL:
   ```env
   VITE_RPC_URL=https://dream-rpc.somnia.network
   VITE_ORACLE_ADDRESS=0x3B24D72964eB7D148dB1c77BA5E8E05A3e4a71Df
   VITE_REACTGUARD_ADDRESS=0x95Cc0Edf7DA5EC63471CD8C57bA5899423CC2CEA
   VITE_POOL_ADDRESS=0x027E3FA613Db4d06B65555215fC35A7dDEAe6BDA
   VITE_BACKEND_URL=https://reactguard-backend.onrender.com
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign up
   - Click **Add New** → **Project**
   - Import your GitHub repository
   - Configure:
     - **Project Name**: `reactguard-dashboard`
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`

3. **Set Environment Variables** in Vercel dashboard:
   ```
   VITE_RPC_URL=https://dream-rpc.somnia.network
   VITE_ORACLE_ADDRESS=0x3B24D72964eB7D148dB1c77BA5E8E05A3e4a71Df
   VITE_REACTGUARD_ADDRESS=0x95Cc0Edf7DA5EC63471CD8C57bA5899423CC2CEA
   VITE_POOL_ADDRESS=0x027E3FA613Db4d06B65555215fC35A7dDEAe6BDA
   VITE_BACKEND_URL=https://reactguard-backend.onrender.com
   ```

4. **Deploy**: Vercel will build and deploy your frontend
   - You'll get a URL like `https://reactguard-dashboard.vercel.app`

### Option B: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Set build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. Add the same environment variables as above

### Option C: Local Development

```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🧪 5. Testing the Complete System

### A. Local Testing

1. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Attack Simulation**:
   - Open http://localhost:5173
   - Click "Simulate Attack"
   - Verify the system responds and pauses the pool

### B. Production Testing

1. Visit your deployed frontend URL
2. Check that all contract data loads correctly
3. Test the attack simulation
4. Verify the system works end-to-end

---

## 📁 6. Project Structure Summary

```
ReactGuard/
├── contracts/           # Smart contracts (Solidity)
│   ├── MockOracle.sol
│   ├── ReactGuard.sol
│   └── MockLendingPool.sol
├── scripts/            # Deployment and utility scripts
│   ├── deploy.js
│   ├── setup-subscription.js
│   └── simulate-attack.js
├── backend/            # Node.js Express API
│   ├── demo-server.js  # Main API server
│   └── package.json
├── frontend/           # React/Vite dashboard
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── .env               # Environment configuration
```

---

## 🔄 7. Deployment Workflow

1. **Deploy Smart Contracts** → Somnia Testnet
2. **Setup Reactivity Subscription** → On-chain subscription
3. **Deploy Backend** → Render/Railway (Node.js hosting)
4. **Deploy Frontend** → Vercel/Netlify (Static hosting)
5. **Test Complete System** → End-to-end verification

---

## 🚨 8. Important Notes

- **Private Keys**: Never commit private keys to Git. Use environment variables.
- **Contract Addresses**: Update all `.env` files after contract deployment.
- **CORS**: Backend includes CORS headers for frontend communication.
- **Fallback System**: Backend includes fallback if Somnia Reactivity doesn't respond.
- **Zero-Click Demo**: Backend auto-signs transactions for smooth demo experience.

---

## 🏆 9. Production Checklist

- [ ] Smart contracts deployed to Somnia testnet
- [ ] Reactivity subscription active (≥32 STT required)
- [ ] Backend deployed with secure environment variables
- [ ] Frontend deployed with correct backend URL
- [ ] End-to-end attack simulation working
- [ ] All contract addresses updated in environment files
- [ ] System status check passes

Your ReactGuard system is now ready for production! 🎉
