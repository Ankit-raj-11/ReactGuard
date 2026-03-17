import { Link } from "../App.jsx";
import { Shield, Play } from "../icons.jsx";
import GithubIcon from "../assets/github.png";
import XIcon from "../assets/x.png";
import SnapshotImg from "../assets/Snapshot.png";
import "../index.css";
import "../landing.css";

export default function Docs() {
  return (
    <div className="landing-container">
      {/* ── Minimal Navigation ── */}
      <nav className="landing-nav">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          <div className="logo-icon">
            <Shield size={20} strokeWidth={2} color="#fff" />
          </div>
          <div className="logo-text">
            <h1>ReactGuard</h1>
          </div>
        </Link>
        
        <div className="landing-nav-links">
          <Link to="/simulation" className="connect-btn" style={{ textDecoration: 'none' }}>
            Launch Sim
          </Link>
        </div>
      </nav>

      <main style={{ minHeight: '80vh', paddingTop: '140px', paddingBottom: '100px' }}>
        <div className="section-container text-center">
          <div style={{ color: 'var(--blue)', fontSize: '14px', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Resources & Guides
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: '800', marginBottom: '24px', letterSpacing: '-0.03em' }}>Documentation</h1>
          
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 60px', lineHeight: '1.6' }}>
            Learn how ReactGuard leverages Somnia's Native Reactivity to secure the next generation of DeFi protocols.
          </p>

          {/* ── Video/Showcase Placeholder ── */}
          <div className="showcase-container" style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <div className="showcase-topbar">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <span style={{ marginLeft: '12px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>showcase_demonstration.mp4</span>
            </div>
            <div className="showcase-content" style={{ position: 'relative', background: '#000' }}>
              <img 
                src={SnapshotImg} 
                alt="Showcase Preview" 
                style={{ width: '100%', height: 'auto', opacity: 0.4, filter: 'grayscale(1) contrast(1.2)' }} 
              />
              
              {/* Play Overlay */}
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid var(--blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)',
                backdropFilter: 'blur(4px)'
              }}>
                <Play size={32} color="var(--blue)" fill="var(--blue)" style={{ marginLeft: '4px' }} />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '60px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '40px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Detailed Technical Breakdown Coming Soon</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              We are currently finalizing the comprehensive documentation, integration guides, and API references. 
              In the meantime, explore our <a href="https://github.com/Ankit-raj-11/ReactGuard" target="_blank" rel="noreferrer" className="nav-link" style={{ display: 'inline', color: 'var(--blue)' }}>GitHub repository</a> for the source code and implementation details.
            </p>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="footer" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-primary)', padding: '80px 24px' }}>
        <div className="section-container" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '48px', textAlign: 'left' }}>
          <Link to="/" className="footer-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer', textDecoration: 'none' }}>
            <div className="logo" style={{ marginBottom: '20px' }}>
              <div className="logo-icon"><Shield size={20} color="#fff" /></div>
              <div className="logo-text"><h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '800' }}>ReactGuard</h1></div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', maxWidth: '240px' }}>
              The first DeFi guardian that defends protocols entirely on-chain, with sub-second finality.
            </p>
          </Link>

          <div className="footer-links">
            <h4 style={{ color: '#fff', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Product</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link to="/" className="nav-link" style={{ fontSize: '14px' }}>Home</Link></li>
              <li><Link to="/simulation" className="nav-link" style={{ fontSize: '14px' }}>Simulation</Link></li>
              <li><a href="https://github.com/Ankit-raj-11/ReactGuard" target="_blank" rel="noreferrer" className="nav-link" style={{ fontSize: '14px' }}>GitHub</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4 style={{ color: '#fff', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Connect</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
