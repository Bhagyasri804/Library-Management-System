import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import ClearableSearchInput from './ClearableSearchInput';

export default function BookManagement({ onActionCompleted }) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    categoryId: '',
    totalCopies: 1,
    availableCopies: 1,
    description: '',
  });

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [search]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await api.getBooks(search);
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAdd = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      totalCopies: 1,
      availableCopies: 1,
      description: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      categoryId: book.categoryId || '',
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      description: book.description || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...formData,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        totalCopies: Number(formData.totalCopies),
        availableCopies: Number(formData.availableCopies),
      };

      if (editingBook) {
        await api.updateBook(editingBook.id, payload);
        setSuccess(`Book "${payload.title}" updated successfully.`);
      } else {
        await api.createBook(payload);
        setSuccess(`Book "${payload.title}" added to inventory.`);
      }

      setIsModalOpen(false);
      fetchBooks();
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Are you sure you want to delete "${book.title}"?`)) return;
    try {
      await api.deleteBook(book.id);
      setSuccess(`Book "${book.title}" deleted.`);
      fetchBooks();
      if (onActionCompleted) onActionCompleted();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Book Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Maintain book catalog, copies, and details.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Add New Book</span>
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
          <ClearableSearchInput
            placeholder="Search books by title, author, ISBN..."
            ariaLabel="Search books by title, author, or ISBN"
            value={search}
            onChange={setSearch}
          />
          <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 500 }}>
            {books.length} book{books.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title & Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th style={{ textAlign: 'center' }}>Total</th>
                <th style={{ textAlign: 'center' }}>Available</th>
                <th style={{ textAlign: 'center' }}>Issued</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    Loading books...
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No books found. Click "Add New Book" to create one.
                  </td>
                </tr>
              ) : (
                books.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{b.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>by {b.author}</div>
                    </td>
                    <td>
                      <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.82rem' }}>
                        {b.isbn}
                      </code>
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
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${b.issuedCopies > 0 ? 'badge-warning' : 'badge-secondary'}`}>
                        {b.issuedCopies}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button className="btn-icon" onClick={() => handleOpenEdit(b)} title="Edit Book">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(b)} title="Delete Book">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Book Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Clean Code"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Author *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="e.g. Robert C. Martin"
                    />
                  </div>
                  <div className="form-group">
                    <label>ISBN *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      placeholder="e.g. 978-0132350884"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-select"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Total Copies *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-input"
                      value={formData.totalCopies}
                      onChange={(e) => {
                        const total = parseInt(e.target.value) || 1;
                        setFormData({
                          ...formData,
                          totalCopies: total,
                          availableCopies: editingBook ? formData.availableCopies : total,
                        });
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Available Copies *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max={formData.totalCopies}
                      className="form-input"
                      value={formData.availableCopies}
                      onChange={(e) => setFormData({ ...formData, availableCopies: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea
                    rows="3"
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short summary or notes..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBook ? 'Save Changes' : 'Create Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
