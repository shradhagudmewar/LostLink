import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Tag,
  Eye,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const ItemCard = ({ item, matchScore, matchReasons }) => {
  const isLost = item.type === 'lost';
  const hasImages = item.images && item.images.length > 0;
  const primaryImg = hasImages ? item.images[0].url : null;

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Top Banner / Match Badge */}
      {matchScore !== undefined && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10,
          }}
        >
          <span className="badge badge-match">
            <Sparkles size={12} /> {matchScore}% Match
          </span>
        </div>
      )}

      {/* Image Thumbnail */}
      <Link
        to={`/items/${item._id}`}
        style={{
          position: 'relative',
          height: '210px',
          backgroundColor: '#0f172a',
          overflow: 'hidden',
          display: 'block',
        }}
      >
        {primaryImg ? (
          <img
            src={primaryImg}
            alt={item.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        <div
          style={{
            display: primaryImg ? 'none' : 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#64748b',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <Tag size={36} />
          <span style={{ fontSize: '0.85rem' }}>{item.category}</span>
        </div>

        {/* Type Overlay Badge */}
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          <span className={`badge ${isLost ? 'badge-lost' : 'badge-found'}`}>
            {item.type}
          </span>
        </div>

        {/* Status Pill if not active */}
        {item.status !== 'active' && (
          <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
            <span
              className={`badge ${
                item.status === 'reunited'
                  ? 'badge-reunited'
                  : 'badge-claimed'
              }`}
            >
              {item.status}
            </span>
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--teal-700)',
              backgroundColor: 'var(--teal-50)',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {item.category}
          </span>
          {item.brand && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--navy-600)' }}>
              &bull; {item.brand}
            </span>
          )}
        </div>

        <Link to={`/items/${item._id}`}>
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--navy-900)',
              marginBottom: '0.5rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.5rem',
            }}
          >
            {item.title}
          </h3>
        </Link>

        {/* Details snippet */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} style={{ color: 'var(--teal-600)', flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.location?.city} &ndash; {item.location?.specificLocation}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} style={{ color: 'var(--teal-600)', flexShrink: 0 }} />
            <span>
              {new Date(item.date).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span style={{ margin: '0 0.25rem' }}>&bull;</span>
            <span style={{ color: 'var(--navy-700)' }}>
              Color: <strong>{item.primaryColor}</strong>
            </span>
          </div>
        </div>

        {/* Footer info: views, reporter */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {item.reportedBy?.avatar ? (
              <img
                src={item.reportedBy.avatar}
                alt={item.reportedBy.name}
                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--teal-100)',
                  color: 'var(--teal-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {item.reportedBy?.name ? item.reportedBy.name.charAt(0) : 'U'}
              </div>
            )}
            <span style={{ fontSize: '0.775rem', color: 'var(--navy-700)', fontWeight: 500 }}>
              {item.reportedBy?.name || 'Anonymous'}
            </span>
          </div>

          <Link to={`/items/${item._id}`} className="btn btn-outline btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
