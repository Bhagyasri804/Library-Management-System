import React from 'react';
import { BookText, GraduationCap, UserCheck, CheckCircle2, Bookmark, Tags, ArrowRight } from 'lucide-react';

export default function DashboardOverview({ stats, loading, onNavigate }) {
  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading dashboard metrics...</div>;
  }

  const statCards = [
    {
      title: 'Total Books',
      value: stats?.totalBooks ?? 0,
      icon: BookText,
      color: '#2563eb',
      bg: '#eff6ff',
      target: 'books'
    },
    {
      title: 'Available Books',
      value: stats?.availableBooks ?? 0,
      icon: CheckCircle2,
      color: '#10b981',
      bg: '#ecfdf5',
      target: 'books'
    },
    {
      title: 'Issued Books',
      value: stats?.issuedBooks ?? 0,
      icon: Bookmark,
      color: '#f59e0b',
      bg: '#fffbeb',
      target: 'books'
    },
    {
      title: 'Total Students',
      value: stats?.totalStudents ?? 0,
      icon: GraduationCap,
      color: '#6366f1',
      bg: '#eef2ff',
      target: 'users'
    },
    {
      title: 'Total Librarians',
      value: stats?.totalLibrarians ?? 0,
      icon: UserCheck,
      color: '#0d9488',
      bg: '#f0fdfa',
      target: 'users'
    },
    {
      title: 'Total Categories',
      value: stats?.totalCategories ?? 0,
      icon: Tags,
      color: '#8b5cf6',
      bg: '#f5f3ff',
      target: 'categories'
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Admin Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
          Real-time library metrics, inventory counts, and user management.
        </p>
      </div>

      <div className="stats-grid">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="stat-card" onClick={() => onNavigate(c.target)} style={{ cursor: 'pointer' }}>
              <div className="stat-icon" style={{ backgroundColor: c.bg, color: c.color }}>
                <Icon size={26} />
              </div>
              <div>
                <div className="stat-value">{c.value}</div>
                <div className="stat-title">{c.title}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="table-container" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Catalog Management</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            Maintain books, track ISBNs, authors, and allocate inventory stock.
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('books')}>
            <span>Go to Books</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="table-container" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>User & Staff Accounts</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            Register new librarians, inspect enrolled students, and activate/deactivate accounts.
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('users')}>
            <span>Go to Users</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
