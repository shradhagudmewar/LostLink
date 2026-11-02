import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PlusCircle,
  Upload,
  X,
  AlertCircle,
  HelpCircle,
  Sparkles,
  MapPin,
  Calendar,
  Tag,
  Shield,
} from 'lucide-react';
import { itemAPI } from '../services/api';

const CATEGORIES = [
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

const COLORS = [
  'Black',
  'White',
  'Silver / Gray',
  'Blue',
  'Navy',
  'Red',
  'Brown / Tan',
  'Gold / Yellow',
  'Green',
  'Pink / Purple',
  'Multi-color',
  'Other',
];

const ReportItemPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [type, setType] = useState(searchParams.get('type') || 'lost');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [brand, setBrand] = useState('');
  const [primaryColor, setPrimaryColor] = useState('Black');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [city, setCity] = useState('');
  const [specificLocation, setSpecificLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [securityQuestions, setSecurityQuestions] = useState(['']);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArray]);

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addSecurityQuestion = () => {
    setSecurityQuestions((prev) => [...prev, '']);
  };

  const updateSecurityQuestion = (index, value) => {
    const updated = [...securityQuestions];
    updated[index] = value;
    setSecurityQuestions(updated);
  };

  const removeSecurityQuestion = (index) => {
    setSecurityQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !city.trim() || !specificLocation.trim() || !description.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('brand', brand);
      formData.append('primaryColor', primaryColor);
      formData.append('secondaryColor', secondaryColor);
      formData.append('city', city);
      formData.append('specificLocation', specificLocation);
      formData.append('date', date);
      formData.append('description', description);

      // Filter empty security questions
      const validQuestions = securityQuestions.filter((q) => q.trim().length > 0);
      formData.append('securityQuestions', JSON.stringify(validQuestions));

      images.forEach((img) => {
        formData.append('images', img);
      });

      const res = await itemAPI.createItem(formData);
      const createdItem = res.data.item;

      navigate(`/items/${createdItem._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '820px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
          Report a Lost or Found Item
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Provide clear details so our Smart Match engine can automatically search for potential matches.
        </p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.85rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              color: '#b91c1c',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Type Selection */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
              What are you reporting? <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setType('lost')}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: type === 'lost' ? '2px solid #ef4444' : '1px solid var(--border-color)',
                  backgroundColor: type === 'lost' ? '#fef2f2' : '#ffffff',
                  color: type === 'lost' ? '#991b1b' : 'var(--navy-800)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                  Lost Item
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  I misplaced or lost my valuable and am looking for it.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('found')}
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: type === 'found' ? '2px solid var(--teal-600)' : '1px solid var(--border-color)',
                  backgroundColor: type === 'found' ? 'var(--teal-50)' : '#ffffff',
                  color: type === 'found' ? 'var(--teal-900)' : 'var(--navy-800)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                  Found Item
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  I discovered an item and want to safely return it to its true owner.
                </div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              Descriptive Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Midnight Blue iPhone 15 Pro, Black Fossil Leather Wallet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category & Brand */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                Category <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Brand / Manufacturer</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Apple, Sony, Dell, Nike, Honda"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
          </div>

          {/* Colors */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                Primary Color <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="form-select"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                required
              >
                {COLORS.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Secondary / Accent Color</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Silver trim, red stripe"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
              />
            </div>
          </div>

          {/* Location & Date */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                City / Region <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. New York, Seattle, Austin"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Date of Occurrence <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Specific Location */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">
                Campus Location / Landmark Details <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to autofill hotspot:</span>
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Central Library 2nd Floor, Main Canteen, CS Lab 3, Auditorium"
              value={specificLocation}
              onChange={(e) => setSpecificLocation(e.target.value)}
              required
            />
            {/* Quick College Hotspots */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
              {[
                'Central Library',
                'Main Canteen',
                'CS Dept Lab',
                'Seminar Hall / Auditorium',
                'Sports Ground',
                'Hostel Block',
                'College Gate 1 Security',
              ].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setSpecificLocation(loc)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.55rem',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: specificLocation === loc ? 'var(--teal-50)' : '#ffffff',
                    color: specificLocation === loc ? 'var(--teal-800)' : 'var(--navy-700)',
                    cursor: 'pointer',
                  }}
                >
                  📍 {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Description */}
          <div className="form-group">
            <label className="form-label">
              Full Description & Distinguishing Features <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="Provide key details, engravings, unique scratches, contents, model numbers, or where the item was left. The more details you provide, the better the smart matching!"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Finder Verification Questions (for Found items) */}
          {type === 'found' && (
            <div
              style={{
                backgroundColor: 'var(--teal-50)',
                border: '1px solid var(--teal-100)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <Shield size={18} style={{ color: 'var(--teal-700)' }} />
                <h4 style={{ fontSize: '0.95rem', color: 'var(--teal-900)' }}>
                  Anti-Fraud Security Challenge Questions (Recommended)
                </h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--teal-800)', marginBottom: '1rem' }}>
                Create secret questions only the genuine owner can answer (e.g. "What lockscreen photo is on the phone?", "What keychain was attached?").
              </p>

              {securityQuestions.map((q, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Question ${idx + 1}`}
                    value={q}
                    onChange={(e) => updateSecurityQuestion(idx, e.target.value)}
                  />
                  {securityQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSecurityQuestion(idx)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={addSecurityQuestion}
                style={{ marginTop: '0.5rem' }}
              >
                + Add Another Question
              </button>
            </div>
          )}

          {/* Image Upload Area */}
          <div className="form-group">
            <label className="form-label">Photographs (Up to 5 images)</label>
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                id="itemPhotos"
                style={{ display: 'none' }}
              />
              <label htmlFor="itemPhotos" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={32} style={{ color: 'var(--teal-600)' }} />
                <div style={{ fontWeight: 600, color: 'var(--navy-800)' }}>
                  Drag & Drop or Click to Upload Photos
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  PNG, JPG, WEBP formats up to 5MB each
                </div>
              </label>
            </div>

            {/* Thumbnail previews */}
            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img
                      src={src}
                      alt={`preview-${i}`}
                      style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Publishing Report & Searching Matches...' : 'Publish Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportItemPage;
