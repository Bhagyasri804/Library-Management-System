import React, { useState, useEffect } from 'react';
import { UserPlus, ToggleLeft, ToggleRight, X, Shield, GraduationCap, UserCheck, Search } from 'lucide-react';
import { api } from '../services/api';

export default function UserManagement({ onActionCompleted }) {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Librarian Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers(roleFilter);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleCreateLibrarian = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createLibrarian(formData);
      setSuccess(`Librarian account for "${formData.fullName}" created successfully.`);
      setIsModalOpen(false);
      fetchUsers();
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = !user.active;
    const action = newStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} user "${user.fullName}"?`)) return;

    try {
      await api.updateUserStatus(user.id, newStatus);
      setSuccess(`User "${user.fullName}" has been ${newStatus ? 'activated' : 'deactivated'}.`);
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phoneNumber && u.phoneNumber.includes(term))
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>User Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Inspect student and librarian accounts, add new librarians, and manage access.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <UserPlus size={18} />
          <span>Add New Librarian</span>
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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-input-wrapper">
              <Search size={18} />
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className={`btn btn-sm ${roleFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setRoleFilter('')}
              >
                All Roles
              </button>
              <button
                className={`btn btn-sm ${roleFilter === 'STUDENT' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setRoleFilter('STUDENT')}
              >
                Students Only
              </button>
              <button
                className={`btn btn-sm ${roleFilter === 'LIBRARIAN' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setRoleFilter('LIBRARIAN')}
              >
                Librarians Only
              </button>
            </div>
          </div>

          <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 500 }}>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User Profile</th>
                <th>Role</th>
                <th>Phone</th>
                <th style={{ textAlign: 'center' }}>Account Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No users found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isStudent = u.role === 'STUDENT';
                  const isLibrarian = u.role === 'LIBRARIAN';
                  const isAdmin = u.role === 'ADMIN';

                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{u.fullName}</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{u.email}</div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            isAdmin ? 'badge-danger' : isLibrarian ? 'badge-primary' : 'badge-warning'
                          }`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          {isAdmin ? <Shield size={12} /> : isLibrarian ? <UserCheck size={12} /> : <GraduationCap size={12} />}
                          {u.role}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        {u.phoneNumber || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>None</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${u.active ? 'badge-success' : 'badge-danger'}`}>
                          {u.active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {!isAdmin && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleToggleStatus(u)}
                            title={u.active ? 'Deactivate User' : 'Activate User'}
                            style={{
                              color: u.active ? '#ef4444' : '#10b981',
                              borderColor: u.active ? '#fca5a5' : '#86efac',
                            }}
                          >
                            {u.active ? (
                              <>
                                <ToggleRight size={18} />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft size={18} />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Librarian Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Register New Librarian</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateLibrarian}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Eleanor Vance"
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
                    placeholder="e.g. librarian@library.com"
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
                    placeholder="Secure password"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="e.g. +1 555-0192"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Librarian Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
