
<div align="center">

![Stasis](https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,50:1e3a5f,100:0ea5e9&height=200&section=header&text=Stasis&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Autonomous%20On-Chain%20DeFi%20Guardian&descAlignY=60&descColor=94d2ff)

[![Live on Somnia](https://img.shields.io/badge/🔥%20Live-on%20Somnia%20Devnet-0ea5e9?style=for-the-badge&logo=ethereum&logoColor=white)](https://shannon-explorer.somnia.network/address/0x95Cc0Edf7DA5EC63471CD8C57bA5899423CC2CEA)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.30-6B46C1?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Tests](https://img.shields.io/badge/Tests-19%20Passing-22c55e?style=for-the-badge&logo=checkmarx&logoColor=white)](./test/Stasis.test.js)
[![Zero-Click Demo](https://img.shields.io/badge/Zero--Click-Demo%20Ready-f59e0b?style=for-the-badge&logo=lightning&logoColor=white)]()
[![License MIT](https://img.shields.io/badge/License-MIT-gray?style=for-the-badge)](./LICENSE)

# Stasis: Autonomous On-Chain DeFi Guardian

**The first DeFi guardian that defends protocols entirely on-chain, with sub-second finality.**

Traditional DeFi security relies on off-chain bots and manual intervention—which are too slow for today's hyper-fast attacks. Stasis fixes this by using Somnia's Native Reactivity.

[**How It Works**](#-how-it-works) •
[**Features**](#-features) •
[**Live Demo**](#-live-demo) •
[**Contracts**](#-live-contracts) •
[**Quickstart**](#-quickstart) •
[**Sponsors**](#-sponsors)

</div>

---

## 🚨 The Problem

> **$10 Billion+** has been stolen from DeFi protocols through oracle manipulation attacks.

Every major DeFi hack follows the same pattern. An attacker manipulates an oracle price. An off-chain bot tries to respond. But by the time it detects the event, signs a transaction, and hopes to get included — the pool is already drained.

The three failure points of traditional defense:

1. **Detection takes 2–15 seconds** after the malicious transaction
2. **The defense transaction has to win a race** against the attacker
3. **There's no guarantee it gets included in time** — usually, it doesn't

Traditional blockchains are **passive**. They wait to be asked. Stasis changes that.

---

## ⚡ The Solution

> **Same Block. Atomic. Unstoppable.**

Stasis registers directly with the Somnia Precompile at `0x0100`. The moment an oracle emits a price drop event, the Somnia Validator Network itself invokes `onEvent()` — in the **same block**, before any attacker can act. The pool is paused atomically. The borrow() call reverts. The attack never completes.

**No Node.js. No AWS. No bot wallet. The blockchain is the guardian.**

```
          [ TRADITIONAL EVM ]                    [ WITH STASIS ]

Attack Tx ──► Oracle Price Drop       Attack Tx ──► Oracle Price Drop
                    │                                      │
                 15s gap                      [Same Block, Validators]
                    │                                      │
             Off-chain bot                     ⚡ Stasis.onEvent()
             detects & sends                   runs ON-CHAIN automatically
             defense tx                                    │
                    │                            pool.pause()  ATOMIC
              Pool drained ❌                  Attacker REVERTS  ✅
```

---

## 🔄 How It Works

> **Three Steps. One Block.**

**① Attack Initiated**
An attacker (or the demo button) calls `setPrice()` on the oracle, dropping the price by 20% or more.

**② Somnia Reacts**
The oracle emits a `PriceDrop` event. The Somnia Precompile (`0x0100`) detects the subscription match and invokes `onEvent()` on Stasis in the **same block**.

**③ Protocol Protected**
Stasis checks the drop threshold, calls `pause()` on the lending pool, and emits `ProtocolPaused`. The attacker's borrow transaction hits a paused pool and reverts.

```
sequenceDiagram
    autonumber
    actor Attacker as 🔴 Attacker
    participant Oracle as 📈 MockOracle
    participant Validators as ⚡ Somnia Validators
    participant Stasis as 🛡️ Stasis
    participant Pool as 🏦 MockLendingPool

    Attacker->>Oracle: setPrice(-20%)
    Oracle->>Oracle: Emit PriceDrop(800, 640, 2000 bps)
    Oracle-->>Validators: Event propagated to precompile
    Note over Validators: 0x0100 detects subscription match
    Validators->>Stasis: onEvent(oracle, topics, data) [same block]
    Stasis->>Stasis: Decode dropBps = 2000 ≥ THRESHOLD
    Stasis->>Pool: pause() [atomic]
    Pool-->>Stasis: ✅ Pool is now PAUSED
    Stasis-->>Attacker: emit ProtocolPaused
    Note over Pool: All borrow() calls now REVERT ✅
```

---

## ✨ Features

> **Built Different, By Design**

| | |
|---|---|
| 🤖 **Autonomous On-Chain Defense** — Stasis inherits `SomniaEventHandler`. The Somnia Validator Network calls `onEvent()` in the same block as the attack. No human, no server, and no bot is involved in the defense execution. | 🛡️ **Hack-Proof Architecture** — The `onEvent()` function only accepts calls from the Somnia Precompile address `0x0100`, hardcoded at the Solidity level. Even the contract owner cannot manually trigger a defense. The system cannot be spoofed. |
| 🔍 **Full On-Chain Transparency** — Every intervention produces a transaction hash. Every defense is verifiable on the Shannon Explorer. There are no off-chain logs, no black boxes, and no trust required. | ⚡ **Zero-Click Demo Mode** — The backend auto-signs the attack transaction so anyone can see the system work without a wallet or MetaMask popup. The full transaction hash is shown on screen and verifiable on-chain instantly. |
| 🌍 **Drop-In Protocol Protection** — Any lending protocol — Aave fork, Compound fork, or custom pool — can deploy Stasis as its guardian. One deployment, one subscription, and your protocol is protected. | 🔗 **Native Somnia Integration** — Stasis uses Somnia's official `SomniaEventHandler` interface and registers with the `0x0100` precompile, making full use of Somnia's sub-second native reactivity. |

---

## 🎮 Live Demo

> **See It Defend. In Real Time.**

Clone the repo, start the backend, open the dashboard, and click **🔴 Simulate Attack**. The backend sends a signed oracle transaction dropping the price by 20%. Watch the dashboard update live as Stasis intercepts it on-chain. Copy the transaction hash and verify it yourself on the Shannon Explorer.

**No wallet needed. Everything is verifiable on-chain.**

```bash
# Terminal 1 — Backend
cd backend && node demo-server.js
# ✅ API live at http://localhost:3001

# Terminal 2 — Frontend
cd frontend && npm run dev
# ✅ Dashboard live at http://localhost:5173
```

Open `http://localhost:5173` and click **🔴 Simulate Attack**.

---

## 📍 Live Contracts

> **Deployed and Active on Somnia Devnet**

| Contract | Address | Explorer |
|---|---|---|
| 📈 **MockOracle** | `0x3B24D72964eB7D148dB1c77BA5E8E05A3e4a71Df` | [View ↗](https://shannon-explorer.somnia.network/address/0x3B24D72964eB7D148dB1c77BA5E8E05A3e4a71Df) |
| 🛡️ **Stasis** | `0x95Cc0Edf7DA5EC63471CD8C57bA5899423CC2CEA` | [View ↗](https://shannon-explorer.somnia.network/address/0x95Cc0Edf7DA5EC63471CD8C57bA5899423CC2CEA) |
| 🏦 **MockLendingPool** | `0x027E3FA613Db4d06B65555215fC35A7dDEAe6BDA` | [View ↗](https://shannon-explorer.somnia.network/address/0x027E3FA613Db4d06B65555215fC35A7dDEAe6BDA) |
| ⚡ **Subscription ID** | `6879957816108517943170610238244214937208003125` | [Internal Txns ↗](https://shannon-explorer.somnia.network/address/0x95Cc0Edf7DA5EC63471CD8C57bA5899423CC2CEA?tab=internal_txs) |

> **Proof of Reactivity:** Click "Internal Txns" on the Stasis contract. You will see successful calls originating from **`0x000...0100`** — that is the Somnia blockchain itself defending the protocol.

---

## 🧪 Test Coverage

> **19 Tests. All Passing.**

Stasis ships with a full test suite covering oracle behavior, pool security, risk engine logic, event handling, and a complete end-to-end attack scenario.

```bash
npx hardhat test
```

```
  Stasis System

    MockOracle
      ✔ deploys with default price of 1000 ETH
      ✔ emits PriceDrop when price drops ≥ 5%
      ✔ does NOT emit PriceDrop for a smaller drop
      ✔ rejects price updates from non-owner

    MockLendingPool — Security
      ✔ guardian is correctly set to Stasis
      ✔ rejects pause() from a random user
      ✔ rejects pause() from the deployer/owner
      ✔ rejects pause() from an attacker
      ✔ only owner can unpause; random user cannot
      ✔ borrow() reverts when pool is paused

    Stasis — Risk Engine
      ✔ pauses pool on a 20% drop (at threshold)
      ✔ pauses pool on a drop > 20%
      ✔ does NOT pause on a drop below threshold
      ✔ emits ProtocolPaused event on intervention
      ✔ increments totalInterventions counter
      ✔ rejects onEvent from wrong contract
      ✔ rejects onEvent from wrong caller (non-precompile)
      ✔ setSubscriptionId syncs correctly

    Full Attack Scenario
      ✔ Full attack: price drop → pool paused → borrow reverts

  19 passing (6s)
```

---

## 🔐 Security Design

| Feature | Design |
|---|---|
| `onEvent()` caller | Only the Somnia Precompile (`0x0100`) — hardcoded in `SomniaEventHandler` |
| `pause()` caller | Only `Stasis` contract — set as `guardian` at pool deployment |
| `unpause()` caller | Only deployer/owner — for demo resets |
| `setSubscriptionId` | Only contract owner — syncs on-chain ID to storage |
| Off-chain bots | **None** — zero off-chain defense execution |

### Deployment Order

```
1. Deploy MockOracle
2. Deploy Stasis(oracleAddr)          ← Inherits SomniaEventHandler
3. Deploy MockLendingPool(stasisAddr) ← Guardian = Stasis
4. stasis.setLendingPool(poolAddr)    ← Link complete
5. run setup-subscription.js          ← Register with Precompile (0x0100)
```

---

## 🚀 Quickstart

### Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org)
- **MetaMask** — [Install](https://metamask.io) & add Somnia Devnet
  - ChainID: `50312`
  - RPC: `https://dream-rpc.somnia.network`

### Setup

```bash
# Clone the repository
git clone https://github.com/Ankit-raj-11/Stasis.git
cd Stasis

# Install all dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### Run

```bash
# Terminal 1 — Backend (Zero-Click Demo API)
cd backend
node demo-server.js

# Terminal 2 — Frontend Dashboard
cd frontend
npm run dev
```

---

## 🏗️ Architecture

```
flowchart LR
    subgraph USER["👤 User / Attacker"]
        DASH["💻 Dashboard\nReact + Vite"]
        API["🚀 Demo Backend\nAuto-Signer"]
    end

    subgraph SOMNIA["⛓️ Somnia Devnet — All On-Chain"]
        direction TB
        ORA["📈 MockOracle"]
        PRECOMPILE["⚡ Somnia Precompile\n0x0100"]
        RG["🛡️ Stasis\nSomniaEventHandler"]
        POOL["🏦 MockLendingPool"]
    end

    DASH -- "① Simulate Attack" --> API
    API -- "② oracle.setPrice(-20%)" --> ORA
    ORA -- "③ emits PriceDrop event" --> PRECOMPILE
    PRECOMPILE -- "④ invokes onEvent() [same block]" --> RG
    RG -- "⑤ pool.pause() ATOMIC" --> POOL
    RG -.->|"⑥ ProtocolPaused → Dashboard"| DASH
```

---

## 📁 Project Structure

```
Stasis/
├── 📜 contracts/
│   ├── MockOracle.sol            # Price oracle — emits PriceDrop on ≥5% drops
│   ├── Stasis.sol                # SomniaEventHandler — on-chain risk engine
│   ├── MockLendingPool.sol       # Guardian-only pause, owner unpause
│   └── interfaces/
│       ├── ISomniaReactivityPrecompile.sol
│       └── ISomniaEventHandler.sol
│
├── 📜 scripts/
│   ├── deploy.js                 # 4-step deploy, auto-populates .env
│   ├── setup-subscription.js    # Registers with Somnia Precompile (0x0100)
│   ├── simulate-attack.js       # CLI: 20% drop → proves defense
│   └── check-status.js          # Real-time on-chain status reader
│
├── 🧪 test/
│   └── Stasis.test.js            # 19 tests — all passing
│
├── 🚀 backend/
│   └── demo-server.js            # Express API: auto-signs txs for demo
│
├── 💻 frontend/
│   └── src/
│       ├── App.jsx               # Dashboard + real-time event listeners
│       └── index.css             # Premium DeFi dark UI & animations
│
├── 📖 VERIFICATION_GUIDE.md      # Step-by-step on-chain verification
├── 🎬 DEMO_SCRIPT.md             # Hackathon demo video script
└── ⚙️  hardhat.config.js         # Somnia testnet (chainId 50312)
```

---

## 🛠️ Built With

[![Somnia](https://img.shields.io/badge/Somnia-Native%20Reactivity-0ea5e9?style=flat-square&logo=ethereum)](https://somnia.network)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.30-6B46C1?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-yellow?style=flat-square&logo=hardhat)](https://hardhat.org/)
[![ethers.js](https://img.shields.io/badge/ethers.js-v6-blue?style=flat-square)](https://ethers.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-purple?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-black?style=flat-square&logo=express)](https://expressjs.com/)

---

## 📖 Documentation

- 📋 [**On-Chain Verification Guide**](./VERIFICATION_GUIDE.md) — How to verify the autonomous defense on the blockchain explorer
- 🎬 [**Demo Video Script**](./DEMO_SCRIPT.md) — Minute-by-minute guide for the hackathon demo recording

---

## 🏆 Sponsors

> Stasis was built for and made possible by the following sponsors and ecosystem partners.

---

<div align="center">

### 🥇 Title Sponsor

<!-- Add title sponsor logo and link here -->
<!-- Example: [![Sponsor Name](sponsor-logo-url)](sponsor-website) -->

*Interested in sponsoring Stasis? Reach out via GitHub Issues.*

---

### 🥈 Ecosystem Partners

<!-- Add ecosystem partner logos here in a row -->
<!-- Example:
| [![Partner 1](logo)](link) | [![Partner 2](logo)](link) | [![Partner 3](logo)](link) |
|:---:|:---:|:---:| -->

---

### 🌐 Infrastructure & Tooling

<!-- Add infrastructure sponsors here -->
<!-- Example: [![Alchemy](alchemy-logo)](https://alchemy.com) -->

---

### 🤝 Community & Grants

<!-- Add community sponsors / grant programs here -->

---

</div>

> If you or your organization contributed to making Stasis possible and would like to be listed here, please open a PR or GitHub Issue with your logo, link, and tier.

---

<div align="center">

![Footer](https://capsule-render.vercel.app/api?type=waving&color=0:0ea5e9,50:1e3a5f,100:0f172a&height=100&section=footer)

*Built for the Somnia Reactivity Hackathon.*
*Stasis proves that sub-second, trustless, and fully autonomous DeFi security is here today.*

**[⭐ Star this repo](https://github.com/Ankit-raj-11/Stasis) if Stasis impressed you!**

</div>
