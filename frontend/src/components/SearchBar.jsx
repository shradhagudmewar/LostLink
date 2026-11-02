import React, { useState } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';

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

const SearchBar = ({ onSearch, initialQuery = '', initialType = '', initialCategory = 'All' }) => {
  const [search, setSearch] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [category, setCategory] = useState(initialCategory);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search, type, category });
  };

  const handleTypeToggle = (selectedType) => {
    const newType = type === selectedType ? '' : selectedType;
    setType(newType);
    onSearch({ search, type: newType, category });
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCategory(newCat);
    onSearch({ search, type, category: newCat });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: '#ffffff',
        padding: '0.85rem',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.75rem',
      }}
    >
      {/* Type Toggle Pills */}
      <div style={{ display: 'flex', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.2rem' }}>
        <button
          type="button"
          onClick={() => handleTypeToggle('')}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: '0.825rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: type === '' ? '#ffffff' : 'transparent',
            color: type === '' ? 'var(--navy-900)' : 'var(--text-muted)',
            boxShadow: type === '' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          All Items
        </button>
        <button
          type="button"
          onClick={() => handleTypeToggle('lost')}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: '0.825rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: type === 'lost' ? '#ef4444' : 'transparent',
            color: type === 'lost' ? '#ffffff' : 'var(--text-muted)',
            boxShadow: type === 'lost' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          Lost Only
        </button>
        <button
          type="button"
          onClick={() => handleTypeToggle('found')}
          style={{
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontSize: '0.825rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: type === 'found' ? 'var(--teal-600)' : 'transparent',
            color: type === 'found' ? '#ffffff' : 'var(--text-muted)',
            boxShadow: type === 'found' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          Found Only
        </button>
      </div>

      {/* Search Input */}
      <div style={{ flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--border-light)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search by keywords, iPhone, wallet, keys, city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            width: '100%',
            fontSize: '0.9rem',
            color: 'var(--navy-900)',
          }}
        />
      </div>

      {/* Category Select */}
      <div style={{ minWidth: '150px' }}>
        <select
          className="form-select"
          value={category}
          onChange={handleCategoryChange}
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'All' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Submit Search Button */}
      <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.15rem' }}>
        <Search size={16} /> Search
      </button>
    </form>
  );
};

export default SearchBar;
