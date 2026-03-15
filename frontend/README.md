# Frontend — ReactGuard Dashboard

## Setup

```bash
cp .env.example .env
# Fill in the contract addresses from deploy.js output
npm install
npm run dev
```

## Environment Variables

| Variable | Source |
|---|---|
| `VITE_ORACLE_ADDRESS` | Printed by `deploy.js` |
| `VITE_REACTGUARD_ADDRESS` | Printed by `deploy.js` |
| `VITE_POOL_ADDRESS` | Printed by `deploy.js` |
| `VITE_RPC_URL` | Somnia RPC (default pre-filled) |
