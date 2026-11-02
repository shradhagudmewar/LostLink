import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Heart, MapPin, CheckCircle, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#090d16',
        color: '#94a3b8',
        borderTop: '1px solid #1e293b',
        paddingTop: '3.5rem',
        paddingBottom: '2.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid #1e293b',
          }}
        >
          {/* Brand info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--teal-500) 0%, #0f172a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Sparkles size={18} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', color: '#ffffff' }}>
                Lost<span style={{ color: 'var(--teal-400)' }}>Link</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              The modern, community-driven platform for reporting, discovering, and intelligently recovering lost & found items with AI-style matching.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', backgroundColor: '#0f2744', color: 'var(--teal-400)', fontSize: '0.775rem', fontWeight: 600 }}>
              <CheckCircle size={14} /> Smart Matching Engine Active
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 700 }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/browse?type=lost" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  Lost Items Directory
                </Link>
              </li>
              <li>
                <Link to="/browse?type=found" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  Found Items Directory
                </Link>
              </li>
              <li>
                <Link to="/report" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  Report Lost / Found Item
                </Link>
              </li>
              <li>
                <Link to="/matches" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>
                  Smart Match Scorecard
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 700 }}>
              Verification & Security
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={15} style={{ color: 'var(--teal-400)' }} /> Secret Security Questions
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={15} style={{ color: 'var(--teal-400)' }} /> Ownership Proof Audits
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={15} style={{ color: 'var(--teal-400)' }} /> Finder Reputation System
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={15} style={{ color: 'var(--teal-400)' }} /> Geo-Proximity Filtering
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 700 }}>
              Platform Stack
            </h4>
            <p style={{ fontSize: '0.825rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              Full-Stack MERN Architecture: MongoDB, Express.js, React (Vite), Node.js, JWT, Cloudinary Image Storage & Lucide Icons.
            </p>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Production Grade &bull; RESTful APIs &bull; Secure Auth
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: '1.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.8rem',
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} LostLink. All rights reserved. Built with pride for returning lost treasures.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
