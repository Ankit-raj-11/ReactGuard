# 🛡️ Stasis – On-Chain Verification Guide

This guide explains how to verify that **Stasis** is performing autonomous, on-chain defense using Somnia Native Reactivity.

---

## 📍 Contract Addresses (Somnia Devnet)

| Contract | Address | Explorer |
| :--- | :--- | :---: |
| **Oracle** | `0x3B24D72964eB7D148dB1c77BA5E8E05A3e4a71Df` | [View ↗](https://shannon-explorer.somnia.network/address/0x3B24D72964eB7D148dB1c77BA5E8E05A3e4a71Df) |
| **Stasis** | `0x95Cc0Edf7DA5EC63471CD8C57bA5899423CC2CEA` | [View ↗](https://shannon-explorer.somnia.network/address/0x95Cc0Edf7DA5EC63471CD8C57bA5899423CC2CEA) |
| **Lending Pool** | `0x027E3FA613Db4d06B65555215fC35A7dDEAe6BDA` | [View ↗](https://shannon-explorer.somnia.network/address/0x027E3FA613Db4d06B65555215fC35A7dDEAe6BDA) |

---

## 🔍 How to Verify "True Reactivity"

### 1. The On-Chain Alarms (Subscriptions)
Stasis is registered with the Somnia Precompile (`0x0100`).
- **Subscription ID:** `6879957816108517943170610238244214937208003125`

### 2. The Smoking Gun: Internal Transactions
1. Go to the [Stasis Explorer Page](https://shannon-explorer.somnia.network/address/0x95Cc0Edf7DA5EC63471CD8C57bA5899423CC2CEA).
2. Click the **"Internal Txns"** tab.
3. You will see successful calls where the **From** address is **`0x000...0100`** (the Somnia Reactor).
- This proves the blockchain itself defended your protocol without any middleman or off-chain bot.

### 3. Understanding Security Failures
If you see failed transactions when calling `onEvent` manually:
- **This is a Security Feature.**
- Stasis only allows the Somnia Network (`0x0100`) to trigger the defense.
- Manual attempts are rejected by Solidity, ensuring the system can only be triggered by the validator network.

---

## 🛠️ Tools for Verification

### Automated Verification Script
Run the simulation script to prove the defense end-to-end:
```bash
# In the root directory
npx hardhat run scripts/simulate-attack.js --network somnia
```

### On-Chain Status Reader
Run this command to see the live state of all contracts:
```bash
npx hardhat run scripts/check-status.js --network somnia
```

### Dashboard Live Feed
1. Open [http://localhost:5173](http://localhost:5173).
2. The **Event Stream** shows full **Transaction Hashes**.
3. Use the **Clipboard (📋)** icon to copy a hash and paste it into the explorer for instant proof.

---

## 🚀 Final Checklist for Judges
- [x] **Subscription Active**: Visible on Dashboard and verifiable on-chain.
- [x] **Autonomous Defense**: Proven via "Internal Transactions" from `0x0100`.
- [x] **Zero-Click Demo**: Seamless experience without wallet popups.
- [x] **Solidity Secured**: Defense logic protected from unauthorized manual calls.
