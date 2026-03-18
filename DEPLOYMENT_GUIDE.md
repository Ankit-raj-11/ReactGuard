# 🚀 ReactGuard — Web Application Deployment Guide

Your smart contracts are already successfully deployed on the Somnia Testnet and the on-chain subscription is active. This guide details how to deploy the **off-chain infrastructure** (Frontend and Backend) to production hosting services so that the public can interact with your hackathon project over the web.

We recommend **Vercel** for the React frontend, and **Render** (or Railway/Heroku) for the Node.js backend.

---

## 🏗️ 1. Deploying the Backend (Render)

The backend is an Express API that securely stores your `PRIVATE_KEY` and signs the "Zero-Click" demo attack and reset transactions. **It must be hosted on a secure Node.js server (like Render, Railway, or Heroku), not a static site host like Vercel.**

We will use [Render.com](https://render.com) because it offers a generous free tier for Node.js Web Services.

### A. Prepare the Backend Code
Ensure your backend has a `start` script in its `package.json`:
```json
// backend/package.json
"scripts": {
  "start": "node demo-server.js",
  "demo": "node --env-file=../.env demo-server.js"
}
```

### B. Deploy to Render
1. Push your entire `ReactGuard` repository to GitHub.
2. Sign up and log in to [Render.com](https://render.com).
3. Click **New +** and select **Web Service**.
4. Connect your GitHub account and select your `ReactGuard` repository.
5. **Configure the Service:**
   - **Name:** `reactguard-api`
   - **Root Directory:** `backend` (⚠️ Crucial: This tells Render to only look in the backend folder).
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
6. **Set Environment Variables:**
   Under "Environment Variables", click "Add Environment Variable" and securely input the following:
   - `PRIVATE_KEY` = `0xYourPrivateKeyHere`
   - `SOMNIA_RPC_URL` = `https://dream-rpc.somnia.network`
   - `ORACLE_ADDRESS` = `0xE5b2AD1558949447eD7b135ceB40baA894f417A1`
   - `REACTGUARD_ADDRESS` = `0x654Af00Ef47437911d52D12A88085E8f65b0F940`
   - `POOL_ADDRESS` = `0xA8DC52496d077E823675F114f2D8469C7a6E97d8`
7. Click **Create Web Service**. 
   - Render will build and deploy your API. Once finished, you will get a URL like `https://reactguard-api.onrender.com`. Save this URL.

---

## 🎨 2. Deploying the Frontend (Vercel)

The frontend is a static React application built with Vite. **Vercel** is the best and easiest platform for this.

Before deploying the frontend, you must tell it where your newly deployed backend lives.

### A. Update the Frontend Source Code (Temporary Step for Production)
In your local code, find where the frontend makes API requests to the backend (in `frontend/src/App.jsx`). You'll need to change the API URL from `http://localhost:3001` to your new Render URL.

1. Open `frontend/src/App.jsx`.
2. Locate the API URL variable (often defined near the top or inside the `simulateAttack` and `resetDemo` functions).
3. Change it to use an environment variable:
   ```javascript
   const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
   ```
4. Commit and push this change to GitHub.

### B. Deploy to Vercel
1. Sign up and log in to [Vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your `ReactGuard` GitHub repository.
4. **Configure the Project:**
   - **Project Name:** `reactguard-dashboard`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Edit this and select the `frontend` folder (⚠️ Crucial).
5. **Set Environment Variables:**
   Expand the "Environment Variables" tab and add the following:
   - `VITE_RPC_URL` = `https://dream-rpc.somnia.network`
   - `VITE_ORACLE_ADDRESS` = `0xE5b2AD1558949447eD7b135ceB40baA894f417A1`
   - `VITE_REACTGUARD_ADDRESS` = `0x654Af00Ef47437911d52D12A88085E8f65b0F940`
   - `VITE_POOL_ADDRESS` = `0xA8DC52496d077E823675F114f2D8469C7a6E97d8`
   - `VITE_BACKEND_URL` = `https://reactguard-api.onrender.com` (Use the actual URL you got from Render in Step 1).
6. Click **Deploy**.
   - Vercel will install dependencies, build the Vite app, and deploy it to a live global URL (e.g., `https://reactguard.vercel.app`).

---

## 🏁 3. Testing the Live App

1. Visit your new Vercel URL (e.g., `https://reactguard.vercel.app`).
2. The Dashboard should load and show real-time on-chain data (it connects directly to the Somnia RPC).
3. Click **"Simulate Attack"**.
   - The frontend will send a request to your Render API.
   - The Render API will securely sign the transaction and send it to Somnia.
   - The Blockchain will trigger ReactGuard.
   - The Frontend will detect the defense and update the UI.

Congratulations! Your ReactGuard application is now live on the internet and ready to be judged! 🏆
