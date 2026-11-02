import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  FileText,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Trash2,
  Lock,
  Unlock,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import StatCard from '../components/StatCard';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Data collections
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [logs, setLogs] = useState([]);

  // Search & Filter state
  const [userSearch, setUserSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [claimStatus, setClaimStatus] = useState('All');
  const [suspiciousFilter, setSuspiciousFilter] = useState('All');

  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const loadAdminOverview = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getStats();
      setStats(res.data.stats);
      setCategoryStats(res.data.categoryStats || []);
      setMonthlyTrends(res.data.monthlyTrends || []);
      setRecentActivity(res.data.recentActivity || []);
    } catch (err) {
      console.error('Error loading admin overview:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await adminAPI.getUsers({ search: userSearch, limit: 50 });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadItems = async () => {
    try {
      const res = await adminAPI.getItems({
        search: itemSearch,
        isSuspicious: suspiciousFilter,
        limit: 50,
      });
      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadClaims = async () => {
    try {
      const res = await adminAPI.getClaims({ status: claimStatus, limit: 50 });
      setClaims(res.data.claims || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await adminAPI.getActivityLogs({ limit: 50 });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAdminOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'reports') loadItems();
    if (activeTab === 'claims') loadClaims();
    if (activeTab === 'logs') loadLogs();
  }, [activeTab, userSearch, itemSearch, claimStatus, suspiciousFilter]);

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (window.confirm(`Change this user's role to ${newRole}?`)) {
      try {
        await adminAPI.updateUserRole(userId, newRole);
        setActionMsg(`User role updated to ${newRole}.`);
        loadUsers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      await adminAPI.toggleUserBan(userId);
      setActionMsg('User status updated.');
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleModerateItem = async (itemId, isSuspicious) => {
    const notes = prompt('Enter moderation notes (optional):', '');
    try {
      await adminAPI.moderateItem(itemId, {
        isSuspicious: !isSuspicious,
        moderationNotes: notes || '',
      });
      setActionMsg(`Item ${!isSuspicious ? 'flagged as suspicious' : 'approved'}.`);
      loadItems();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Shield size={24} style={{ color: 'var(--teal-600)' }} />
            <h1 style={{ fontSize: '2rem', color: 'var(--navy-900)' }}>
              LostLink Administrator Portal
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Real-time platform metrics, content moderation, claim approvals, user management, and security logs.
          </p>
        </div>
      </div>

      {actionMsg && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #a7f3d0' }}>
          {actionMsg}
        </div>
      )}

      {/* KPI Cards */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            changeText="Registered accounts"
            color="#0d9488"
          />
          <StatCard
            title="Total Reports"
            value={stats.totalItems}
            icon={FileText}
            changeText={`${stats.totalLost} Lost / ${stats.totalFound} Found`}
            color="#0284c7"
          />
          <StatCard
            title="Recovery Rate"
            value={`${stats.recoveryRate}%`}
            icon={TrendingUp}
            changeText={`${stats.totalReunited} items returned`}
            color="#10b981"
          />
          <StatCard
            title="Suspicious Reports"
            value={stats.suspiciousItems}
            icon={AlertTriangle}
            changeText={`${stats.pendingClaims} claims pending review`}
            color="#ef4444"
          />
        </div>
      )}

      {/* Tabs */}
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
          onClick={() => setActiveTab('overview')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '3px solid var(--teal-600)' : '3px solid transparent',
            color: activeTab === 'overview' ? 'var(--teal-700)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          <Activity size={18} /> Analytics & Overview
        </button>

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
          }}
        >
          <FileText size={18} /> Moderate Reports
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
          }}
        >
          <ShieldCheck size={18} /> Review Claims
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '3px solid var(--teal-600)' : '3px solid transparent',
            color: activeTab === 'users' ? 'var(--teal-700)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          <Users size={18} /> Manage Users
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'logs' ? '3px solid var(--teal-600)' : '3px solid transparent',
            color: activeTab === 'logs' ? 'var(--teal-700)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          <Activity size={18} /> Activity & Audit Logs
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Category Distribution */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: 'var(--navy-900)' }}>
              Reports by Category
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {categoryStats.map((c) => (
                <div key={c._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{c._id}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {c.lost} Lost / {c.found} Found ({c.count} total)
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (c.count / (stats?.totalItems || 1)) * 100)}%`,
                        backgroundColor: 'var(--teal-600)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent System Activity */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: 'var(--navy-900)' }}>
              Recent Audit Log
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentActivity.map((log) => (
                <div
                  key={log._id}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.825rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--teal-800)' }}>{log.action}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    User: {log.user?.name || 'System / Guest'} &bull; {JSON.stringify(log.details)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Reports Moderation */}
      {activeTab === 'reports' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search reports by title, brand, description..."
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                className="form-input"
              />
            </div>
            <select
              className="form-select"
              style={{ width: '180px' }}
              value={suspiciousFilter}
              onChange={(e) => setSuspiciousFilter(e.target.value)}
            >
              <option value="All">All Reports</option>
              <option value="true">Flagged Suspicious Only</option>
              <option value="false">Normal Reports Only</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Item</th>
                  <th style={{ padding: '0.75rem' }}>Type</th>
                  <th style={{ padding: '0.75rem' }}>Category</th>
                  <th style={{ padding: '0.75rem' }}>Location</th>
                  <th style={{ padding: '0.75rem' }}>Reporter</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Suspicious</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{it.title}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${it.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                        {it.type}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{it.category}</td>
                    <td style={{ padding: '0.75rem' }}>{it.location?.city}</td>
                    <td style={{ padding: '0.75rem' }}>{it.reportedBy?.name}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="badge badge-active">{it.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {it.isSuspicious ? (
                        <span style={{ color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <AlertTriangle size={14} /> Flagged
                        </span>
                      ) : (
                        <span style={{ color: '#10b981' }}>Clear</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        className={`btn btn-sm ${it.isSuspicious ? 'btn-outline' : 'btn-danger'}`}
                        onClick={() => handleModerateItem(it._id, it.isSuspicious)}
                      >
                        {it.isSuspicious ? 'Approve' : 'Flag'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Claims Moderation */}
      {activeTab === 'claims' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Platform Claims Review</h3>
            <select
              className="form-select"
              style={{ width: '160px' }}
              value={claimStatus}
              onChange={(e) => setClaimStatus(e.target.value)}
            >
              <option value="All">All Claims</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="reunited">Reunited</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Item</th>
                  <th style={{ padding: '0.75rem' }}>Claimant</th>
                  <th style={{ padding: '0.75rem' }}>Proof Details</th>
                  <th style={{ padding: '0.75rem' }}>Contact</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{c.item?.title || 'Unknown'}</td>
                    <td style={{ padding: '0.75rem' }}>{c.claimant?.name}</td>
                    <td style={{ padding: '0.75rem', maxWidth: '280px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.proofDescription}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{c.contactPhone || c.contactEmail}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${c.status === 'approved' ? 'badge-approved' : c.status === 'rejected' ? 'badge-rejected' : 'badge-pending'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      {c.status === 'pending' && (
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={async () => {
                              await adminAPI.reviewClaimStatus?.(c._id, { status: 'approved' });
                              loadClaims();
                            }}
                          >
                            Approve
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="card">
          <div style={{ marginBottom: '1.25rem', maxWidth: '320px' }}>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="form-input"
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>User</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem' }}>Reputation</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '0.75rem' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-match' : 'badge-found'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{u.reputationScore} pts</td>
                    <td style={{ padding: '0.75rem' }}>
                      {u.isBanned ? (
                        <span style={{ color: '#ef4444', fontWeight: 700 }}>Suspended</span>
                      ) : (
                        <span style={{ color: '#10b981' }}>Active</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleRoleChange(u._id, u.role)}
                        >
                          Toggle Role
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${u.isBanned ? 'btn-primary' : 'btn-danger'}`}
                          onClick={() => handleToggleBan(u._id)}
                        >
                          {u.isBanned ? 'Unban' : 'Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Activity Logs */}
      {activeTab === 'logs' && (
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Security & Audit Trail</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {logs.map((log) => (
              <div
                key={log._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--teal-700)', marginRight: '0.75rem' }}>
                    {log.action}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--navy-900)' }}>
                    by {log.user?.name || 'System / Guest'} ({log.user?.email || 'N/A'})
                  </span>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Details: {JSON.stringify(log.details)}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
