import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import CopyIsbnButton from '../CopyIsbnButton';
import { Clock, RefreshCw, CheckCircle, AlertTriangle, XCircle, BookOpen } from 'lucide-react';

export default function StudentReservations({ onActionCompleted }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentReservations();
      setReservations(data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (reservation) => {
    if (!window.confirm(`Are you sure you want to cancel your reservation for "${reservation.bookTitle}"?`)) {
      return;
    }

    try {
      setCancellingId(reservation.id);
      setErrorMessage('');
      setSuccessMessage('');

      await api.cancelReservation(reservation.id);
      setSuccessMessage(`Reservation for "${reservation.bookTitle}" was cancelled.`);
      fetchReservations();
      if (onActionCompleted) {
        onActionCompleted();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <div>
          <h2>My Reservations</h2>
          <p className="section-subtitle">Track and manage your requested titles currently out-of-stock in the library</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={fetchReservations}
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

      <div className="card table-container">
        {loading && reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem auto' }} />
            <p>Loading your reservations...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <Clock size={44} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No reservations on record</p>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              When a book is completely out of stock, you can reserve it from the Browse Books catalog.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Reserved Book</th>
                <th>ISBN</th>
                <th>Reservation Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => {
                const isPending = res.status === 'PENDING';
                return (
                  <tr key={res.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{res.bookTitle}</div>
                      <div style={{ fontSize: '0.825rem', color: '#64748b' }}>by {res.bookAuthor}</div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '2px 5px', borderRadius: '3px' }}>
                        {res.bookIsbn}
                      </code>
                      <CopyIsbnButton isbn={res.bookIsbn} />
                    </td>
                    <td>
                      <span style={{ fontSize: '0.875rem', color: '#334155' }}>{res.reservationDate}</span>
                    </td>
                    <td>
                      {isPending ? (
                        <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          Active (Pending)
                        </span>
                      ) : res.status === 'CANCELLED' ? (
                        <span className="badge badge-secondary">Cancelled</span>
                      ) : (
                        <span className="badge badge-success">Fulfilled</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isPending ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ 
                            fontSize: '0.8rem', 
                            padding: '4px 10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#dc2626'
                          }}
                          disabled={cancellingId === res.id}
                          onClick={() => handleCancel(res)}
                        >
                          <XCircle size={14} />
                          {cancellingId === res.id ? 'Cancelling...' : 'Cancel Reservation'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No actions</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
