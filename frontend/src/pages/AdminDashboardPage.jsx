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
import { adminAPI, claimAPI } from '../services/api';
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
  const [processingClaimId, setProcessingClaimId] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);

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
      console.error('Error loading claims:', err);
      setActionMsg(
        err.response?.data?.message || err.message || 'Unable to load claims.'
      );
    }
  };

  // Approve a pending claim using the claimAPI service.
  const handleApproveClaim = async (claimId) => {
    if (!claimId || processingClaimId) return;

    try {
      setProcessingClaimId(claimId);
      setActionMsg('');

      const targetClaim = claims.find((c) => c._id === claimId);
      const finderName = targetClaim?.item?.reportedBy?.name || 'Found student';
      const claimantName = targetClaim?.claimant?.name || 'Owner';
      const phone = targetClaim?.contactPhone || targetClaim?.claimant?.phone || '';

      await claimAPI.reviewClaimStatus(claimId, {
        status: 'approved',
        adminNotes: `Verified by Admin as the genuine owner. Handover instructed to ${finderName}.`,
      });

      setActionMsg(
        `✓ Claim approved! Verified that ${claimantName} is the real owner. Notification with phone number (${phone || 'provided'}) sent to ${finderName} to submit/handover the item.`
      );
      await loadClaims();
      await loadAdminOverview();
    } catch (err) {
      console.error('Claim approval failed:', err);
      setActionMsg(
        err.response?.data?.message ||
        err.message ||
        'Failed to approve claim. Please try again.'
      );
    } finally {
      setProcessingClaimId(null);
    }
  };

  const handleRejectClaim = async (claimId) => {
    if (!claimId || processingClaimId) return;
    const reason = window.prompt('Enter reason for claim rejection (optional):', 'Proof insufficient or does not match');
    if (reason === null) return;

    try {
      setProcessingClaimId(claimId);
      setActionMsg('');

      await claimAPI.reviewClaimStatus(claimId, {
        status: 'rejected',
        adminNotes: reason,
      });

      setActionMsg('Claim has been rejected.');
      await loadClaims();
      await loadAdminOverview();
    } catch (err) {
      console.error('Claim rejection failed:', err);
      setActionMsg(
        err.response?.data?.message ||
        err.message ||
        'Failed to reject claim. Please try again.'
      );
    } finally {
      setProcessingClaimId(null);
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
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                        {c.item?.title || 'Unknown Item'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Found by: <strong style={{ color: 'var(--teal-700)' }}>{c.item?.reportedBy?.name || 'Student'}</strong>
                        {c.item?.reportedBy?.phone && ` (${c.item.reportedBy.phone})`}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600 }}>{c.claimant?.name || 'Unknown'}</div>
                      {c.claimant?.studentId && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ID: {c.claimant.studentId}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', maxWidth: '280px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.proofDescription}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedClaim(c)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--teal-600)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          padding: 0,
                          fontWeight: 600,
                          marginTop: '2px',
                        }}
                      >
                        View Full Proof {c.proofImages?.length ? `(${c.proofImages.length} images)` : ''}
                      </button>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 600, color: '#16a34a' }}>
                        {c.contactPhone || c.claimant?.phone || 'No phone'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {c.contactEmail || c.claimant?.email}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${c.status === 'approved' ? 'badge-approved' : c.status === 'rejected' ? 'badge-rejected' : c.status === 'reunited' ? 'badge-reunited' : 'badge-pending'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      {c.status === 'pending' ? (
                        <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            style={{ backgroundColor: '#0d9488' }}
                            disabled={processingClaimId === c._id || processingClaimId !== null}
                            onClick={() => handleApproveClaim(c._id)}
                          >
                            {processingClaimId === c._id ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            disabled={processingClaimId === c._id || processingClaimId !== null}
                            onClick={() => handleRejectClaim(c._id)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : c.status === 'approved' ? (
                        <span style={{ color: '#059669', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle size={14} /> Approved (Owner Notified)
                        </span>
                      ) : c.status === 'reunited' ? (
                        <span style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: 600 }}>
                          ✓ Reunited
                        </span>
                      ) : (
                        <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                          Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Proof Details Modal for Admin */}
          {selectedClaim && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
              }}
            >
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  maxWidth: '560px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-xl)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)' }}>
                    Claim Proof Review: {selectedClaim.item?.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedClaim(null)}
                    style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    &times;
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                  <div style={{ backgroundColor: 'var(--border-light)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                    <div><strong>Claimant:</strong> {selectedClaim.claimant?.name}</div>
                    <div><strong>Phone:</strong> {selectedClaim.contactPhone || selectedClaim.claimant?.phone || 'None'}</div>
                    <div><strong>Email:</strong> {selectedClaim.contactEmail || selectedClaim.claimant?.email}</div>
                    <div style={{ marginTop: '0.25rem', color: 'var(--teal-700)' }}>
                      <strong>Found by:</strong> {selectedClaim.item?.reportedBy?.name || 'Student'}
                    </div>
                  </div>

                  <div>
                    <strong>Proof Description:</strong>
                    <div style={{ marginTop: '0.25rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', whiteSpace: 'pre-wrap' }}>
                      {selectedClaim.proofDescription}
                    </div>
                  </div>

                  {selectedClaim.proofImages && selectedClaim.proofImages.length > 0 && (
                    <div>
                      <strong>Submitted Proof Images ({selectedClaim.proofImages.length}):</strong>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        {selectedClaim.proofImages.map((img, idx) => (
                          <a key={idx} href={img.url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={img.url}
                              alt={`Proof ${idx + 1}`}
                              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedClaim.securityAnswers && selectedClaim.securityAnswers.length > 0 && (
                    <div>
                      <strong>Security Questions & Answers:</strong>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {selectedClaim.securityAnswers.map((sa, idx) => (
                          <div key={idx} style={{ padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Q: {sa.question}</div>
                            <div style={{ fontWeight: 600 }}>A: {sa.answer}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setSelectedClaim(null)}
                  >
                    Close
                  </button>
                  {selectedClaim.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        disabled={processingClaimId === selectedClaim._id}
                        onClick={() => {
                          const id = selectedClaim._id;
                          setSelectedClaim(null);
                          handleRejectClaim(id);
                        }}
                      >
                        Reject Claim
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        style={{ backgroundColor: '#0d9488' }}
                        disabled={processingClaimId === selectedClaim._id}
                        onClick={() => {
                          const id = selectedClaim._id;
                          setSelectedClaim(null);
                          handleApproveClaim(id);
                        }}
                      >
                        Approve Claim
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
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
