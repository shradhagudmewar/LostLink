import React, { useState } from 'react';
import { X, ShieldCheck, Upload, AlertCircle } from 'lucide-react';
import { claimAPI } from '../services/api';

const ClaimModal = ({ item, isOpen, onClose, onSuccess }) => {
  const [proofDescription, setProofDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [answers, setAnswers] = useState(
    item.securityQuestions?.map((q) => ({ question: q, answer: '' })) || []
  );
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const handleAnswerChange = (index, value) => {
    const updated = [...answers];
    updated[index].answer = value;
    setAnswers(updated);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proofDescription.trim()) {
      setError('Please provide detailed proof of ownership.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('itemId', item._id);
      formData.append('proofDescription', proofDescription);
      formData.append('contactPhone', contactPhone);
      formData.append('contactEmail', contactEmail);
      formData.append('securityAnswers', JSON.stringify(answers));

      files.forEach((file) => {
        formData.append('proofImages', file);
      });

      const res = await claimAPI.submitClaim(formData);
      if (onSuccess) {
        onSuccess(res.data.claim);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={20} style={{ color: 'var(--teal-600)' }} />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)' }}>
              Submit Ownership Claim
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--navy-600)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-md)',
                  color: '#b91c1c',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ backgroundColor: 'var(--border-light)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Claiming item:</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-900)' }}>{item.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {item.location?.city} &bull; {item.category}
              </div>
            </div>

            {/* Proof description */}
            <div className="form-group">
              <label className="form-label">
                Detailed Proof of Ownership <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="Describe unique identifiers, serial numbers, purchase details, scratches, contents, or passwords that only the rightful owner would know."
                rows={4}
                value={proofDescription}
                onChange={(e) => setProofDescription(e.target.value)}
                required
              />
            </div>

            {/* Security Questions from finder */}
            {item.securityQuestions && item.securityQuestions.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
                  Finder Security Verification Questions:
                </label>
                {item.securityQuestions.map((q, idx) => (
                  <div key={idx} style={{ marginBottom: '0.75rem', backgroundColor: '#f0fdfa', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--teal-100)' }}>
                    <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--teal-900)', marginBottom: '0.35rem' }}>
                      Q{idx + 1}: {q}
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Your confidential answer"
                      value={answers[idx]?.answer || ''}
                      onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Upload proof image */}
            <div className="form-group">
              <label className="form-label">Proof Documents / Photos (Receipts, Box, Old Photos)</label>
              <div
                style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  textAlign: 'center',
                  backgroundColor: '#ffffff',
                }}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  id="claimFiles"
                  style={{ display: 'none' }}
                />
                <label htmlFor="claimFiles" style={{ cursor: 'pointer', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                  <Upload size={24} style={{ color: 'var(--teal-600)' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-800)' }}>
                    Click to select images
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {files.length > 0 ? `${files.length} file(s) selected` : 'PNG, JPG, WEBP up to 5MB'}
                  </span>
                </label>
              </div>
            </div>

            {/* Contact details */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting Claim...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimModal;
