import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Lock, Mail, AlertCircle, ArrowRight, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError('');
    try {
      await login(demoEmail, demoPass);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <div className="brand-icon">
              <Sparkles size={22} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--navy-900)' }}>
              Campus <span style={{ color: 'var(--teal-600)' }}>LostLink</span>
            </span>
          </Link>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--navy-900)' }}>Student & Staff Sign In</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Sign in to access your reports, claims, and smart match alerts.
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 'var(--radius-md)',
                color: '#b91c1c',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.75rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              One-Click Demo Credentials
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'space-between', color: 'var(--teal-700)' }}
                onClick={() => handleQuickDemo('admin@lostlink.com', 'Admin@123456')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Shield size={14} /> Log in as Admin
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>admin@lostlink.com</span>
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'space-between' }}
                onClick={() => handleQuickDemo('alex@example.com', 'User@123456')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={14} /> Log in as Alex (Lost item)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>alex@example.com</span>
              </button>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'space-between' }}
                onClick={() => handleQuickDemo('sarah@example.com', 'User@123456')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={14} /> Log in as Sarah (Found item)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>sarah@example.com</span>
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
          }}
        >
          New student, faculty or staff member?{' '}
          <Link to="/register" style={{ color: 'var(--teal-600)', fontWeight: 700, display: 'inline-block', marginLeft: '4px' }}>
            Sign Up (Create Account) &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
