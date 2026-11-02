import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  List,
  MapPin,
  Calendar,
  Tag,
  ArrowUpDown,
  RefreshCw,
  X,
} from 'lucide-react';
import { itemAPI } from '../services/api';
import ItemCard from '../components/ItemCard';

const CATEGORIES = [
  'All',
  'Electronics',
  'Documents & IDs',
  'Wallets & Purses',
  'Jewelry & Watches',
  'Keys',
  'Bags & Luggage',
  'Clothing & Accessories',
  'Pets',
  'Other',
];

const BrowseItemsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filters from query params
  const search = searchParams.get('search') || '';
  const type = searchParams.get('type') || '';
  const category = searchParams.get('category') || 'All';
  const city = searchParams.get('city') || '';
  const brand = searchParams.get('brand') || '';
  const color = searchParams.get('color') || '';
  const status = searchParams.get('status') || 'active';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort,
      };
      if (search) params.search = search;
      if (type) params.type = type;
      if (category && category !== 'All') params.category = category;
      if (city) params.city = city;
      if (brand) params.brand = brand;
      if (color) params.color = color;
      if (status && status !== 'All') params.status = status;

      const res = await itemAPI.getItems(params);
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching items:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchParams]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
          Browse Lost & Found Directory
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Explore reports, apply precise multi-parameter filters, or search for matching valuables.
        </p>
      </div>

      {/* Main Grid: Sidebar Filters + Items Listing */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Filters Sidebar */}
        <aside
          className="card"
          style={{
            position: 'sticky',
            top: '90px',
            padding: '1.25rem',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              <Filter size={18} style={{ color: 'var(--teal-600)' }} />
              <span>Filters</span>
            </div>
            {(search || type || (category && category !== 'All') || city || brand || color || status !== 'active') && (
              <button
                type="button"
                onClick={clearAllFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset All
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="form-group">
            <label className="form-label">Report Type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${type === '' ? 'btn-navy' : 'btn-outline'}`}
                style={{ justifyContent: 'flex-start' }}
                onClick={() => updateParam('type', '')}
              >
                All Reports
              </button>
              <button
                type="button"
                className={`btn btn-sm ${type === 'lost' ? 'btn-danger' : 'btn-outline'}`}
                style={{ justifyContent: 'flex-start' }}
                onClick={() => updateParam('type', 'lost')}
              >
                Lost Items Only
              </button>
              <button
                type="button"
                className={`btn btn-sm ${type === 'found' ? 'btn-primary' : 'btn-outline'}`}
                style={{ justifyContent: 'flex-start' }}
                onClick={() => updateParam('type', 'found')}
              >
                Found Items Only
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* City / Location Filter */}
          <div className="form-group">
            <label className="form-label">City / Region</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. New York, Seattle"
                value={city}
                onChange={(e) => updateParam('city', e.target.value)}
              />
              <MapPin size={15} style={{ position: 'absolute', right: '10px', top: '12px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Brand Filter */}
          <div className="form-group">
            <label className="form-label">Brand</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Apple, Fossil, Sony"
              value={brand}
              onChange={(e) => updateParam('brand', e.target.value)}
            />
          </div>

          {/* Color Filter */}
          <div className="form-group">
            <label className="form-label">Color</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Black, Blue, Silver"
              value={color}
              onChange={(e) => updateParam('color', e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => updateParam('status', e.target.value)}
            >
              <option value="active">Active Cases</option>
              <option value="claimed">Claimed</option>
              <option value="reunited">Successfully Reunited</option>
              <option value="All">All Statuses</option>
            </select>
          </div>
        </aside>

        {/* Items Content Area */}
        <div>
          {/* Controls Bar: Search Input, Sorting, View Toggle */}
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              marginBottom: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
              <Search size={18} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search titles, descriptions, keywords..."
                value={search}
                onChange={(e) => updateParam('search', e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.925rem',
                  color: 'var(--navy-900)',
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => updateParam('search', '')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort & View Modes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ArrowUpDown size={15} style={{ color: 'var(--text-muted)' }} />
                <select
                  className="form-select"
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  style={{ padding: '0.4rem 0.65rem', fontSize: '0.825rem' }}
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="createdAt">Oldest First</option>
                  <option value="-date">Date Lost/Found (Recent)</option>
                  <option value="-views">Most Viewed</option>
                </select>
              </div>

              <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '0.4rem 0.55rem',
                    background: viewMode === 'grid' ? 'var(--teal-50)' : '#ffffff',
                    color: viewMode === 'grid' ? 'var(--teal-700)' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title="Grid View"
                >
                  <Grid size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '0.4rem 0.55rem',
                    background: viewMode === 'list' ? 'var(--teal-50)' : '#ffffff',
                    color: viewMode === 'list' ? 'var(--teal-700)' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Total Results Count */}
          <div style={{ marginBottom: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{items.length}</strong> of <strong>{total}</strong> reports
          </div>

          {/* Loading or Results */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={28} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--teal-600)' }} />
              <p>Searching LostLink reports...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
              <Tag size={40} style={{ opacity: 0.3, margin: '0 auto 1rem', color: 'var(--teal-600)' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Reports Match Your Criteria</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                Try adjusting your search terms, clearing category filters, or selecting "All Reports".
              </p>
              <button type="button" className="btn btn-outline" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid-3">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={page <= 1}
                onClick={() => updateParam('page', page - 1)}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => updateParam('page', p)}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={page >= totalPages}
                onClick={() => updateParam('page', page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseItemsPage;
