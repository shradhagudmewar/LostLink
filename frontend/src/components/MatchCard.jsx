import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, Check, ChevronDown, ChevronUp, ArrowRight, ShieldCheck } from 'lucide-react';

const MatchCard = ({ match, sourceItem, onClaimClick }) => {
  const [expanded, setExpanded] = useState(false);
  const matchedItem = match.item;
  const score = match.score;
  const breakdown = match.breakdown || {};
  const reasons = match.reasons || [];

  const getScoreColor = (val) => {
    if (val >= 80) return '#0d9488'; // high teal
    if (val >= 60) return '#0284c7'; // blue
    return '#eab308'; // yellow/amber
  };

  return (
    <div
      className="card"
      style={{
        border: score >= 80 ? '2px solid var(--teal-500)' : '1px solid var(--border-color)',
        padding: '1.25rem',
        position: 'relative',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: getScoreColor(score),
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
            }}
          >
            {score}%
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-900)' }}>
              {score >= 80 ? 'High Confidence Match' : score >= 60 ? 'Moderate Match' : 'Potential Match'}
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              Multi-parameter algorithmic evaluation
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link to={`/items/${matchedItem._id}`} className="btn btn-outline btn-sm">
            View Report <ArrowRight size={14} />
          </Link>
          {onClaimClick && matchedItem.type === 'found' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => onClaimClick(matchedItem)}
            >
              <ShieldCheck size={14} /> Claim Item
            </button>
          )}
        </div>
      </div>

      {/* Item summary banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '70px 1fr',
          gap: '1rem',
          backgroundColor: 'var(--border-light)',
          padding: '0.85rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem',
        }}
      >
        <img
          src={
            matchedItem.images && matchedItem.images.length > 0
              ? matchedItem.images[0].url
              : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=200'
          }
          alt={matchedItem.title}
          style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
        />
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span className={`badge ${matchedItem.type === 'lost' ? 'badge-lost' : 'badge-found'}`} style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
              {matchedItem.type}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--teal-700)' }}>
              {matchedItem.category}
            </span>
            {matchedItem.brand && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                &bull; {matchedItem.brand}
              </span>
            )}
          </div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
            {matchedItem.title}
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <MapPin size={13} style={{ color: 'var(--teal-600)' }} /> {matchedItem.location?.city} ({matchedItem.location?.specificLocation})
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Calendar size={13} style={{ color: 'var(--teal-600)' }} /> {new Date(matchedItem.date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Match Reasons Pill Badges */}
      {reasons.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
          {reasons.map((r, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--teal-50)',
                color: 'var(--teal-800)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                border: '1px solid var(--teal-100)',
              }}
            >
              <Check size={12} style={{ color: 'var(--teal-600)' }} /> {r}
            </span>
          ))}
        </div>
      )}

      {/* Expandable Breakdown Details */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem',
          padding: '0.4rem',
          background: 'none',
          border: 'none',
          color: 'var(--navy-700)',
          fontSize: '0.8rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <span>{expanded ? 'Hide Match Parameters' : 'View Detailed Parameter Breakdown'}</span>
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {expanded && (
        <div
          style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.75rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
              <span>Category (25%)</span>
              <strong>{breakdown.categoryScore || 0}/25</strong>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((breakdown.categoryScore || 0) / 25) * 100}%`, backgroundColor: 'var(--teal-600)' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
              <span>Location (20%)</span>
              <strong>{breakdown.locationScore || 0}/20</strong>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((breakdown.locationScore || 0) / 20) * 100}%`, backgroundColor: 'var(--teal-600)' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
              <span>Brand (15%)</span>
              <strong>{breakdown.brandScore || 0}/15</strong>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((breakdown.brandScore || 0) / 15) * 100}%`, backgroundColor: 'var(--teal-600)' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
              <span>Color (15%)</span>
              <strong>{breakdown.colorScore || 0}/15</strong>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((breakdown.colorScore || 0) / 15) * 100}%`, backgroundColor: 'var(--teal-600)' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
              <span>Date (10%)</span>
              <strong>{breakdown.dateScore || 0}/10</strong>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((breakdown.dateScore || 0) / 10) * 100}%`, backgroundColor: 'var(--teal-600)' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
              <span>Keywords (15%)</span>
              <strong>{breakdown.descriptionScore || 0}/15</strong>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((breakdown.descriptionScore || 0) / 15) * 100}%`, backgroundColor: 'var(--teal-600)' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchCard;
