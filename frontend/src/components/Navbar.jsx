import React from 'react';
import { BookOpen, LogOut, User, ArrowLeftRight, GraduationCap } from 'lucide-react';

export default function Navbar({ currentUser, onLogout, portalMode, onTogglePortalMode }) {
  const isStudent = currentUser?.role === 'STUDENT';
  const isLibrarian = currentUser?.role === 'LIBRARIAN' || portalMode === 'LIBRARIAN';

  let portalTitle = 'Admin Control Panel';
  if (isStudent) {
    portalTitle = 'Student Library Portal';
  } else if (isLibrarian) {
    portalTitle = 'Librarian Desk';
  }

  return (
    <header className="navbar">
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="brand-icon" style={{ backgroundColor: isStudent ? '#0284c7' : '#2563eb' }}>
            {isStudent ? <GraduationCap size={22} /> : <BookOpen size={22} />}
          </div>
          <span style={{ fontWeight: 600 }}>
            {portalTitle}
          </span>
        </div>

        {/* If Admin, allow switching between Admin and Librarian desk */}
        {currentUser?.role === 'ADMIN' && onTogglePortalMode && (
          <button
            onClick={onTogglePortalMode}
            className="btn btn-secondary btn-sm"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '0.8rem',
              padding: '4px 10px',
              backgroundColor: '#f1f5f9'
            }}
            title="Switch between Admin Console and Librarian Desk"
          >
            <ArrowLeftRight size={14} />
            <span>Switch to {portalMode === 'ADMIN' ? 'Librarian Desk' : 'Admin Console'}</span>
          </button>
        )}
      </div>

      <div className="user-profile">
        {currentUser && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="#64748b" />
              <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{currentUser.fullName}</span>
              <span className={`user-badge ${currentUser.role === 'LIBRARIAN' ? 'badge-primary' : currentUser.role === 'STUDENT' ? 'badge-info' : ''}`}>
                {currentUser.role}
              </span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={onLogout} title="Sign Out">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
