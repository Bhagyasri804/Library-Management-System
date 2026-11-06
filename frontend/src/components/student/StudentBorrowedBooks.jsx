import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import CopyIsbnButton from '../CopyIsbnButton';
import { BookMarked, RefreshCw, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

export default function StudentBorrowedBooks() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'ISSUED', 'RETURNED'
  const [errorMessage, setErrorMessage] = useState('');

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentBorrowedBooks();
      setBorrowedBooks(data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load borrowed books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const filteredBooks = borrowedBooks.filter((item) => {
    if (filter === 'ISSUED') return item.status === 'ISSUED';
    if (filter === 'RETURNED') return item.status === 'RETURNED';
    return true;
  });

  return (
    <div className="section-container">
      <div className="section-header">
        <div>
          <h2>My Borrowed Books</h2>
          <p className="section-subtitle">View your active book loans, due dates, overdue status, and borrowing history</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={fetchBorrowedBooks}
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

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          { key: 'ALL', label: `All Books (${borrowedBooks.length})` },
          { key: 'ISSUED', label: `Currently Borrowed (${borrowedBooks.filter(b => b.status === 'ISSUED').length})` },
          { key: 'RETURNED', label: `Returned History (${borrowedBooks.filter(b => b.status === 'RETURNED').length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`btn ${filter === t.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Books Table */}
      <div className="card table-container">
        {loading && borrowedBooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem auto' }} />
            <p>Loading your borrowing records...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <BookMarked size={44} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No borrowed books found</p>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              {filter !== 'ALL' ? 'No records match this filter.' : 'You have not borrowed any books from the library yet.'}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Book Title & Details</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Loan Status</th>
                <th>Overdue / Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((record) => {
                const isOverdue = record.overdue;
                return (
                  <tr key={record.id} style={{ backgroundColor: isOverdue ? '#fff5f5' : 'transparent' }}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{record.bookTitle}</div>
                      <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                        by {record.bookAuthor} • <code style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 4px', borderRadius: '3px' }}>ISBN: {record.bookIsbn}</code>
                        <CopyIsbnButton isbn={record.bookIsbn} />
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.875rem', color: '#334155' }}>{record.issueDate}</span>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: isOverdue ? 700 : 500,
                        color: isOverdue ? '#dc2626' : '#334155'
                      }}>
                        {record.dueDate}
                      </span>
                    </td>
                    <td>
                      {record.status === 'ISSUED' ? (
                        <span className="badge badge-primary">
                          Borrowed (Active)
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span className="badge badge-success">Returned</span>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Returned on: {record.returnDate || 'Completed'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      {record.status === 'ISSUED' && isOverdue ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            Overdue ({record.overdueDays}d)
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600 }}>
                            Late Fine: ${record.fineAmount.toFixed(2)}
                          </span>
                        </div>
                      ) : record.status === 'ISSUED' ? (
                        <span style={{ fontSize: '0.825rem', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} />
                          On Schedule
                        </span>
                      ) : record.fineAmount > 0 ? (
                        <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 500 }}>
                          Late return fine: ${record.fineAmount.toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          Returned on time
                        </span>
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
