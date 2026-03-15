# 🛡️ ReactGuard – On-Chain Verification Guide

This guide explains how to verify that **ReactGuard** is performing autonomous, on-chain defense using Somnia Native Reactivity.

---

## 📍 Contract Addresses (Somnia Devnet)

| Contract | Address |
| :--- | :--- |
| **Oracle** | `0xE5b2AD1558949447eD7b135ceB40baA894f417A1` |
| **ReactGuard** | `0x654Af00Ef47437911d52D12A88085E8f65b0F940` |
| **Lending Pool** | `0xA8DC52496d077E823675F114f2D8469C7a6E97d8` |

---

## 🔍 How to Verify "True Reactivity"

### 1. The On-Chain Alarms (Subscriptions)
Your ReactGuard is registered with the Somnia Precompile (`0x0100`). 
- **Subscription ID:** `6879957816108517943170610238244214937208003125`
- This ID is synced directly to the `ReactGuard` contract. You can see it on your [Dashboard](http://localhost:5173).

### 2. Spotting the "Autonomous" Defense
When you click **"Simulate Attack"**, the following happens:
1. One human transaction is sent to the **Oracle**.
2. **ZERO** human transactions are sent to the Pool or ReactGuard.
3. The **Somnia Network** automatically calls `onEvent` on your contract.

**To verify this on the Explorer:**
- Go to the [ReactGuard Contract Explorer](https://shannon-explorer.somnia.network/address/0x654Af00Ef47437911d52D12A88085E8f65b0F940).
- Click the **"Internal Transactions"** tab.
- You will see a successful call where the **From** address is **`0x000...0100`** (this is the Somnia Reactor).
- This is the "smoking gun" that proves the blockchain itself defended your protocol without any middleman.

### 3. Understanding "Failed" Transactions
If you see transactions on your address that show **"Failed"** while calling `onEvent`:
- **This is a Security Feature.**
- `ReactGuard` only allows the Somnia Network (`0x0100`) to trigger the defense.
- If you or a hacker tries to call it manually, the contract correctly **Rejects** the call.
- **Failures for you = Security for the users.**

---

## 🛠️ Tools for Verification

### On-Chain Status Script
Run this command in your terminal to see the live state of all contracts directly from the blockchain:
```bash
npx hardhat run scripts/check-status.js --network somnia
```

### Dashboard Live Feed
1. Open [http://localhost:5173](http://localhost:5173).
2. The **Event Stream** now shows full **Transaction Hashes**.
3. Use the **Clipboard (📋)** icon to copy a hash and paste it into the explorer for instant proof.

---

## 🚀 Final Checklist for Judges
- [x] **Subscription Active:** Visible on Dashboard + synced on-chain.
- [x] **Autonomous Defense:** Proven via "Internal Transactions" from `0x0100`.
- [x] **Zero-Click Demo:** Backend auto-signs for a seamless demo experience.
- [x] **Hack-Proof:** Manual attempts to trigger defense are blocked by Solidity.
