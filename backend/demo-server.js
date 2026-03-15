/**
 * ReactGuard Demo API Server
 *
 * Provides 1-click attack/reset for the dashboard without MetaMask popups.
 *
 * ATTACK FLOW (real Somnia Reactivity):
 *   1. Server sends ONLY oracle.setPrice(-20%) — one transaction
 *   2. Somnia validators detect PriceDrop event on-chain
 *   3. Validators automatically invoke ReactGuard._onEvent() in same block
 *   4. _onEvent() checks risk score → calls pool.pause() if threshold met
 *   5. Server polls until pool.paused() === true and reports latency
 *
 * No simulateEvent(). No fake calls. Pure Somnia Reactivity.
 */
import 'dotenv/config'
import express from 'express'
import { ethers } from 'ethers'

const app = express()
app.use(express.json())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

// ── Chain connection (auto-signs from .env PRIVATE_KEY) ───────────────────
const RPC_URL = process.env.SOMNIA_RPC_URL || 'https://dream-rpc.somnia.network'
const provider = new ethers.JsonRpcProvider(RPC_URL)
const wallet   = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

const ORACLE_ADDR = process.env.ORACLE_ADDRESS
const GUARD_ADDR  = process.env.REACTGUARD_ADDRESS
const POOL_ADDR   = process.env.POOL_ADDRESS

if (!ORACLE_ADDR || !GUARD_ADDR || !POOL_ADDR) {
  console.error('❌ Missing contract addresses in .env. Run deploy.js first.')
  process.exit(1)
}

const ORACLE_ABI = [
  'function getPrice() view returns (int256)',
  'function setPrice(int256 _newPrice)',
]
const GUARD_ABI = [
  'function getStatus() view returns (bool poolPaused, uint256 interventions, uint256 lastDefended, uint256 lastDrop)',
  'function subscriptionId() view returns (uint256)',
]
const POOL_ABI = [
  'function paused() view returns (bool)',
  'function unpause()',
]

// ── GET /demo/status ──────────────────────────────────────────────────────
app.get('/demo/status', async (_req, res) => {
  try {
    const oracle = new ethers.Contract(ORACLE_ADDR, ORACLE_ABI, provider)
    const guard  = new ethers.Contract(GUARD_ADDR,  GUARD_ABI,  provider)
    const pool   = new ethers.Contract(POOL_ADDR,   POOL_ABI,   provider)
    const [price, status, paused, subId] = await Promise.all([
      oracle.getPrice(),
      guard.getStatus(),
      pool.paused(),
      guard.subscriptionId().catch(() => 0n),
    ])
    res.json({
      ok: true,
      oraclePrice:    price.toString(),
      poolPaused:     paused,
      interventions:  status.interventions.toString(),
      subscriptionId: subId.toString(),
    })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

// ── POST /demo/attack ─────────────────────────────────────────────────────
// Sends ONE tx: oracle.setPrice(-20%)
// Somnia validators auto-invoke ReactGuard._onEvent() — we just poll for it
app.post('/demo/attack', async (_req, res) => {
  try {
    const oracle = new ethers.Contract(ORACLE_ADDR, ORACLE_ABI, wallet)
    const pool   = new ethers.Contract(POOL_ADDR,   POOL_ABI,   provider)

    const current  = await oracle.getPrice()
    const newPrice = (current * 80n) / 100n

    console.log('\n⚔️  ATTACK: Dropping oracle price −20%…')
    const t0 = Date.now()
    const tx = await oracle.setPrice(newPrice)
    const receipt = await tx.wait()
    console.log(`   ✅ PriceDrop emitted [block ${receipt.blockNumber}] — waiting for validators…`)

    // Poll for Somnia validators to auto-invoke _onEvent() → pool.pause()
    let defended = false
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 1200))
      if (await pool.paused()) { defended = true; break }
    }
    const latency = Date.now() - t0

    if (defended) {
      console.log(`   ⚡ Pool paused by Somnia validators in ${latency}ms!`)
    } else {
      console.log('   ⚠️  Pool not paused after 18s — check subscription is active')
    }

    res.json({
      ok: true,
      tx:       tx.hash,
      block:    receipt.blockNumber,
      latency,
      defended,
      oldPrice: current.toString(),
      newPrice: newPrice.toString(),
      note:     defended
        ? 'Pool paused autonomously by Somnia validators calling _onEvent(). Zero defense txs from us.'
        : 'Subscription may not be active — run setup-subscription.js first.',
    })
  } catch (err) {
    console.error('Attack error:', err.reason ?? err.message)
    res.status(500).json({ ok: false, error: err.reason ?? err.message })
  }
})

// ── POST /demo/reset ──────────────────────────────────────────────────────
app.post('/demo/reset', async (_req, res) => {
  try {
    const oracle = new ethers.Contract(ORACLE_ADDR, ORACLE_ABI, wallet)
    const pool   = new ethers.Contract(POOL_ADDR,   POOL_ABI,   wallet)

    console.log('\n🔄 RESET: Restoring oracle price…')
    const tx1 = await oracle.setPrice(ethers.parseEther('1000'))
    const receipt1 = await tx1.wait()
    console.log(`   ✅ Price reset [block ${receipt1.blockNumber}]`)

    let tx2Hash = null, block2 = null
    if (await pool.paused()) {
      console.log('🔓 RESET: Unpausing pool…')
      const tx2 = await pool.unpause()
      const receipt2 = await tx2.wait()
      tx2Hash = tx2.hash
      block2  = receipt2.blockNumber
      console.log(`   ✅ Pool unpaused [block ${receipt2.blockNumber}]`)
    }

    res.json({ ok: true, tx1: tx1.hash, tx2: tx2Hash, block1: receipt1.blockNumber, block2 })
  } catch (err) {
    console.error('Reset error:', err.reason ?? err.message)
    res.status(500).json({ ok: false, error: err.reason ?? err.message })
  }
})

const PORT = process.env.DEMO_PORT || 3001
app.listen(PORT, () => {
  console.log(`\n🚀 ReactGuard Demo API → http://localhost:${PORT}`)
  console.log(`   Wallet:  ${wallet.address}`)
  console.log(`   Oracle:  ${ORACLE_ADDR}`)
  console.log(`   Guard:   ${GUARD_ADDR}`)
  console.log(`   Pool:    ${POOL_ADDR}`)
  console.log(`\n   Attack endpoint: POST /demo/attack`)
  console.log(`   Sends 1 tx (oracle.setPrice). Somnia validators auto-invoke _onEvent().\n`)
})
