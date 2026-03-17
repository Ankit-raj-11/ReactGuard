import { useState, useEffect, useCallback, useRef } from 'react'
import { ethers } from 'ethers'
import {
  Shield, Activity, Database, Zap, Clock, Radio,
  RotateCcw, AlertTriangle, CheckCircle, Link,
  Copy, Wallet, ChevronRight, TrendingDown
} from '../icons.jsx'
import '../index.css'
import { Link as RouterLink } from '../App.jsx'

// ── ABI fragments (only what we need) ─────────────────────────────────────
const ORACLE_ABI = [
  'function getPrice() view returns (int256)',
  'function setPrice(int256 _newPrice)',
  'event PriceDrop(int256 oldPrice, int256 newPrice, uint256 dropBps)',
  'event PriceUpdated(int256 indexed oldPrice, int256 indexed newPrice)',
]

const REACTGUARD_ABI = [
  'function getStatus() view returns (bool poolPaused, uint256 interventions, uint256 lastDefended, uint256 lastDrop)',
  'function THRESHOLD_BPS() view returns (uint256)',
  'function subscriptionId() view returns (uint256)',
  'event ProtocolPaused(uint256 dropBps, int256 oldPrice, int256 newPrice, uint256 timestamp)',
]

const POOL_ABI = [
  'function paused() view returns (bool)',
  'function unpause()',
  'event Paused(address indexed by)',
  'event Unpaused(address indexed by)',
]

const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://dream-rpc.somnia.network'
const ORACLE_ADDR = import.meta.env.VITE_ORACLE_ADDRESS || ''
const GUARD_ADDR  = import.meta.env.VITE_REACTGUARD_ADDRESS || ''
const POOL_ADDR   = import.meta.env.VITE_POOL_ADDRESS || ''

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtPrice(bigN) {
  if (!bigN && bigN !== 0n) return '—'
  return parseFloat(ethers.formatEther(bigN)).toFixed(2)
}

function fmtTime(ts) {
  const d = ts instanceof Date ? ts : new Date(ts)
  return d.toLocaleTimeString('en-US', { hour12: false })
}

function shortAddr(addr) {
  if (!addr) return '—'
  return addr.slice(0, 6) + '…' + addr.slice(-4)
}

// ── Main Simulation Page ───────────────────────────────────────────────────────────────
export default function Simulation() {
  const [poolPaused,  setPoolPaused]  = useState(false)
  const [price,       setPrice]       = useState(null)
  const [interventions, setInterventions] = useState(0)
  const [lastDrop,    setLastDrop]    = useState(0)
  const [latencyMs,   setLatencyMs]   = useState(null)
  const [events,      setEvents]      = useState([])
  const [wallet,      setWallet]      = useState(null)
  const [connected,   setConnected]   = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [contractsOk, setContractsOk] = useState(false)
  const [attacking,   setAttacking]   = useState(false)
  const [resetting,   setResetting]   = useState(false)
  const [txStep,      setTxStep]      = useState('')
  const [subscriptionId, setSubscriptionId] = useState(null)

  const providerRef = useRef(null)
  const attackTimeRef = useRef(null)

  // ── Add feed event ────────────────────────────────────────────────────────
  const addEvent = useCallback((type, msg, hash = null) => {
    setEvents(prev => [{
      id: Date.now() + Math.random(),
      type,
      msg,
      hash,
      time: new Date(),
    }, ...prev].slice(0, 50))
  }, [])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.innerText = 'Copied to clipboard!';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  };

  // ── Initialize RPC provider & contracts ───────────────────────────────────
  const initContracts = useCallback(async (provider) => {
    try {
      const oracle = new ethers.Contract(ORACLE_ADDR, ORACLE_ABI, provider)
      const guard  = new ethers.Contract(GUARD_ADDR,  REACTGUARD_ABI, provider)
      const pool   = new ethers.Contract(POOL_ADDR,   POOL_ABI, provider)

      const [priceVal, status, pausedVal, subId] = await Promise.all([
        oracle.getPrice(),
        guard.getStatus(),
        pool.paused(),
        guard.subscriptionId(),
      ])

      setPrice(priceVal)
      setPoolPaused(status.poolPaused || pausedVal)
      setInterventions(Number(status.interventions))
      setLastDrop(Number(status.lastDrop))
      setSubscriptionId(subId.toString())
      setContractsOk(true)
      setLoading(false)

      addEvent('info', `Connected to Somnia testnet. Oracle: ${shortAddr(ORACLE_ADDR)}, Pool: ${shortAddr(POOL_ADDR)}`)

      // ── Event listeners ──────────────────────────────────────────────────
      oracle.on('PriceDrop', (oldP, newP, dropBps) => {
        attackTimeRef.current = Date.now()
        const pct = (Number(dropBps) / 100).toFixed(0)
        addEvent('attack', `Oracle PriceDrop detected: ${fmtPrice(oldP)} → ${fmtPrice(newP)} ETH (−${pct}%). Reactivity engine activating…`)
        setPrice(newP)
      })

      oracle.on('PriceUpdated', (oldP, newP) => {
        setPrice(newP)
      })

      guard.on('ProtocolPaused', (dropBps, _old, _new, ts) => {
        const lat = attackTimeRef.current ? Date.now() - attackTimeRef.current : null
        setLatencyMs(lat)
        setInterventions(n => n + 1)
        setLastDrop(Number(dropBps))
        setPoolPaused(true)
        addEvent('defend', `SOMNIA REACTIVITY: Protocol paused in ${lat ? lat + 'ms' : '<1 block'}! Drop: ${(Number(dropBps)/100).toFixed(0)}% — zero off-chain bots used.`)
      })

      pool.on('Paused', (by) => {
        setPoolPaused(true)
        addEvent('defend', `Pool PAUSED by ReactGuard (${shortAddr(by)}). All borrows now reverting.`)
      })

      pool.on('Unpaused', (by) => {
        setPoolPaused(false)
        setLatencyMs(null)
        addEvent('info', `Pool RESUMED by admin (${shortAddr(by)}). System back to normal.`)
      })

      // ── Poll status every 10s ─────────────────────────────────────────────
      const poll = setInterval(async () => {
        try {
          const [p, s, pv, sid] = await Promise.all([
            oracle.getPrice(), 
            guard.getStatus(), 
            pool.paused(),
            guard.subscriptionId()
          ])
          setPrice(p)
          setPoolPaused(s.poolPaused || pv)
          setInterventions(Number(s.interventions))
          setLastDrop(Number(s.lastDrop))
          setSubscriptionId(sid.toString())
        } catch {}
      }, 10_000)

      return () => {
        clearInterval(poll)
        oracle.removeAllListeners()
        guard.removeAllListeners()
        pool.removeAllListeners()
      }
    } catch (err) {
      console.error('Contract init error:', err)
      setLoading(false)
      addEvent('warning', `Could not connect to contracts. Make sure VITE_ env vars are set after deploying.`)
    }
  }, [addEvent])

  useEffect(() => {
    if (!ORACLE_ADDR || !GUARD_ADDR || !POOL_ADDR) {
      setLoading(false)
      addEvent('warning', 'No contract addresses found. Deploy contracts and set VITE_ env vars.')
      return
    }
    const p = new ethers.JsonRpcProvider(RPC_URL)
    providerRef.current = p
    initContracts(p).then(cleanup => {
      if (cleanup) return cleanup
    })
  }, [initContracts, addEvent])

  // ── Wallet connect (with Somnia testnet auto-switch) ───────────────────────
  const connectWallet = async () => {
    if (!window.ethereum) {
      addEvent('warning', '⚠️ MetaMask not found. Please install MetaMask to connect.')
      return
    }
    try {
      // 1. Request accounts — triggers MetaMask popup
      await window.ethereum.request({ method: 'eth_requestAccounts' })

      // 2. Switch to Somnia Devnet (chainId 50312 = 0xC488)
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xC488' }],
        })
      } catch (switchErr) {
        // Error 4902 = chain not in MetaMask yet — add it
        if (switchErr.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId:           '0xC488',
              chainName:         'Somnia Devnet',
              nativeCurrency:    { name: 'STT', symbol: 'STT', decimals: 18 },
              rpcUrls:           ['https://dream-rpc.somnia.network'],
              blockExplorerUrls: ['https://shannon-explorer.somnia.network'],
            }],
          })
        } else {
          throw switchErr
        }
      }

      // 3. Connect signer on the now-correct chain
      const browserProvider = new ethers.BrowserProvider(window.ethereum)
      const signer = await browserProvider.getSigner()
      const addr   = await signer.getAddress()
      setWallet(addr)
      setConnected(true)
      addEvent('info', `Wallet connected on Somnia Devnet: ${shortAddr(addr)}`)
    } catch (err) {
      if (err.code === 4001) {
        addEvent('warning', 'Connection rejected — please approve in MetaMask.')
      } else if (err.code === -32002) {
        addEvent('warning', 'MetaMask popup already open — click the MetaMask icon in your browser toolbar to approve.')
      } else {
        addEvent('warning', `Wallet error: ${err.message ?? 'Unknown error'}`)
      }
    }
  }

  // ── Attack simulation — calls backend API, zero MetaMask popups ───────────
  const simulateAttack = async () => {
    if (poolPaused) { addEvent('warning', '⚠️ Pool already paused — reset first.'); return }
    if (attacking)  return
    setAttacking(true)
    attackTimeRef.current = Date.now()
    setTxStep('Sending attack transaction… (auto-signing)')
    addEvent('attack', 'ATTACK: Sending oracle price manipulation on-chain…')
    try {
      const res  = await fetch('/demo/attack', { method: 'POST' })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error)

      addEvent('attack', `oracle.setPrice(−20%) [block ${data.block}]`, data.tx)
      addEvent('attack', 'PriceDrop emitted on-chain. Somnia validators detecting…')

      if (data.defended) {
        setLatencyMs(data.latency)
        addEvent('defend', `SOMNIA REACTIVITY: Pool paused in ${data.latency}ms — validators invoked _onEvent()!`)
        addEvent('defend', 'POOL PAUSED — attacker borrows REVERT. Zero bots used.')
      } else {
        addEvent('info', 'Subscription active. Waiting for validator network latency...')
      }
      setTxStep('')
    } catch (err) {
      addEvent('warning', `Attack failed: ${err.message?.slice(0, 100)}`)
      setTxStep('')
    } finally {
      setAttacking(false)
    }
  }

  // ── Reset demo — calls backend API, zero MetaMask popups ──────────────────
  const resetDemo = async () => {
    if (resetting) return
    setResetting(true)
    setTxStep('Restoring oracle + unpausing pool…')
    addEvent('info', 'RESET: Restoring system to normal state…')
    try {
      const res  = await fetch('/demo/reset', { method: 'POST' })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error)

      addEvent('info', `Oracle price restored to $1000 [block ${data.block}]`, data.tx1)
      if (data.tx2 || data.tx) {
        addEvent('info', `Pool unpaused by admin [block ${data.block}]`, data.tx2 || data.tx)
      }
      setLatencyMs(null)
      setTxStep('')
      addEvent('success', 'System ACTIVE. Ready for next demo take.')
    } catch (err) {
      addEvent('warning', `Reset failed: ${err.message?.slice(0, 100)}`)
      setTxStep('')
    } finally {
      setResetting(false)
    }
  }


  // ── Render ─────────────────────────────────────────────────────────────────
  const statusClass = poolPaused ? 'paused' : 'active'
  const statusLabel = poolPaused ? 'PROTOCOL PAUSED — UNDER ATTACK DEFENSE' : 'PROTOCOL ACTIVE — ALL SYSTEMS NOMINAL'
  const statusIcon  = poolPaused
    ? <AlertTriangle size={28} strokeWidth={1.5} />
    : <Shield size={28} strokeWidth={1.5} />
  const statusText  = poolPaused ? 'PAUSED' : 'ACTIVE'

  return (
    <div className="dashboard-grid">
      {/* ── Left Panel: Monitoring ── */}
      <section className="panel-monitoring">
        
        {/* ── Header ── */}
        <header className="header">
          <div className="header-inner">
            <RouterLink to="/" className="logo" style={{ textDecoration: 'none' }}>
              <div className="logo-icon">
                <Shield size={22} strokeWidth={2} color="#fff" />
              </div>
              <div className="logo-text">
                <h1>ReactGuard</h1>
                <p>Somnia Native Reactivity • DeFi Guardian</p>
              </div>
            </RouterLink>
            <div className="header-badges">

              {!connected
                ? <button className="connect-btn" onClick={connectWallet}>
                    <Link size={14} strokeWidth={2} />
                    Connect Wallet
                  </button>
                : <div className="connected-pill">
                    <CheckCircle size={13} strokeWidth={2} color="var(--green)" />
                    {shortAddr(wallet)}
                  </div>
              }
            </div>
          </div>
        </header>

        {/* ── Main Monitoring Content ── */}
        <div className="monitoring-content">

          {/* ── Status Hero ── */}
          <div className={`status-hero ${statusClass}`}>
            <div className="status-hero-inner">
              <div className="status-main">
                <div className={`status-orb ${statusClass}`}>{statusIcon}</div>
                <div className="status-text">
                  <h2>{statusText}</h2>
                  <p className="status-label">{statusLabel}</p>
                </div>
              </div>
              <div className="status-meta">
                {latencyMs != null && (
                  <div className="meta-item">
                    <div className="meta-val" style={{color: '#34d399'}}>{latencyMs}ms</div>
                    <div className="meta-key">Defense Latency</div>
                  </div>
                )}
                <div className="meta-item">
                  <div className="meta-val">{interventions}</div>
                  <div className="meta-key">Interventions</div>
                </div>
                {lastDrop > 0 && (
                  <div className="meta-item">
                    <div className="meta-val" style={{color: '#f87171'}}>{(lastDrop/100).toFixed(0)}%</div>
                    <div className="meta-key">Last Drop</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid-3">
            <div className="card">
              <div className="card-header">
                <div className="card-title"><TrendingDown size={14} strokeWidth={1.5} /> Oracle Price</div>
              </div>
              <div className={`card-value ${poolPaused ? 'val-red' : 'val-green'}`}>
                {loading ? '…' : price != null ? `$${fmtPrice(price)}` : '—'}
              </div>
              <div className="card-sub">ETH/USD · MockOracle</div>
              <div className="addr">{ORACLE_ADDR || 'No address set'}</div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title"><Zap size={14} strokeWidth={1.5} /> Reactivity Engine</div>
                <span className="badge badge-green">ON-CHAIN</span>
              </div>
              <div className="card-value val-blue">{interventions}</div>
              <div className="card-sub">Automatic interventions</div>
              <div className="card-sub mt-1" style={{ fontSize: '10px', opacity: 0.8 }}>
                ID: {subscriptionId && subscriptionId !== '0' ? subscriptionId : 'Initializing...'}
              </div>
              <div className="addr">{GUARD_ADDR || 'No address set'}</div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title"><Database size={14} strokeWidth={1.5} /> Lending Pool</div>
              </div>
              <div className={`card-value ${poolPaused ? 'val-red' : 'val-green'}`}>
                {loading ? '…' : poolPaused ? 'PAUSED' : 'ACTIVE'}
              </div>
              <div className="card-sub">
                {poolPaused ? 'Borrows reverting — pool protected' : 'Deposits & borrows open'}
              </div>
              <div className="addr">{POOL_ADDR || 'No address set'}</div>
            </div>
          </div>

          {/* ── Event Feed ── */}
          <div className="feed-card">
            <div className="feed-header">
              <div className="feed-title"><Radio size={14} strokeWidth={1.5} /> Live Event Stream</div>
              <div className="feed-live"><div className="feed-live-dot" />LIVE</div>
            </div>
              <div className="feed-list">
                {events.length === 0
                  ? <div className="feed-empty">
                      <div className="feed-empty-icon"><Radio size={32} strokeWidth={1} opacity={0.4} /></div>
                      Waiting for on-chain events…
                    </div>
                  : events.map(ev => (
                    <div key={ev.id} className="feed-item">
                      <div className={`feed-dot ${ev.type}`} />
                      <div className="feed-content">
                        <div className="feed-msg">{ev.msg}</div>
                        {ev.hash && (
                          <div className="feed-hash-container">
                            <span className="feed-hash" title={ev.hash}>{ev.hash}</span>
                            <button className="copy-btn" onClick={() => copyToClipboard(ev.hash)} title="Copy Full Hash">
                              <Copy size={12} strokeWidth={1.5} />
                            </button>
                          </div>
                        )}
                        <div className="feed-time">{fmtTime(ev.time)}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

        </div>
      </section>

      {/* ── Right Panel: Simulator ── */}
      <aside className="panel-simulator">
        <div className="simulator-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Latency card */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title"><Clock size={14} strokeWidth={1.5} /> Defense Latency</div>
                  {latencyMs != null && <span className="badge badge-green">LAST ATTACK</span>}
                </div>
                {latencyMs != null
                  ? <div className="latency-display">
                      <div className="latency-num">{latencyMs}</div>
                      <div className="latency-unit">ms</div>
                    </div>
                  : <div className="card-value dimmed">—</div>
                }
                <div className="card-sub mt-1">
                  {latencyMs != null
                    ? 'Attack → on-chain defense. Zero off-chain bots.'
                    : 'Hit "Simulate Attack" to measure on-chain reactivity.'}
                </div>
              </div>

              {/* Attack Controls */}
              <div className="sim-card">
                <div className="simulator-header">
                <h3><Zap size={14} strokeWidth={1.5} /> Demo Control — Oracle Manipulation</h3>
                <span className="zero-click-badge" title="Transactions are signed automatically by the backend for a faster demo experience.">
                  Zero-Click Demo Mode Active
                </span>
              </div>
              <p className="simulator-help">
                Trigger a 20% price drop on-chain. ReactGuard will react autonomously.
                <br />
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                  (No MetaMask approval needed — backend auto-signs the attack)
                </span>
              </p>
                {/* Steps */}
                <div className="sim-steps">
                  <div className="sim-step">
                    <div className="step-num">1</div>
                    <div className="step-text"><b>oracle.setPrice(−20%)</b> — emits PriceDrop event</div>
                  </div>
                  <div className="sim-step">
                    <div className="step-num">2</div>
                    <div className="step-text"><b>Somnia Validators</b> — detect event & invoke ReactGuard.onEvent()</div>
                  </div>
                  <div className="sim-step">
                    <div className="step-num">3</div>
                    <div className="step-text"><b>MockLendingPool.pause()</b> — autonomous defense secured</div>
                  </div>
                </div>



                <div className="sim-buttons">
                  <button
                    className={`sim-btn attack-btn ${attacking ? 'disabled' : ''}`}
                    onClick={simulateAttack}
                    disabled={attacking || resetting}
                  >
                    <TrendingDown size={14} strokeWidth={2} />
                    {attacking ? 'Attacking…' : 'Simulate Attack'}
                  </button>
                  <button
                    className={`sim-btn reset-btn ${resetting ? 'disabled' : ''}`}
                    onClick={resetDemo}
                    disabled={attacking || resetting}
                  >
                    <RotateCcw size={14} strokeWidth={2} />
                    {resetting ? 'Resetting…' : 'Reset Demo'}
                  </button>
                </div>

                <div className="addr mt-2" style={{textAlign:'center',color:'#60a5fa',borderColor:'#3b82f644'}}>
                  No off-chain bots · No AWS · 100% on-chain
                </div>
              </div>

          </div>
        </div>
        
        {/* ── Footer ── */}
        <footer className="footer">
          Built on <span>Somnia</span> Native Reactivity · ReactGuard © 2025 ·
          Contracts: <span>{ORACLE_ADDR ? shortAddr(ORACLE_ADDR) : 'Not deployed'}</span>
        </footer>
      </aside>
    </div>
  )
}
