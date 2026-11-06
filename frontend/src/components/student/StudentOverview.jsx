import React from 'react';
import { BookMarked, BookOpen, AlertTriangle, DollarSign, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import CurrentDate from '../CurrentDate';

export default function StudentOverview({ stats, loading, onNavigate }) {
  if (loading) {
    return (
      <div className="section-container">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          Loading your student dashboard...
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Currently Borrowed',
      value: stats?.currentlyBorrowedCount ?? 0,
      icon: BookMarked,
      color: 'var(--primary)',
      bg: 'var(--primary-light)',
      targetTab: 'borrowed',
      hint: 'Books currently with you',
    },
    {
      title: 'Available in Library',
      value: stats?.availableBooksCount ?? 0,
      icon: BookOpen,
      color: '#10b981',
      bg: '#ecfdf5',
      targetTab: 'browse',
      hint: 'Copies ready to borrow',
    },
    {
      title: 'Overdue Books',
      value: stats?.overdueBooksCount ?? 0,
      icon: AlertTriangle,
      color: stats?.overdueBooksCount > 0 ? '#dc2626' : '#64748b',
      bg: stats?.overdueBooksCount > 0 ? '#fef2f2' : '#f8fafc',
      targetTab: 'borrowed',
      hint: stats?.overdueBooksCount > 0 ? 'Requires immediate return' : 'All loans on schedule',
    },
    {
      title: 'Outstanding Fines',
      value: `$${(stats?.outstandingFines ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: stats?.outstandingFines > 0 ? '#b91c1c' : '#059669',
      bg: stats?.outstandingFines > 0 ? '#fff1f2' : '#f0fdf4',
      targetTab: 'fines',
      hint: stats?.outstandingFines > 0 ? 'Payable at library helpdesk' : 'No pending dues',
    },
    {
      title: 'Active Reservations',
      value: stats?.activeReservationsCount ?? 0,
      icon: Clock,
      color: 'var(--secondary)',
      bg: 'var(--secondary-light)',
      targetTab: 'reservations',
      hint: 'Reserved unavailable books',
    },
  ];

  return (
    <div className="section-container">
      {/* Welcome Banner */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, var(--primary-hover) 0%, var(--secondary-strong) 100%)',
          borderRadius: '14px', 
          padding: '2rem', 
          color: 'white',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>
              Student Portal
            </span>
            <CurrentDate className="current-date-light" />
            <h1 style={{ margin: '0.4rem 0', fontSize: '1.8rem', fontWeight: 700 }}>
              Welcome back, {stats?.studentName || 'Student'}! 👋
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
              Explore the library catalog, track your borrowed books, manage reservations, and check fines.
            </p>
          </div>
          <button
            className="btn"
            style={{ 
              backgroundColor: 'white', 
              color: 'var(--primary-hover)',
              fontWeight: 600, 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '8px'
            }}
            onClick={() => onNavigate('browse')}
          >
            <BookOpen size={17} />
            <span>Browse Library Catalog</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="stat-card"
              onClick={() => onNavigate(card.targetTab)}
              style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p className="stat-label">{card.title}</p>
                  <h3 className="stat-value" style={{ color: card.color }}>{card.value}</h3>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>{card.hint}</p>
                </div>
                <div
                  className="stat-icon"
                  style={{ backgroundColor: card.bg, color: card.color }}
                >
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#0f172a' }}>
          Quick Services
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div
            onClick={() => onNavigate('browse')}
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fafafa',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                <BookOpen size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Search Catalog</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Find books & reserve</div>
              </div>
            </div>
            <ArrowRight size={16} color="#94a3b8" />
          </div>

          <div
            onClick={() => onNavigate('borrowed')}
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fafafa',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#ecfdf5', color: '#10b981' }}>
                <BookMarked size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>My Borrowed Books</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Track due dates & returns</div>
              </div>
            </div>
            <ArrowRight size={16} color="#94a3b8" />
          </div>

          <div
            onClick={() => onNavigate('reservations')}
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fafafa',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}>
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>My Reservations</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Check reserved titles</div>
              </div>
            </div>
            <ArrowRight size={16} color="#94a3b8" />
          </div>

          <div
            onClick={() => onNavigate('fines')}
            style={{
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fafafa',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: '#fef2f2', color: '#dc2626' }}>
                <DollarSign size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Fines & Dues</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>View late fee details</div>
              </div>
            </div>
            <ArrowRight size={16} color="#94a3b8" />
          </div>
        </div>
      </div>
    </div>
  );
}
