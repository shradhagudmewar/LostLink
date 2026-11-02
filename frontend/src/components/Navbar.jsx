import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Bell,
  User,
  Shield,
  Sparkles,
  LogOut,
  Menu,
  X,
  CheckCircle,
  FileText,
  Award,
  GraduationCap,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="brand">
          <div className="brand-icon">
            <GraduationCap size={22} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ lineHeight: 1.1 }}>
              Campus <span style={{ color: 'var(--teal-600)' }}>LostLink</span>
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              College Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav>
          <ul className="nav-links">
            <li>
              <Link
                to="/"
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/browse"
                className={`nav-link ${location.pathname.startsWith('/browse') ? 'active' : ''}`}
              >
                <Search size={16} /> Browse Items
              </Link>
            </li>
            <li>
              <Link
                to="/matches"
                className={`nav-link ${location.pathname === '/matches' ? 'active' : ''}`}
              >
                <Sparkles size={16} style={{ color: 'var(--teal-600)' }} /> Smart Matches
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link
                  to="/admin"
                  className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                  style={{ color: '#0d9488', fontWeight: 600 }}
                >
                  <Shield size={16} /> Admin Portal
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Right Actions */}
        <div className="nav-actions">
          <Link to="/report" className="btn btn-primary btn-sm">
            <PlusCircle size={17} />
            <span>Report Item</span>
          </Link>

          {isAuthenticated ? (
            <>
              {/* Notifications Dropdown */}
              <div style={{ position: 'relative' }} ref={notifRef}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '0.45rem', borderRadius: '50%', position: 'relative' }}
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '120%',
                      width: '340px',
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-xl)',
                      border: '1px solid var(--border-color)',
                      zIndex: 200,
                      overflow: 'hidden',
                      animation: 'slideUp 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: 'var(--border-light)',
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy-900)' }}>
                        Notifications ({unreadCount})
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--teal-600)',
                            fontSize: '0.775rem',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                          <Bell size={28} style={{ opacity: 0.4, margin: '0 auto 0.5rem' }} />
                          <p style={{ fontSize: '0.85rem' }}>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n._id}
                            onClick={() => markAsRead(n._id)}
                            style={{
                              padding: '0.75rem 1rem',
                              borderBottom: '1px solid var(--border-color)',
                              backgroundColor: n.read ? '#ffffff' : '#f0fdfa',
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                              display: 'flex',
                              gap: '0.75rem',
                              alignItems: 'flex-start',
                            }}
                          >
                            <div
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: n.read ? 'transparent' : 'var(--teal-600)',
                                marginTop: '6px',
                                flexShrink: 0,
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--navy-900)' }}>
                                {n.title}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {n.message}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {new Date(n.createdAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div
                      style={{
                        padding: '0.6rem',
                        textAlign: 'center',
                        borderTop: '1px solid var(--border-color)',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <Link
                        to="/dashboard"
                        onClick={() => setNotifDropdownOpen(false)}
                        style={{ fontSize: '0.825rem', color: 'var(--teal-600)', fontWeight: 600 }}
                      >
                        View all activity
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Menu Dropdown */}
              <div style={{ position: 'relative' }} ref={profileRef}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.5rem', padding: '0.35rem 0.65rem' }}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User size={16} />
                  )}
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user?.name?.split(' ')[0]}</span>
                </button>

                {profileDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '120%',
                      width: '230px',
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-xl)',
                      border: '1px solid var(--border-color)',
                      zIndex: 200,
                      padding: '0.5rem 0',
                      animation: 'slideUp 0.15s ease',
                    }}
                  >
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                        {user?.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                      {(user?.studentId || user?.department) && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--navy-700)', marginTop: '0.2rem', fontWeight: 600 }}>
                          {user?.studentId && `ID: ${user.studentId}`} {user?.department && `• ${user.department}`}
                        </div>
                      )}
                      <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <span className={`badge ${isAdmin ? 'badge-match' : 'badge-found'}`}>
                          {user?.role}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--teal-700)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                          <Award size={13} /> {user?.reputationScore || 0} pts
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.65rem 1rem',
                        fontSize: '0.875rem',
                        color: 'var(--navy-800)',
                        transition: 'background 0.2s',
                      }}
                    >
                      <FileText size={16} /> My Dashboard
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.65rem 1rem',
                          fontSize: '0.875rem',
                          color: 'var(--teal-700)',
                          fontWeight: 600,
                        }}
                      >
                        <Shield size={16} /> Admin Management
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.35rem 0' }} />

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.65rem 1rem',
                        fontSize: '0.875rem',
                        color: '#ef4444',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
                style={{ fontWeight: 700 }}
              >
                <UserPlus size={15} /> Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ display: 'none', padding: '0.45rem' }}
            id="mobileMenuToggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--border-color)',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/browse" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Browse Items
          </Link>
          <Link to="/matches" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
            Smart Matches
          </Link>
          {isAdmin && (
            <Link to="/admin" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Admin Portal
            </Link>
          )}
          {isAuthenticated && (
            <Link to="/dashboard" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              My Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
