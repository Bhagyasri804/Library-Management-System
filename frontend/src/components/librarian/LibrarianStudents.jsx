import React, { useState, useEffect } from 'react';
import { UserPlus, Search, X, GraduationCap } from 'lucide-react';
import { api } from '../../services/api';

export default function LibrarianStudents({ onActionCompleted }) {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Register Student Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
  });

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await api.getLibrarianStudents(search);
      setStudents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.registerStudentByLibrarian(formData);
      setSuccess(`Student "${formData.fullName}" registered successfully.`);
      setIsModalOpen(false);
      setFormData({ fullName: '', email: '', password: '', phoneNumber: '' });
      fetchStudents();
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Student Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Register new student patrons and inspect student borrowing profiles.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setError(''); setIsModalOpen(true); }}>
          <UserPlus size={18} />
          <span>Register Student</span>
        </button>
      </div>

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}><X size={16} /></button>
        </div>
      )}
      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={16} /></button>
        </div>
      )}

      <div className="table-container">
        <div className="table-header-bar">
          <div className="search-input-wrapper">
            <Search size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search students by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 500 }}>
            {students.length} student{students.length !== 1 ? 's' : ''} registered
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th style={{ textAlign: 'center' }}>Account Status</th>
                <th style={{ textAlign: 'right' }}>Registered On</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    Loading students...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No students found. Click "Register Student" to enroll one.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'var(--secondary-light)', padding: '8px', borderRadius: '8px', color: 'var(--secondary)' }}>
                          <GraduationCap size={18} />
                        </div>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{s.fullName}</span>
                      </div>
                    </td>
                    <td style={{ color: '#475569' }}>{s.email}</td>
                    <td style={{ color: '#64748b' }}>{s.phoneNumber || 'N/A'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${s.active ? 'badge-success' : 'badge-danger'}`}>
                        {s.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', color: '#64748b', fontSize: '0.85rem' }}>
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Student Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Register New Student</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRegister}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Maya Lin"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. maya@student.com"
                  />
                </div>

                <div className="form-group">
                  <label>Initial Password * (minimum 6 characters)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="form-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Password for student login"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
