import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, CheckCircle, ShieldCheck, HelpCircle } from 'lucide-react';
import { matchAPI, itemAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MatchCard from '../components/MatchCard';

const SmartMatchesPage = () => {
  const { isAuthenticated } = useAuth();
  const [myMatches, setMyMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comparison Tool State
  const [allItems, setAllItems] = useState([]);
  const [selectedA, setSelectedA] = useState('');
  const [selectedB, setSelectedB] = useState('');
  const [compareResult, setCompareResult] = useState(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      try {
        if (isAuthenticated) {
          const res = await matchAPI.getMyMatches();
          setMyMatches(res.data.results || []);
        }
        // Load items for comparison demo
        const itemsRes = await itemAPI.getItems({ limit: 30 });
        setAllItems(itemsRes.data.items || []);
        if (itemsRes.data.items && itemsRes.data.items.length >= 2) {
          setSelectedA(itemsRes.data.items[0]._id);
          setSelectedB(itemsRes.data.items[1]._id);
        }
      } catch (err) {
        console.warn('Matches load error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [isAuthenticated]);

  const handleRunComparison = async () => {
    if (!selectedA || !selectedB) return;
    setComparing(true);
    try {
      const res = await matchAPI.compareItems({ itemIdA: selectedA, itemIdB: selectedB });
      setCompareResult(res.data);
    } catch (err) {
      alert(err.message);
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--teal-50)',
            color: 'var(--teal-700)',
            fontWeight: 700,
            fontSize: '0.85rem',
            marginBottom: '0.75rem',
          }}
        >
          <Sparkles size={16} /> Automated Algorithmic Matchmaking
        </div>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
          Smart Match Engine
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          LostLink automatically inspects report attributes—category, brand, primary/secondary colors, city, landmark keywords, date delta, and description text—to calculate match likelihoods.
        </p>
      </div>

      {/* User's Personalized Matches (if authenticated) */}
      {isAuthenticated && (
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--navy-900)' }}>
            Your Active Automated Matches
          </h2>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Analyzing your reports against database...
            </div>
          ) : myMatches.length === 0 ? (
            <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <Sparkles size={36} style={{ color: 'var(--teal-600)', opacity: 0.4, margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>No Active Matches Found</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                None of your current reports meet the 40%+ correlation threshold yet. We'll alert you as soon as a matching report is posted.
              </p>
            </div>
          ) : (
            myMatches.map((group) => (
              <div key={group.myItem._id} style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                  <span className={`badge ${group.myItem.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                    {group.myItem.type}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--navy-900)' }}>
                    {group.myItem.title} ({group.matchCount} Matches Found)
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

      {/* Interactive Match Comparison Sandbox */}
      <div className="card" style={{ padding: '2.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sparkles size={20} style={{ color: 'var(--teal-600)' }} />
          <h2 style={{ fontSize: '1.4rem', color: 'var(--navy-900)' }}>
            Interactive Item Match Simulator
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
          Select any two reports from our database to run the live Smart Match algorithm and view the exact weighted scoring breakdown.
        </p>

        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">First Report (Item A)</label>
            <select
              className="form-select"
              value={selectedA}
              onChange={(e) => setSelectedA(e.target.value)}
            >
              {allItems.map((item) => (
                <option key={item._id} value={item._id}>
                  [{item.type.toUpperCase()}] {item.title} ({item.location?.city})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Second Report (Item B)</label>
            <select
              className="form-select"
              value={selectedB}
              onChange={(e) => setSelectedB(e.target.value)}
            >
              {allItems.map((item) => (
                <option key={item._id} value={item._id}>
                  [{item.type.toUpperCase()}] {item.title} ({item.location?.city})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={handleRunComparison}
          disabled={comparing}
        >
          {comparing ? 'Calculating Scores...' : 'Run Smart Match Analysis'}
        </button>

        {/* Live Simulator Results */}
        {compareResult && (
          <div
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: 'var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Comparison Match Result</span>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  {compareResult.score}% Overall Match
                </h3>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {compareResult.reasons?.map((r, i) => (
                  <span key={i} className="badge badge-match">
                    <CheckCircle size={12} /> {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Scorecard Parameters */}
            <div className="grid-3" style={{ gap: '1rem' }}>
              <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category (25 pts max)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--teal-700)' }}>
                  {compareResult.breakdown?.categoryScore || 0} / 25
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location (20 pts max)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--teal-700)' }}>
                  {compareResult.breakdown?.locationScore || 0} / 20
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Brand (15 pts max)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--teal-700)' }}>
                  {compareResult.breakdown?.brandScore || 0} / 15
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Color (15 pts max)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--teal-700)' }}>
                  {compareResult.breakdown?.colorScore || 0} / 15
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date Proximity (10 pts max)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--teal-700)' }}>
                  {compareResult.breakdown?.dateScore || 0} / 10
                </div>
              </div>

              <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Keyword Overlap (15 pts max)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--teal-700)' }}>
                  {compareResult.breakdown?.descriptionScore || 0} / 15
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartMatchesPage;
