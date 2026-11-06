import React, { useState, useEffect } from 'react';
import { api, setStoredUser } from '../../services/api';
import { User, Mail, Phone, Shield, CheckCircle, AlertTriangle, Save, RefreshCw } from 'lucide-react';

export default function StudentProfile({ currentUser, onProfileUpdated }) {
  const [profile, setProfile] = useState(currentUser);
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentProfile();
      setProfile(data);
      setFullName(data.fullName || '');
      setPhoneNumber(data.phoneNumber || '');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('Full name is required');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const updated = await api.updateStudentProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
      });

      setProfile(updated);
      setStoredUser(updated);
      setSuccessMessage('Profile information updated successfully!');

      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section-container" style={{ maxWidth: '800px' }}>
      <div className="section-header">
        <div>
          <h2>My Profile</h2>
          <p className="section-subtitle">Manage your personal information and contact details</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={fetchProfile}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {successMessage && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <AlertTriangle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit}>
          {/* Read-Only Account Details */}
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
              Account Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Email Address (Login Username)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155', fontSize: '0.9rem' }}>
                  <Mail size={16} color="#94a3b8" />
                  <span>{profile?.email}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Cannot be modified</span>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Role & Account Status
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                  <Shield size={16} color="#94a3b8" />
                  <span className="badge badge-primary">{profile?.role || 'STUDENT'}</span>
                  <span className={`badge ${profile?.active ? 'badge-success' : 'badge-danger'}`}>
                    {profile?.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Managed by library administration</span>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
              Personal Details
            </h3>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#334155' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                <input
                  type="text"
                  required
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#334155' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Phone size={18} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                <input
                  type="tel"
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +1 555-0199"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: '160px', justifyContent: 'center' }}
              >
                <Save size={16} />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
