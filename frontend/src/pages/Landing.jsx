import { Link } from "../App.jsx";
import { Shield, Zap, Database, Activity, AlertTriangle, Clock, Radio, TrendingDown, CheckCircle } from "../icons.jsx";
import SnapshotImg from "../assets/Snapshot.png";
import GithubIcon from "../assets/github.png";
import XIcon from "../assets/x.png";
import NikhilPfp from "../assets/nikhil-chourasia.jpg";
import AnkitPfp from "../assets/ankit-raj.jpg";
import SomniaLogo from "../assets/somnia.png";
import DoraLogo from "../assets/DoraHacks.jpg";
import "../index.css";
import "../landing.css";
import { useState } from "react";

export default function Landing() {
  const [showContact, setShowContact] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  const handleContactClick = (e) => {
    e.preventDefault();
    setIsLocked(!isLocked);
  };
  
  return (
    <div className="landing-container">
      {/* ── Navigation ── */}
      <nav className="landing-nav">
        <Link to="/" className="logo" onClick={() => window.scrollTo(0,0)} style={{ textDecoration: 'none' }}>
          <div className="logo-icon">
            <Shield size={20} strokeWidth={2} color="#fff" />
          </div>
          <div className="logo-text">
            <h1>ReactGuard</h1>
          </div>
        </Link>
        
        <div className="landing-nav-links" style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '13px', fontWeight: '600' }}>
          <a href="#why" className="nav-link">Why Choose Us?</a>
          <a href="#how-it-works" className="nav-link">How it Works</a>
          <a href="#features" className="nav-link">Features</a>
          <Link to="/docs" className="nav-link">Docs</Link>
          <div 
            className="nav-link-container" 
            onMouseEnter={() => setShowContact(true)}
            onMouseLeave={() => setShowContact(false)}
            onClick={handleContactClick}
            style={{ position: 'relative' }}
          >
            <span className="nav-link" style={{ cursor: 'pointer', color: (showContact || isLocked) ? 'var(--text-primary)' : 'var(--text-secondary)' }}>Contact Us</span>
            {(showContact || isLocked) && (
              <div className="contact-popup" onClick={(e) => e.stopPropagation()}>
                <div className="contact-item">
                  <img src={NikhilPfp} alt="Nikhil Chourasia" className="contact-pfp" />
                  <div className="contact-info">
                    <span className="contact-name">Nikhil Chourasia</span>
                    <div className="contact-socials">
                      <a href="https://x.com/nikhil_py" target="_blank" rel="noreferrer" className="social-link x-link">
                        <img src={XIcon} alt="X" className="social-icon" />
                      </a>
                      <a href="https://github.com/nikhil-chourasia" target="_blank" rel="noreferrer" className="social-link github-link">
                        <img src={GithubIcon} alt="GitHub" className="social-icon" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="contact-item">
                  <img src={AnkitPfp} alt="Ankit Raj" className="contact-pfp" />
                  <div className="contact-info">
                    <span className="contact-name">Ankit Raj</span>
                    <div className="contact-socials">
                      <a href="https://x.com/Ankitraj411085" target="_blank" rel="noreferrer" className="social-link x-link">
                        <img src={XIcon} alt="X" className="social-icon" />
                      </a>
                      <a href="https://github.com/Ankit-raj-11" target="_blank" rel="noreferrer" className="social-link github-link">
                        <img src={GithubIcon} alt="GitHub" className="social-icon" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <a href="#sponsors" className="nav-link">Sponsors</a>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 8px' }}></div>
          <a href="https://github.com/Ankit-raj-11/ReactGuard" target="_blank" rel="noreferrer" className="nav-link github-nav-link" style={{ display: 'flex', alignItems: 'center', opacity: 1 }}>
            <img src={GithubIcon} alt="GitHub" style={{ width: '22px', height: '22px', filter: 'brightness(0) invert(1)', display: 'block' }} />
          </a>
          <Link to="/simulation" className="connect-btn" style={{ textDecoration: 'none' }}>
            Launch Sim
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header className="landing-hero" style={{ paddingBottom: '60px', paddingTop: '100px' }}>
        <div className="hero-content">
          <h1 className="hero-title" style={{ fontSize: '64px', marginBottom: '24px' }}>
            Somnia Native <span className="highlight">Reactivity</span>
          </h1>
          <div style={{ color: 'var(--blue)', fontSize: '16px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Autonomous On-Chain DeFi Guardian
          </div>
          <p className="hero-subtitle" style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
            The first DeFi guardian defending protocols <b>entirely on-chain</b>. Sub-second finality. Zero off-chain dependencies.
          </p>
          <div className="hero-actions" style={{ marginTop: '48px' }}>
            <Link to="/simulation" className="connect-btn" style={{ padding: '16px 32px', fontSize: '15px', textDecoration: 'none' }}>
              Enter Zero-Click Demo
            </Link>
            <a href="https://github.com/Ankit-raj-11/ReactGuard" target="_blank" rel="noreferrer" className="reset-btn" style={{ padding: '16px 32px', fontSize: '15px', textDecoration: 'none' }}>
              View Contracts
            </a>
          </div>
        </div>
      </header>

      {/* ── Product Showcase ── */}
      <section className="landing-showcase">
        <div className="showcase-container">
          <div className="showcase-topbar">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          <div className="showcase-content" style={{ padding: 0 }}>
            <img src={SnapshotImg} alt="ReactGuard Interface Snapshot" style={{ width: '100%', height: 'auto', display: 'block', borderBottomLeftRadius: 'var(--radius)', borderBottomRightRadius: 'var(--radius)' }} />
          </div>
        </div>
      </section>

      {/* ── Why ReactGuard? ── */}
      <section className="landing-section" id="why" style={{ background: 'var(--bg-secondary)' }}>
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title"><Shield size={28} color="var(--blue)" /> Why ReactGuard?</h2>
            <p className="section-lead">Traditional DeFi defense is broken. <b>ReactGuard fixes it.</b></p>
          </div>
          <div className="section-content text-block">
            <p style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '800px', margin: '0 auto 48px auto' }}>
              Traditional defense uses off-chain bots that lose gas races. By the time they react, the pool is drained.<br/><br/>
              <b>ReactGuard</b> registers directly with the Somnia Precompile. When a price drops, the Validator Network invokes <code>onEvent()</code> in the <b>same block</b>. The pool pauses atomically before the attacker can act.
            </p>

            <div className="architecture-comparison" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' }}>
              <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-secondary)' }}>Traditional EVM</h3>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <li style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>01</span>
                    <span>Hacker triggers Oracle manipulation.</span>
                  </li>
                  <li style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>02</span>
                    <span>Off-chain bots detect the transaction but must wait for the next block.</span>
                  </li>
                  <li style={{ display: 'flex', gap: '16px', color: '#EF4444' }}>
                    <span style={{ color: 'rgba(239, 68, 68, 0.5)' }}>03</span>
                    <span>The pool is drained during the 15-second gap.</span>
                  </li>
                </ul>
              </div>

              <div className="card" style={{ background: 'var(--bg-primary)', border: '1px solid var(--blue)', padding: '32px', boxShadow: '0 0 40px rgba(59, 130, 246, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--blue)', boxShadow: '0 0 10px var(--blue)' }}></div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>ReactGuard</h3>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <li style={{ display: 'flex', gap: '16px', color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--blue)', fontWeight: '700' }}>01</span>
                    <span>Hacker triggers Oracle manipulation.</span>
                  </li>
                  <li style={{ display: 'flex', gap: '16px', color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--blue)', fontWeight: '700' }}>02</span>
                    <span>Somnia Precompile triggers <code>onEvent()</code> synchronously.</span>
                  </li>
                  <li style={{ display: 'flex', gap: '16px', color: 'var(--blue)', fontWeight: '600' }}>
                    <span style={{ color: 'var(--blue)', fontWeight: '700' }}>03</span>
                    <span>Tx reverts in the <b>exact same block</b>. Pool secured.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="landing-section" id="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title"><Clock size={24} color="var(--blue)" /> How It Works</h2>
            <p className="section-lead"><b>Three Steps. One Block.</b></p>
          </div>
          <div className="timeline-grid" style={{ gridTemplateColumns: '1fr auto 1fr auto 1fr', alignItems: 'center' }}>
            <div className="card" style={{ height: '100%', background: 'var(--bg-secondary)' }}>
              <div className="step-number">①</div>
              <h3>Attack Initiated</h3>
              <p>Attacker manipulates the oracle price.</p>
            </div>
            
            <div className="timeline-arrow" style={{ padding: '0 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>

            <div className="card" style={{ height: '100%', background: 'var(--bg-secondary)' }}>
              <div className="step-number">②</div>
              <h3>Somnia Reacts</h3>
              <p>Precompile invokes <code>onEvent()</code> synchronously.</p>
            </div>

            <div className="timeline-arrow delay-1" style={{ padding: '0 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>

            <div className="card" style={{ height: '100%', background: 'var(--bg-secondary)' }}>
              <div className="step-number">③</div>
              <h3>Protocol Protected</h3>
              <p>Pool pauses instantly. Attack reverts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-section" id="features" style={{ background: 'var(--bg-secondary)' }}>
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Features</h2>
            <p className="section-lead"><b>Built Different, By Design</b></p>
          </div>
          <div className="features-grid">
            <div className="card feature-card" style={{ background: 'var(--bg-primary)' }}>
              <div className="feature-icon"><Zap size={24} strokeWidth={1.5} color="var(--blue)" /></div>
              <h3>Autonomous Defense</h3>
              <p>Triggered by validators in the same block. No bots or servers.</p>
            </div>
            <div className="card feature-card" style={{ background: 'var(--bg-primary)' }}>
              <div className="feature-icon"><Shield size={24} strokeWidth={1.5} color="var(--blue)" /></div>
              <h3>Hack-Proof Architecture</h3>
              <p>Only accepts precompile calls. Unstoppable by design.</p>
            </div>
            <div className="card feature-card" style={{ background: 'var(--bg-primary)' }}>
              <div className="feature-icon"><Activity size={24} strokeWidth={1.5} color="var(--blue)" /></div>
              <h3>Full Transparency</h3>
              <p>Every defense is verifiable on the Shannon Explorer.</p>
            </div>
            <div className="card feature-card" style={{ background: 'var(--bg-primary)' }}>
              <div className="feature-icon"><Radio size={24} strokeWidth={1.5} color="var(--blue)" /></div>
              <h3>Zero-Click Demo</h3>
              <p>Auto-signed transactions for seamless testing.</p>
            </div>
            <div className="card feature-card" style={{ background: 'var(--bg-primary)' }}>
              <div className="feature-icon"><Database size={24} strokeWidth={1.5} color="var(--blue)" /></div>
              <h3>Drop-In Protection</h3>
              <p>Deploy once to protect any lending pool instantly.</p>
            </div>
            <div className="card feature-card" style={{ background: 'var(--bg-primary)' }}>
              <div className="feature-icon"><CheckCircle size={24} strokeWidth={1.5} color="var(--blue)" /></div>
              <h3>Native Integration</h3>
              <p>Built exclusively for Somnia's <code>SomniaEventHandler</code>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Contracts & Coverage ── */}
      <section className="landing-section" id="contracts">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title"><Database size={24} color="var(--blue)" /> Live Contracts</h2>
            <p className="section-lead"><b>Deployed and Active on Somnia Devnet</b></p>
          </div>
          
          <div className="contracts-table-container card">
            <table className="contracts-table">
              <thead>
                <tr>
                  <th>Contract</th>
                  <th>Address (Selectable)</th>
                  <th>Network</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={16} color="var(--blue)" />
                      <b>MockOracle</b>
                    </div>
                  </td>
                  <td className="addr-cell">0xE5b2AD1558949447eD7b135ceB40baA894f417A1</td>
                  <td>Somnia Devnet</td>
                </tr>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={16} color="var(--blue)" />
                      <b>ReactGuard</b>
                    </div>
                  </td>
                  <td className="addr-cell" style={{ color: 'var(--blue)' }}>0x654Af00Ef47437911d52D12A88085E8f65b0F940</td>
                  <td>Somnia Devnet</td>
                </tr>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Database size={16} color="var(--blue)" />
                      <b>MockLendingPool</b>
                    </div>
                  </td>
                  <td className="addr-cell">0xA8DC52496d077E823675F114f2D8469C7a6E97d8</td>
                  <td>Somnia Devnet</td>
                </tr>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Zap size={16} color="var(--blue)" />
                      <b>Subscription ID</b>
                    </div>
                  </td>
                  <td className="addr-cell">6879957816108517943170610238244214937208003125</td>
                  <td>Somnia Precompile</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="grid-2 mt-4" style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="card" style={{ background: 'var(--bg-secondary)' }}>
              <h3><TrendingDown size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }}/> 19 Tests. All Passing.</h3>
              <p className="mt-2 text-muted" style={{ fontSize: '13px' }}>Complete end-to-end attack scenario verified locally via Hardhat.</p>
            </div>
            <div className="card" style={{ background: 'var(--bg-secondary)' }}>
              <h3><Shield size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} color="var(--blue)"/> Proof of Reactivity</h3>
              <p className="mt-2 text-muted" style={{ fontSize: '13px' }}>View internal transactions on the Shannon Explorer originating exactly from <code>0x000...0100</code>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sponsors ── */}
      <section className="landing-section alt-bg" id="sponsors" style={{ paddingBottom: '120px' }}>
        <div className="section-container text-center">
          <div className="section-header">
            <h2 className="section-title">Sponsors & Partners</h2>
            <p className="section-lead">ReactGuard is built for the Somnia Reactivity Mini Hackathon</p>
          </div>
          
          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginTop: '48px' }}>
            <div className="sponsor-tier">
              <h4 style={{ marginBottom: '16px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Hackathon Organizer</h4>
              <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border)', minHeight: '140px' }}>
                <img src={DoraLogo} alt="DoraHacks" style={{ height: '240px', width: 'auto', borderRadius: 'var(--radius)' }} />
              </div>
            </div>
            
            <div className="sponsor-tier">
              <h4 style={{ marginBottom: '16px', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Testnet Token Provider</h4>
              <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border)', minHeight: '140px' }}>
                <img src={SomniaLogo} alt="Somnia" style={{ height: '240px', width: 'auto', borderRadius: 'var(--radius)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-primary)', padding: '80px 24px' }}>
        <div className="section-container" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '48px', textAlign: 'left' }}>
          {/* Column 1: Brand */}
          <Link to="/" className="footer-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer', textDecoration: 'none' }}>
            <div className="logo" style={{ marginBottom: '20px' }}>
              <div className="logo-icon"><Shield size={20} color="#fff" /></div>
              <div className="logo-text"><h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '800' }}>ReactGuard</h1></div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', maxWidth: '240px' }}>
              The first DeFi guardian that defends protocols entirely on-chain, with sub-second finality.
            </p>
          </Link>

          {/* Column 2: Product */}
          <div className="footer-links">
            <h4 style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Product</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="#why" className="nav-link" style={{ fontSize: '14px' }}>Why Choose Us</a></li>
              <li><a href="#how-it-works" className="nav-link" style={{ fontSize: '14px' }}>How It Works</a></li>
              <li><a href="#features" className="nav-link" style={{ fontSize: '14px' }}>Features</a></li>
              <li><Link to="/docs" className="nav-link" style={{ fontSize: '14px' }}>Docs</Link></li>
              <li><a href="#sponsors" className="nav-link" style={{ fontSize: '14px' }}>Sponsors</a></li>
            </ul>
          </div>

          {/* Column 3: Connect */}
          <div className="footer-links">
            <h4 style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Connect</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="https://github.com/Ankit-raj-11/ReactGuard" target="_blank" rel="noreferrer" className="nav-link" style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={GithubIcon} alt="GitHub" style={{ width: '16px', height: '16px', filter: 'brightness(0) invert(1)' }} /> Repository
              </a></li>
              <li><a href="https://x.com/nikhil_py" target="_blank" rel="noreferrer" className="nav-link" style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={XIcon} alt="X" style={{ width: '14px', height: '14px', filter: 'brightness(0) invert(1)' }} /> Nikhil @nikhil_py
              </a></li>
              <li><a href="https://x.com/Ankitraj411085" target="_blank" rel="noreferrer" className="nav-link" style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={XIcon} alt="X" style={{ width: '14px', height: '14px', filter: 'brightness(0) invert(1)' }} /> Ankit @Ankitraj411085
              </a></li>
            </ul>
          </div>
        </div>

        <div className="section-container" style={{ marginTop: '60px', paddingTop: '30px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
          <p>© 2025 ReactGuard. All rights reserved.</p>
          <p>Built with <b>Somnia Native Reactivity</b></p>
        </div>
      </footer>
    </div>
  );
}
