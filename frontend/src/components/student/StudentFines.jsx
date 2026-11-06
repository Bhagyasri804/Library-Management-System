import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DollarSign, RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function StudentFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchFines = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentFines();
      setFines(data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const totalOutstanding = fines
    .filter((f) => f.status === 'UNPAID')
    .reduce((sum, f) => sum + (f.fineAmount || 0), 0);

  return (
    <div className="section-container">
      <div className="section-header">
        <div>
          <h2>My Fines & Dues</h2>
          <p className="section-subtitle">Review late return penalty calculations and outstanding library dues</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={fetchFines}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {errorMessage && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <AlertTriangle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Summary Card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#fafafa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Outstanding Balance
            </span>
            <h2 style={{ fontSize: '2rem', margin: '4px 0', color: totalOutstanding > 0 ? '#b91c1c' : '#059669' }}>
              ${totalOutstanding.toFixed(2)}
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
              {totalOutstanding > 0
                ? 'Standard late penalty rate: $2.00 per day overdue.'
                : 'Great job! You have no outstanding fines with the library.'}
            </p>
          </div>

          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--secondary-light)',
              border: '1px solid var(--secondary-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              maxWidth: '340px',
            }}
          >
            <Info size={18} color="var(--secondary)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-strong)' }}>
              Fines must be settled in person at the circulation desk during library working hours.
            </span>
          </div>
        </div>
      </div>

      {/* Fines Table */}
      <div className="card table-container">
        {loading && fines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem auto' }} />
            <p>Loading fine records...</p>
          </div>
        ) : fines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <CheckCircle size={44} style={{ color: '#10b981', marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600, fontSize: '1.1rem', color: '#0f172a' }}>No fines on record</p>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              All your borrowed books have been returned on time.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Due Date</th>
                <th>Overdue Days</th>
                <th>Reason</th>
                <th>Fine Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fines.map((item, idx) => (
                <tr key={item.borrowRecordId || idx}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.bookTitle}</div>
                    <div style={{ fontSize: '0.825rem', color: '#64748b' }}>by {item.bookAuthor}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.875rem', color: '#334155' }}>{item.dueDate}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#dc2626' }}>
                      {item.overdueDays} day(s)
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>{item.reason}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#b91c1c' }}>
                      ${item.fineAmount.toFixed(2)}
                    </span>
                  </td>
                  <td>
                    {item.status === 'UNPAID' ? (
                      <span className="badge badge-danger">Unpaid</span>
                    ) : (
                      <span className="badge badge-success">Settled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
