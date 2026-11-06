import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { RefreshCw, CheckCircle, AlertTriangle, Clock, DollarSign, BookDown } from 'lucide-react';
import ClearableSearchInput from '../ClearableSearchInput';

export default function ReturnBook({ onReturnSuccess }) {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [submittingId, setSubmittingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchIssuedBooks = async () => {
    try {
      setLoading(true);
      const data = await api.getIssuedBooks(search);
      setIssuedBooks(data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load issued books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchIssuedBooks();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleReturn = async (record) => {
    const confirmMessage = record.isOverdue
      ? `This book is overdue by ${record.overdueDays} day(s). Late fine of $${record.fineAmount.toFixed(2)} will be applied.\n\nConfirm return for "${record.bookTitle}"?`
      : `Confirm return for "${record.bookTitle}" borrowed by ${record.studentName}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setSubmittingId(record.id);
      setErrorMessage('');
      setSuccessMessage('');
      
      const result = await api.returnBook(record.id);
      
      let msg = `"${record.bookTitle}" has been successfully returned! Available copies restored.`;
      if (result.fineAmount > 0) {
        msg += ` Late fine recorded: $${result.fineAmount.toFixed(2)}.`;
      }
      setSuccessMessage(msg);
      
      fetchIssuedBooks();
      if (onReturnSuccess) {
        onReturnSuccess();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to record return');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <div>
          <h2>Return Books</h2>
          <p className="section-subtitle">Process returned books, restore inventory copies, and calculate overdue fines</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={fetchIssuedBooks} 
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

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <ClearableSearchInput
          placeholder="Search issued books by title, student name, email, or ISBN..."
          ariaLabel="Search issued books by title, student name, email, or ISBN"
          value={search}
          onChange={setSearch}
          inputClassName="input-field"
          inputStyle={{ paddingLeft: '38px' }}
          wrapperStyle={{ width: '100%', minWidth: 0 }}
        />
      </div>

      {/* Issued Books Table */}
      <div className="card table-container">
        {loading && issuedBooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem auto' }} />
            <p>Loading currently issued books...</p>
          </div>
        ) : issuedBooks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <BookDown size={44} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No currently issued books found</p>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              {search ? 'Try clearing your search query.' : 'All borrowed books have been returned.'}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Book Details</th>
                <th>Student Info</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status & Fine</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {issuedBooks.map((record) => {
                return (
                  <tr key={record.id} style={{ backgroundColor: record.isOverdue ? '#fff5f5' : 'transparent' }}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{record.bookTitle}</div>
                      <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                        by {record.bookAuthor} • <code style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 4px', borderRadius: '3px' }}>ISBN: {record.bookIsbn}</code>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#1e293b' }}>{record.studentName}</div>
                      <div style={{ fontSize: '0.825rem', color: '#64748b' }}>{record.studentEmail}</div>
                      {record.studentPhone && (
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{record.studentPhone}</div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.875rem', color: '#475569' }}>
                        {record.issueDate}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: record.isOverdue ? 700 : 500,
                        color: record.isOverdue ? '#dc2626' : '#475569'
                      }}>
                        {record.dueDate}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        {record.isOverdue ? (
                          <>
                            <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} />
                              Overdue ({record.overdueDays}d)
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                              <DollarSign size={13} style={{ marginRight: '-2px' }} />
                              Fine: ${record.fineAmount.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="badge badge-success">
                            On Time
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-primary"
                        style={{ 
                          padding: '0.45rem 0.9rem', 
                          fontSize: '0.85rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          backgroundColor: record.isOverdue ? '#dc2626' : 'var(--primary)'
                        }}
                        disabled={submittingId === record.id}
                        onClick={() => handleReturn(record)}
                      >
                        <BookDown size={15} />
                        {submittingId === record.id ? 'Returning...' : 'Return Book'}
                      </button>
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
