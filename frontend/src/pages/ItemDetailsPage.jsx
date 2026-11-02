import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Edit,
  Trash2,
  Share2,
  ArrowLeft,
  User,
  Clock,
  Eye,
  AlertCircle,
  Award,
} from 'lucide-react';
import { itemAPI, matchAPI, claimAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ClaimModal from '../components/ClaimModal';
import MatchCard from '../components/MatchCard';

const ItemDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [userClaim, setUserClaim] = useState(null);
  const [claimsCount, setClaimsCount] = useState(0);
  const [itemClaims, setItemClaims] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedImg, setSelectedImg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const loadItem = async () => {
    setLoading(true);
    try {
      const res = await itemAPI.getItemById(id);
      setItem(res.data.item);
      setUserClaim(res.data.userClaim);
      setClaimsCount(res.data.claimsCount || 0);

      if (res.data.item.images && res.data.item.images.length > 0) {
        setSelectedImg(res.data.item.images[0].url);
      }

      // Fetch smart matches for this item
      try {
        const matchRes = await matchAPI.getItemMatches(id, { minScore: 40, limit: 4 });
        setMatches(matchRes.data.matches || []);
      } catch (mErr) {
        console.warn('Matches fetch error:', mErr.message);
      }

      // If user is owner or admin, fetch claims filed on this item
      const isOwner = user && res.data.item.reportedBy?._id === user._id;
      if (isOwner || isAdmin) {
        try {
          const claimsRes = await claimAPI.getItemClaims(id);
          setItemClaims(claimsRes.data.claims || []);
        } catch (cErr) {
          console.warn('Claims fetch error:', cErr.message);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
  }, [id, isAuthenticated]);

  const handleDeleteItem = async () => {
    if (window.confirm('Are you sure you want to permanently delete this report?')) {
      try {
        await itemAPI.deleteItem(id);
        navigate('/browse');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleReviewClaim = async (claimId, status) => {
    try {
      await claimAPI.reviewClaimStatus(claimId, { status });
      setActionSuccessMsg(`Claim status successfully set to ${status}.`);
      loadItem();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReunite = async (claimId) => {
    if (window.confirm('Confirm that this item has been safely returned to the claimant? This will complete the case.')) {
      try {
        await claimAPI.reuniteItem(claimId);
        setActionSuccessMsg('Item marked as successfully returned! Reputation points awarded.');
        loadItem();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading item details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <AlertCircle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
        <h2>Item Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || 'This report may have been removed.'}</p>
        <Link to="/browse" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Directory
        </Link>
      </div>
    );
  }

  const isOwner = user && item.reportedBy?._id === user._id;
  const isLost = item.type === 'lost';

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Back button & Action notification banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <Link to="/browse" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} /> Back to Directory
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(isOwner || isAdmin) && (
            <>
              <Link to={`/edit-item/${item._id}`} className="btn btn-outline btn-sm">
                <Edit size={14} /> Edit Report
              </Link>
              <button type="button" className="btn btn-danger btn-sm" onClick={handleDeleteItem}>
                <Trash2 size={14} /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {actionSuccessMsg && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle size={18} />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2.5rem', alignItems: 'start' }}>
        {/* Left Column: Image Gallery & Description */}
        <div>
          <div
            style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              backgroundColor: '#0f172a',
              height: '380px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {selectedImg ? (
              <img
                src={selectedImg}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ color: '#64748b', textAlign: 'center' }}>
                <Tag size={48} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p>No preview photo provided</p>
              </div>
            )}

            <div style={{ position: 'absolute', top: '15px', left: '15px' }}>
              <span className={`badge ${isLost ? 'badge-lost' : 'badge-found'}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
                {item.type}
              </span>
            </div>

            <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
              <span
                className={`badge ${
                  item.status === 'reunited'
                    ? 'badge-reunited'
                    : item.status === 'claimed'
                    ? 'badge-claimed'
                    : 'badge-active'
                }`}
                style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}
              >
                {item.status}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {item.images && item.images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {item.images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={`thumbnail-${i}`}
                  onClick={() => setSelectedImg(img.url)}
                  style={{
                    width: '75px',
                    height: '75px',
                    borderRadius: 'var(--radius-md)',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: selectedImg === img.url ? '2px solid var(--teal-600)' : '1px solid var(--border-color)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Description Section */}
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: 'var(--navy-900)' }}>
              Full Item Description
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {item.description}
            </p>
          </div>

          {/* Security Verification Questions (if finder set questions) */}
          {item.securityQuestions && item.securityQuestions.length > 0 && (
            <div className="card" style={{ marginTop: '1.5rem', backgroundColor: '#f0fdfa', borderColor: 'var(--teal-100)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <ShieldCheck size={20} style={{ color: 'var(--teal-600)' }} />
                <h3 style={{ fontSize: '1.1rem', color: 'var(--teal-900)' }}>
                  Finder Verification Challenge
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--teal-800)', marginBottom: '0.75rem' }}>
                To prevent false ownership claims, the finder created confidential verification questions. You will be asked these when submitting your claim:
              </p>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--navy-800)' }}>
                {item.securityQuestions.map((q, i) => (
                  <li key={i} style={{ marginBottom: '0.35rem' }}>
                    <strong>Q{i + 1}:</strong> {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Key Attributes & Actions */}
        <div>
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--teal-700)', backgroundColor: 'var(--teal-50)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                {item.category}
              </span>
              {item.brand && (
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-700)' }}>
                  &bull; {item.brand}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.65rem', marginBottom: '1.25rem', color: 'var(--navy-900)' }}>
              {item.title}
            </h1>

            {/* Quick Metadata Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                padding: '1rem 0',
                borderTop: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location / City</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy-900)', marginTop: '2px' }}>
                  {item.location?.city}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {item.location?.specificLocation}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date of Occurrence</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy-900)', marginTop: '2px' }}>
                  {new Date(item.date).toLocaleDateString([], {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Primary Color</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy-900)', marginTop: '2px' }}>
                  {item.primaryColor}
                  {item.secondaryColor && ` / ${item.secondaryColor}`}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Views</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--navy-900)', marginTop: '2px' }}>
                  {item.views || 1} impressions
                </div>
              </div>
            </div>

            {/* Reporter Profile Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                backgroundColor: 'var(--border-light)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
              }}
            >
              {item.reportedBy?.avatar ? (
                <img
                  src={item.reportedBy.avatar}
                  alt={item.reportedBy.name}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--teal-600)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {item.reportedBy?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                  Reported by {item.reportedBy?.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  <span>Verified Member</span>
                  <span>&bull;</span>
                  <span style={{ color: 'var(--teal-700)', fontWeight: 600 }}>
                    {item.reportedBy?.reputationScore || 0} reputation
                  </span>
                </div>
              </div>
            </div>

            {/* Claim Action Box */}
            <div>
              {item.status === 'reunited' ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '1rem',
                    backgroundColor: '#ecfdf5',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle size={20} style={{ margin: '0 auto 0.25rem', display: 'block' }} />
                  This item has been successfully claimed and returned to its owner!
                </div>
              ) : isOwner ? (
                <div style={{ textAlign: 'center', padding: '0.85rem', backgroundColor: '#f0f9ff', borderRadius: 'var(--radius-md)', border: '1px solid #bae6fd', color: '#0369a1', fontSize: '0.875rem' }}>
                  You reported this item. Check below for any claims or matches filed by community members.
                </div>
              ) : userClaim ? (
                <div
                  style={{
                    backgroundColor: userClaim.status === 'approved' ? '#ecfdf5' : '#fffbeb',
                    border: `1px solid ${userClaim.status === 'approved' ? '#a7f3d0' : '#fef3c7'}`,
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.25rem' }}>
                    Your Claim Status: <span style={{ textTransform: 'uppercase' }}>{userClaim.status}</span>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    Submitted on {new Date(userClaim.createdAt).toLocaleDateString()}. The reporter is reviewing your proof details.
                  </p>
                </div>
              ) : isAuthenticated ? (
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  onClick={() => setClaimModalOpen(true)}
                >
                  <ShieldCheck size={20} /> Submit Ownership Claim
                </button>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                    Log in to Submit Claim
                  </Link>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                    Free registration required to verify ownership claims.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Owner / Admin Management for Claims filed on this item */}
          {(isOwner || isAdmin) && itemClaims.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--navy-900)' }}>
                Ownership Claims Received ({itemClaims.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {itemClaims.map((claim) => (
                  <div
                    key={claim._id}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      backgroundColor: 'var(--border-light)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {claim.claimant?.name}
                      </div>
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
                      >
                        {claim.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      <strong>Proof Description:</strong> {claim.proofDescription}
                    </div>

                    {claim.contactPhone && (
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        Contact: {claim.contactPhone} &bull; {claim.contactEmail}
                      </div>
                    )}

                    {/* Review Actions */}
                    {claim.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => handleReviewClaim(claim._id, 'approved')}
                        >
                          Approve Claim
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleReviewClaim(claim._id, 'rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {claim.status === 'approved' && item.status !== 'reunited' && (
                      <div style={{ marginTop: '0.85rem' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-navy"
                          style={{ width: '100%', backgroundColor: '#059669' }}
                          onClick={() => handleReunite(claim._id)}
                        >
                          <CheckCircle size={15} /> Finalize Reunion & Award Reputation
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Smart Matches Section */}
      <section style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
          <Sparkles size={24} style={{ color: 'var(--teal-600)' }} />
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>
              Smart Matching Recommendations
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Opposite reports algorithmically paired based on category, color, location, brand, and date proximity.
            </p>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
            No opposite items match this report with sufficient similarity score yet.
          </div>
        ) : (
          <div className="grid-2">
            {matches.map((m) => (
              <MatchCard
                key={m.item._id}
                match={m}
                sourceItem={item}
                onClaimClick={() => setClaimModalOpen(true)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Claim Submission Modal */}
      <ClaimModal
        item={item}
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onSuccess={(newClaim) => {
          setUserClaim(newClaim);
          setActionSuccessMsg('Ownership claim successfully submitted!');
        }}
      />
    </div>
  );
};

export default ItemDetailsPage;
