import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { api } from '../../services/api';
import ClearableSearchInput from '../ClearableSearchInput';
import CopyIsbnButton from '../CopyIsbnButton';

export default function LibrarianBooks() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBooks();
  }, [search]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await api.getLibrarianBooks(search);
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Library Books Catalog</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Inspect book inventory, check available copy status, and locate titles by ISBN.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
        </div>
      )}

      <div className="table-container">
        <div className="table-header-bar">
          <ClearableSearchInput
            placeholder="Search by title, author, or ISBN..."
            ariaLabel="Search books by title, author, or ISBN"
            value={search}
            onChange={setSearch}
          />
          <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 500 }}>
            {books.length} book title{books.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title & Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th style={{ textAlign: 'center' }}>Total Copies</th>
                <th style={{ textAlign: 'center' }}>Available</th>
                <th style={{ textAlign: 'center' }}>Issued</th>
                <th style={{ textAlign: 'right' }}>Availability</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    Loading catalog...
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No books found matching the search query.
                  </td>
                </tr>
              ) : (
                books.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{b.title}</div>
                      <div style={{ fontSize: '0.82rem', color: '#64748b' }}>by {b.author}</div>
                    </td>
                    <td>
                      <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.82rem' }}>
                        {b.isbn}
                      </code>
                      <CopyIsbnButton isbn={b.isbn} />
                    </td>
                    <td>
                      <span className="badge badge-primary">{b.categoryName || 'Unassigned'}</span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{b.totalCopies}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${b.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {b.availableCopies}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', color: '#64748b' }}>{b.issuedCopies}</td>
                    <td style={{ textAlign: 'right' }}>
                      {b.availableCopies > 0 ? (
                        <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>In Stock</span>
                      ) : (
                        <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>Out of Stock</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
