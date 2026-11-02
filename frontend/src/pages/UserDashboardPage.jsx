import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  Sparkles,
  Bell,
  User as UserIcon,
  CheckCircle,
  Clock,
  Award,
  Trash2,
  Edit,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { itemAPI, claimAPI, matchAPI, authAPI } from '../services/api';
import MatchCard from '../components/MatchCard';

const UserDashboardPage = () => {
  const { user, updateUser } = useAuth();
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [claims, setClaims] = useState([]);
  const [matchesData, setMatchesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileStudentId, setProfileStudentId] = useState(user?.studentId || '');
  const [profileDepartment, setProfileDepartment] = useState(user?.department || '');
  const [profileCollege, setProfileCollege] = useState(user?.college || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [reportsRes, claimsRes, matchesRes] = await Promise.all([
        itemAPI.getMyReports(),
        claimAPI.getMyClaims(),
        matchAPI.getMyMatches(),
      ]);

      setReports(reportsRes.data.items || []);
      setClaims(claimsRes.data.claims || []);
      setMatchesData(matchesRes.data.results || []);

      if (user) {
        setProfileName(user.name || '');
        setProfilePhone(user.phone || '');
        setProfileStudentId(user.studentId || '');
        setProfileDepartment(user.department || '');
        setProfileCollege(user.college || '');
        setProfileAvatar(user.avatar || '');
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    try {
      const res = await authAPI.updateProfile({
        name: profileName,
        phone: profilePhone,
        avatar: profileAvatar,
        studentId: profileStudentId,
        department: profileDepartment,
        college: profileCollege,
      });
      updateUser(res.data.user);
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      setProfileErr(err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      setProfileMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setProfileErr(err.message);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* User Overview Header */}
      <div
        className="card"
        style={{
          padding: '1.75rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--teal-500)' }}
            />
          ) : (
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--teal-600)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--teal-600)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                🎓 Campus Student Dashboard
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', color: 'var(--navy-900)', marginBottom: '0.35rem', fontWeight: 800 }}>
              Welcome, {user?.name || 'Student'}!
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span>{user?.email}</span>
              {user?.studentId && (
                <>
                  <span>&bull;</span>
                  <span style={{ fontWeight: 600, color: 'var(--navy-800)' }}>
                    Roll/ID: {user.studentId}
                  </span>
                </>
              )}
              {user?.department && (
                <>
                  <span>&bull;</span>
                  <span style={{ fontWeight: 600, color: 'var(--teal-700)' }}>
                    {user.department}
                  </span>
                </>
              )}
              {user?.college && (
                <>
                  <span>&bull;</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {user.college}
                  </span>
                </>
              )}
              <span>&bull;</span>
              <span className={`badge ${user?.role === 'admin' ? 'badge-match' : 'badge-found'}`}>
                {user?.role}
              </span>
              <span>&bull;</span>
              <span style={{ color: 'var(--teal-700)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Award size={15} /> {user?.reputationScore || 0} Reputation Points
              </span>
            </div>
          </div>
        </div>

        <Link to="/report" className="btn btn-primary">
          + Report New Item
        </Link>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--border-color)',
          marginBottom: '2rem',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'reports' ? '3px solid var(--teal-600)' : '3px solid transparent',
            color: activeTab === 'reports' ? 'var(--teal-700)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <FileText size={18} /> My Reports ({reports.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('claims')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'claims' ? '3px solid var(--teal-600)' : '3px solid transparent',
            color: activeTab === 'claims' ? 'var(--teal-700)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <ShieldCheck size={18} /> My Claims ({claims.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matches')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'matches' ? '3px solid var(--teal-600)' : '3px solid transparent',
            color: activeTab === 'matches' ? 'var(--teal-700)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Sparkles size={18} style={{ color: 'var(--teal-600)' }} /> Smart Matches ({matchesData.reduce((acc, m) => acc + m.matchCount, 0)})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'notifications' ? '3px solid var(--teal-600)' : '3px solid transparent',
            color: activeTab === 'notifications' ? 'var(--teal-700)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Bell size={18} /> Notifications ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'profile' ? '3px solid var(--teal-600)' : '3px solid transparent',
            color: activeTab === 'profile' ? 'var(--teal-700)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <UserIcon size={18} /> Profile & Security
        </button>
      </div>

      {/* Tab 1: My Reports */}
      {activeTab === 'reports' && (
        <div>
          {reports.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
              <FileText size={40} style={{ opacity: 0.3, margin: '0 auto 1rem', color: 'var(--teal-600)' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Reports Submitted Yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Have you lost or found something? File a report to trigger automated matching.
              </p>
              <Link to="/report" className="btn btn-primary">
                + File Your First Report
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reports.map((item) => (
                <div
                  key={item._id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <img
                      src={
                        item.images && item.images.length > 0
                          ? item.images[0].url
                          : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=150'
                      }
                      alt={item.title}
                      style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span className={`badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                          {item.type}
                        </span>
                        <span
                          className={`badge ${
                            item.status === 'reunited'
                              ? 'badge-reunited'
                              : item.status === 'claimed'
                              ? 'badge-claimed'
                              : 'badge-active'
                          }`}
                        >
                          {item.status}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.category}
                        </span>
                      </div>
                      <Link to={`/items/${item._id}`}>
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)' }}>{item.title}</h3>
                      </Link>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {item.location?.city} &bull; Reported {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Link to={`/items/${item._id}`} className="btn btn-outline btn-sm">
                      View Details
                    </Link>
                    <Link to={`/edit-item/${item._id}`} className="btn btn-outline btn-sm">
                      <Edit size={14} /> Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Claims */}
      {activeTab === 'claims' && (
        <div>
          {claims.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
              <ShieldCheck size={40} style={{ opacity: 0.3, margin: '0 auto 1rem', color: 'var(--teal-600)' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Claims Filed</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                When you find your lost item reported by someone else, you can submit an ownership claim with proof.
              </p>
              <Link to="/browse?type=found" className="btn btn-primary">
                Browse Found Items
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {claims.map((claim) => (
                <div key={claim._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span
                        className={`badge ${
                          claim.status === 'approved'
                            ? 'badge-approved'
                            : claim.status === 'rejected'
                            ? 'badge-rejected'
                            : claim.status === 'reunited'
                            ? 'badge-reunited'
                            : 'badge-pending'
                        }`}
                        style={{ marginBottom: '0.5rem' }}
                      >
                        {claim.status}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)' }}>
                        Claim for: {claim.item?.title || 'Report Item'}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Submitted {new Date(claim.createdAt).toLocaleDateString()} &bull; Finder: {claim.item?.reportedBy?.name || 'Community Member'}
                      </div>
                    </div>

                    {claim.item && (
                      <Link to={`/items/${claim.item._id}`} className="btn btn-outline btn-sm">
                        View Item Report <ExternalLink size={14} />
                      </Link>
                    )}
                  </div>

                  <div style={{ backgroundColor: 'var(--border-light)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <strong>Your Proof Details:</strong> {claim.proofDescription}
                  </div>

                  {claim.adminNotes && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--teal-800)', backgroundColor: 'var(--teal-50)', padding: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
                      <strong>Review Note:</strong> {claim.adminNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Potential Matches */}
      {activeTab === 'matches' && (
        <div>
          {matchesData.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
              <Sparkles size={40} style={{ opacity: 0.3, margin: '0 auto 1rem', color: 'var(--teal-600)' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Active Smart Matches Yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Our background engine continually scans new reports. As soon as an opposite item matches yours, you'll receive a notification and see it here.
              </p>
            </div>
          ) : (
            matchesData.map((group) => (
              <div key={group.myItem._id} style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span className={`badge ${group.myItem.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                    Your {group.myItem.type} report
                  </span>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)' }}>
                    {group.myItem.title} ({group.matchCount} Matches)
                  </h3>
                </div>

                <div className="grid-2">
                  {group.matches.map((m) => (
                    <MatchCard key={m.item._id} match={m} sourceItem={group.myItem} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Notifications */}
      {activeTab === 'notifications' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)' }}>Notification Activity Stream</h3>
            {notifications.length > 0 && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={markAllAsRead}
              >
                Mark All as Read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No notifications on record.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map((n) => (
                <div
                  key={n._id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: n.read ? '#ffffff' : '#f0fdfa',
                    border: `1px solid ${n.read ? 'var(--border-color)' : 'var(--teal-100)'}`,
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--teal-50)',
                        color: 'var(--teal-600)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Bell size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {!n.read && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => markAsRead(n._id)}
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteNotification(n._id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Profile & Security */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Profile Details */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: 'var(--navy-900)' }}>
              Profile Information
            </h3>

            {profileMsg && (
              <div style={{ padding: '0.65rem', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {profileMsg}
              </div>
            )}
            {profileErr && (
              <div style={{ padding: '0.65rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {profileErr}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ backgroundColor: 'var(--border-light)' }}
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Student / Roll Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2024CS104"
                    value={profileStudentId}
                    onChange={(e) => setProfileStudentId(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department / Branch</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Computer Science & Engg."
                    value={profileDepartment}
                    onChange={(e) => setProfileDepartment(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">College / Campus Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Campus College"
                  value={profileCollege}
                  onChange={(e) => setProfileCollege(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Phone / WhatsApp</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Avatar Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/photo.jpg"
                  value={profileAvatar}
                  onChange={(e) => setProfileAvatar(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                Save Profile
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: 'var(--navy-900)' }}>
              Change Password
            </h3>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password (Min. 6 chars)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-navy" style={{ marginTop: '0.5rem' }}>
                <Lock size={16} /> Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboardPage;
