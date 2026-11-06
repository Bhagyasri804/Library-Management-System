import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BookOpen, Clock, CheckCircle, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import ClearableSearchInput from '../ClearableSearchInput';

export default function StudentBrowseBooks({ onActionCompleted }) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [reservingId, setReservingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchBooksAndCategories = async () => {
    try {
      setLoading(true);
      const [booksData, categoriesData] = await Promise.all([
        api.getStudentBooks(search, selectedCategory),
        api.getCategories().catch(() => []),
      ]);
      setBooks(booksData);
      setCategories(categoriesData);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooksAndCategories();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const handleReserve = async (book) => {
    if (!window.confirm(`Would you like to reserve "${book.title}"?\nYou will be notified when a copy is returned.`)) {
      return;
    }

    try {
      setReservingId(book.id);
      setErrorMessage('');
      setSuccessMessage('');

      await api.reserveBook(book.id);
      setSuccessMessage(`Successfully reserved "${book.title}". You can track it under My Reservations.`);
      fetchBooksAndCategories();
      if (onActionCompleted) {
        onActionCompleted();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reserve book');
    } finally {
      setReservingId(null);
    }
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <div>
          <h2>Browse Books Catalog</h2>
          <p className="section-subtitle">Search our library collection, check live availability, and reserve out-of-stock titles</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={fetchBooksAndCategories}
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

      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <ClearableSearchInput
            placeholder="Search books by title, author, ISBN..."
            ariaLabel="Search books by title, author, or ISBN"
            value={search}
            onChange={setSearch}
            inputClassName="input-field"
            inputStyle={{ paddingLeft: '38px' }}
            wrapperStyle={{ flex: 1, minWidth: '260px' }}
          />

          <div style={{ width: '220px' }}>
            <select
              className="input-field"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Table / Cards */}
      <div className="card table-container">
        {loading && books.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem auto' }} />
            <p>Loading library catalog...</p>
          </div>
        ) : books.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
            <BookOpen size={44} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No books found</p>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              {search || selectedCategory ? 'Try adjusting your search filters.' : 'The library catalog is currently empty.'}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Book Title & Author</th>
                <th>Category</th>
                <th>ISBN</th>
                <th>Availability</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => {
                const isOutOfStock = book.availableCopies <= 0;
                return (
                  <tr key={book.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{book.title}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>by {book.author}</div>
                      {book.description && (
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '3px', maxWidth: '420px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {book.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-secondary">
                        {book.categoryName || 'Uncategorized'}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '2px 5px', borderRadius: '3px' }}>
                        {book.isbn}
                      </code>
                    </td>
                    <td>
                      {isOutOfStock ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span className="badge badge-danger">Out of Stock</span>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>0 of {book.totalCopies} copies</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span className="badge badge-success">Available</span>
                          <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 500 }}>
                            {book.availableCopies} copy left
                          </span>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isOutOfStock ? (
                        <button
                          className="btn btn-secondary"
                          style={{ 
                            fontSize: '0.825rem', 
                            padding: '0.45rem 0.85rem', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '5px',
                            backgroundColor: 'var(--secondary-light)',
                            color: 'var(--secondary-strong)',
                            border: '1px solid var(--secondary-border)'
                          }}
                          disabled={reservingId === book.id}
                          onClick={() => handleReserve(book)}
                          title="Reserve this book to be notified when available"
                        >
                          <Clock size={14} />
                          {reservingId === book.id ? 'Reserving...' : 'Reserve Book'}
                        </button>
                      ) : (
                        <span 
                          style={{ 
                            fontSize: '0.82rem', 
                            color: '#16a34a', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            fontWeight: 500
                          }}
                        >
                          <CheckCircle size={14} />
                          Visit desk to borrow
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
