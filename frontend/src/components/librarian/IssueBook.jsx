import React, { useState, useEffect } from 'react';
import { BookUp, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { api } from '../../services/api';

export default function IssueBook({ onIssueSuccess }) {
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [borrowDays, setBorrowDays] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, booksData] = await Promise.all([
        api.getLibrarianStudents(),
        api.getLibrarianBooks(),
      ]);
      setStudents(studentsData.filter((s) => s.active));
      setBooks(booksData);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedStudentId || !selectedBookId) {
      setError('Please select both a student and a book.');
      return;
    }

    const selectedBook = books.find((b) => b.id === Number(selectedBookId));
    if (selectedBook && selectedBook.availableCopies <= 0) {
      setError(`Cannot issue "${selectedBook.title}" because there are 0 available copies.`);
      return;
    }

    setLoading(true);
    try {
      const res = await api.issueBook({
        bookId: Number(selectedBookId),
        studentId: Number(selectedStudentId),
        borrowDays: Number(borrowDays),
      });

      setSuccess(
        `Successfully issued "${res.bookTitle}" to ${res.studentName}! Due date: ${res.dueDate}.`
      );
      setSelectedBookId('');
      setSelectedStudentId('');
      loadData();
      if (onIssueSuccess) onIssueSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedBook = books.find((b) => b.id === Number(selectedBookId));

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Issue a Book</h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Assign an available library book to an active enrolled student with a return deadline.
        </p>
      </div>

      {success && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 600px) 1fr', gap: '24px' }}>
        <div className="table-container" style={{ padding: '28px' }}>
          <form onSubmit={handleIssue}>
            <div className="form-group">
              <label>1. Select Student Patron *</label>
              <select
                className="form-select"
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">-- Choose Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>2. Select Book to Checkout *</label>
              <select
                className="form-select"
                required
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
              >
                <option value="">-- Choose Book --</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                    {b.title} — {b.availableCopies > 0 ? `${b.availableCopies} available` : 'OUT OF STOCK'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>3. Loan Period (Days) *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="number"
                  min="1"
                  max="90"
                  required
                  className="form-input"
                  style={{ width: '120px' }}
                  value={borrowDays}
                  onChange={(e) => setBorrowDays(e.target.value)}
                />
                <span style={{ color: '#64748b', fontSize: '0.88rem' }}>
                  Due in {borrowDays} days ({new Date(Date.now() + borrowDays * 86400000).toLocaleDateString()})
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || (selectedBook && selectedBook.availableCopies <= 0)}
              style={{ width: '100%', marginTop: '16px', padding: '12px' }}
            >
              <BookUp size={18} />
              <span>{loading ? 'Processing Checkout...' : 'Confirm & Issue Book'}</span>
            </button>
          </form>
        </div>

        {/* Selected Book Quick Summary */}
        <div>
          {selectedBook ? (
            <div className="table-container" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Selected Book Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                <div><strong>Title:</strong> {selectedBook.title}</div>
                <div><strong>Author:</strong> {selectedBook.author}</div>
                <div><strong>ISBN:</strong> {selectedBook.isbn}</div>
                <div><strong>Category:</strong> {selectedBook.categoryName || 'General'}</div>
                <div>
                  <strong>Stock:</strong>{' '}
                  <span className={`badge ${selectedBook.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                    {selectedBook.availableCopies} of {selectedBook.totalCopies} Copies Available
                  </span>
                </div>
                {selectedBook.description && (
                  <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '6px' }}>
                    {selectedBook.description}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="table-container" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
              <p>Select a book from the form to view real-time inventory and availability details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
