import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, AlertCircle, ArrowRight, UserPlus, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology & AI',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration / MBA',
  'Commerce & Finance',
  'Sciences / Applied Sciences',
  'Arts & Humanities',
  'Medical & Pharmacy',
  'Staff / Faculty / Administration',
  'Other',
];

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [college, setCollege] = useState('Campus University / College');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        studentId: studentId.trim(),
        department,
        college: college.trim(),
      });
      // Redirect to user dashboard where their name is immediately displayed!
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.25rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <div className="brand-icon">
              <GraduationCap size={22} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--navy-900)' }}>
              Campus <span style={{ color: 'var(--teal-600)' }}>LostLink</span>
            </span>
          </Link>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--navy-900)', marginBottom: '0.35rem' }}>
            Student & Campus Sign Up
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Create your college account to report lost belongings, claim discovered items, and get campus match alerts.
          </p>
        </div>

        <div className="card" style={{ padding: '2.25rem' }}>
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
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">
                Full Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rahul Sharma, Priya Patel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* College Email */}
            <div className="form-group">
              <label className="form-label">
                College / Student Email <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="student@college.edu or name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Student ID & Department */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Roll No. / Student ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 2024CS104"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone / WhatsApp</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Department */}
            <div className="form-group">
              <label className="form-label">Department / Branch</label>
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* College Name */}
            <div className="form-group">
              <label className="form-label">College / Institute Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. National Institute of Technology, Delhi"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
            </div>

            {/* Password & Confirm */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">
                  Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min. 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.75rem', fontWeight: 700 }}
              disabled={loading}
            >
              {loading ? 'Creating Your Account...' : 'Complete Sign Up'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--teal-600)', fontWeight: 700 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
