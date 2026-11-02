import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  PlusCircle,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import { itemAPI, statsAPI } from '../services/api';
import ItemCard from '../components/ItemCard';
import StatCard from '../components/StatCard';
import SearchBar from '../components/SearchBar';

const HomePage = () => {
  const [stats, setStats] = useState({
    totalReports: 12,
    totalLost: 6,
    totalFound: 6,
    totalReunited: 4,
    activeCases: 8,
    recoveryRate: 92,
  });
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [statsRes, itemsRes] = await Promise.all([
          statsAPI.getPublicStats(),
          itemAPI.getItems({ limit: 6, sort: '-createdAt' }),
        ]);
        if (statsRes.data?.stats) {
          setStats(statsRes.data.stats);
        }
        if (itemsRes.data?.items) {
          setRecentItems(itemsRes.data.items);
        }
      } catch (err) {
        console.warn('Failed to load home data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleHeroSearch = ({ search, type, category }) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    if (category && category !== 'All') params.append('category', category);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #042f2e 100%)',
          color: '#ffffff',
          padding: '4.5rem 0 5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13,148,136,0.18) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(20, 184, 166, 0.15)',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                color: 'var(--teal-400)',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1.5rem',
              }}
            >
              🎓 Campus Smart Lost & Found Portal &bull; For Students, Staff & Faculty
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: '1.25rem',
                letterSpacing: '-0.02em',
              }}
            >
              Lost something on campus? <span style={{ color: 'var(--teal-400)' }}>We'll help you find it.</span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                color: '#94a3b8',
                lineHeight: 1.6,
                marginBottom: '2.5rem',
              }}
            >
              The official college lost & found hub. Report misplaced ID cards, laptops, keys, or books across classrooms, library, canteen, and hostels with automated smart matching.
            </p>

            {/* Quick CTAs */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginBottom: '2.5rem',
                flexWrap: 'wrap',
              }}
            >
              <Link to="/report?type=lost" className="btn btn-lg" style={{ backgroundColor: '#ef4444', color: '#fff' }}>
                <PlusCircle size={20} /> I Lost Something
              </Link>
              <Link to="/report?type=found" className="btn btn-lg btn-primary">
                <ShieldCheck size={20} /> I Found Something
              </Link>
              <Link to="/register" className="btn btn-lg btn-outline" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
                Student Sign Up
              </Link>
            </div>

            {/* Integrated Search Bar in Hero */}
            <SearchBar onSearch={handleHeroSearch} />
          </div>
        </div>
      </section>

      {/* Live Statistics Counters */}
      <section style={{ marginTop: '-2rem', position: 'relative', zIndex: 20 }}>
        <div className="container">
          <div className="grid-4">
            <StatCard
              title="Platform Reports"
              value={stats.totalReports}
              icon={Layers}
              changeText="Lost & Found total submissions"
              color="#0d9488"
            />
            <StatCard
              title="Active Investigations"
              value={stats.activeCases}
              icon={Clock}
              changeText="Currently searching for match"
              color="#0284c7"
            />
            <StatCard
              title="Successfully Reunited"
              value={stats.totalReunited}
              icon={HeartHandshake}
              changeText="Items returned safely to owners"
              color="#10b981"
            />
            <StatCard
              title="Recovery Success Rate"
              value={`${stats.recoveryRate}%`}
              icon={TrendingUp}
              changeText="Based on verified claims"
              color="#8b5cf6"
            />
          </div>
        </div>
      </section>

      {/* Recent Lost & Found Showcase */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--teal-600)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Latest Activity
              </span>
              <h2 style={{ fontSize: '1.85rem', marginTop: '0.25rem' }}>
                Recently Reported Items
              </h2>
            </div>
            <Link to="/browse" className="btn btn-outline">
              View All Directory <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Loading recently reported items...
            </div>
          ) : recentItems.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No items reported yet. Be the first to report!</p>
            </div>
          ) : (
            <div className="grid-3">
              {recentItems.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How Smart Matching Works Section */}
      <section
        style={{
          backgroundColor: '#ffffff',
          padding: '5rem 0',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <span style={{ color: 'var(--teal-600)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Intelligent Technology
            </span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.25rem', marginBottom: '0.75rem' }}>
              How LostLink Smart Matching Works
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Unlike static bulletin boards, LostLink runs an automatic multi-parameter evaluation engine behind every report.
            </p>
          </div>

          <div className="grid-4">
            <div className="card" style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--teal-50)',
                  color: 'var(--teal-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  border: '1px solid var(--teal-100)',
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Report Details</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Submit item attributes: category, brand, primary & secondary colors, city, exact location, and photos.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#f0f9ff',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  border: '1px solid #bae6fd',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Smart Scoring</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Engine evaluates weighted similarity across 6 parameters, computing a match percentage (0% to 100%).
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  border: '1px solid #fde68a',
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Secure Claims</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Claimants provide confidential answers to finder security questions, purchase receipts, or unique identifiers.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  border: '1px solid #a7f3d0',
                }}
              >
                4
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Safe Reunion</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Finder verifies proof, approves claim, and marks item reunited, awarding both parties reputation score points!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, var(--navy-900) 0%, #0f2744 100%)',
              borderRadius: 'var(--radius-xl)',
              padding: '3.5rem 2rem',
              textAlign: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <h2 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '1rem' }}>
              Have you lost or found an item today?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              Join thousands of community members and discover instant matches with our automated scoring engine.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/report" className="btn btn-primary btn-lg">
                Report Item Now <ArrowRight size={18} />
              </Link>
              <Link to="/browse" className="btn btn-outline btn-lg" style={{ color: '#fff', borderColor: '#334155', backgroundColor: '#1e293b' }}>
                Search Directory
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
