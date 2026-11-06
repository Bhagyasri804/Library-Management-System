import React from 'react';
import { BookText, CheckCircle2, Bookmark, GraduationCap, ArrowRight, BookUp, BookDown } from 'lucide-react';
import CurrentDate from '../CurrentDate';

export default function LibrarianOverview({ stats, loading, onNavigate }) {
  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading librarian metrics...</div>;
  }

  const statCards = [
    {
      title: 'Total Books',
      value: stats?.totalBooks ?? 0,
      icon: BookText,
      color: 'var(--primary)',
      bg: 'var(--primary-light)',
      target: 'books',
    },
    {
      title: 'Available Books',
      value: stats?.availableBooks ?? 0,
      icon: CheckCircle2,
      color: '#10b981',
      bg: '#ecfdf5',
      target: 'books',
    },
    {
      title: 'Currently Issued Books',
      value: stats?.issuedBooks ?? 0,
      icon: Bookmark,
      color: '#f59e0b',
      bg: '#fffbeb',
      target: 'returns',
    },
    {
      title: 'Registered Students',
      value: stats?.registeredStudents ?? 0,
      icon: GraduationCap,
      color: 'var(--secondary)',
      bg: 'var(--secondary-light)',
      target: 'students',
    },
  ];

  return (
    <div>
      <div className="dashboard-heading">
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Librarian Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px' }}>
            Issue and return books, inspect catalog availability, and manage student borrowers.
          </p>
        </div>
        <CurrentDate />
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="table-container" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ background: 'var(--primary-light)', padding: '10px', borderRadius: '10px', color: 'var(--primary)' }}>
              <BookUp size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Issue a Book</h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            Check out available books to enrolled students with automatic return due dates.
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('issue')}>
            <span>Open Book Issue Portal</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="table-container" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ background: '#fffbeb', padding: '10px', borderRadius: '10px', color: '#f59e0b' }}>
              <BookDown size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Process Book Return</h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            Process book check-ins, recalculate available copies, and review overdue penalties.
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('returns')}>
            <span>View Issued Books & Returns</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
