import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AdminSidebar from './components/AdminSidebar';
import DashboardOverview from './components/DashboardOverview';
import BookManagement from './components/BookManagement';
import CategoryManagement from './components/CategoryManagement';
import UserManagement from './components/UserManagement';

import LibrarianSidebar from './components/librarian/LibrarianSidebar';
import LibrarianOverview from './components/librarian/LibrarianOverview';
import LibrarianStudents from './components/librarian/LibrarianStudents';
import LibrarianBooks from './components/librarian/LibrarianBooks';
import IssueBook from './components/librarian/IssueBook';
import ReturnBook from './components/librarian/ReturnBook';

import StudentSidebar from './components/student/StudentSidebar';
import StudentOverview from './components/student/StudentOverview';
import StudentBrowseBooks from './components/student/StudentBrowseBooks';
import StudentBorrowedBooks from './components/student/StudentBorrowedBooks';
import StudentReservations from './components/student/StudentReservations';
import StudentFines from './components/student/StudentFines';
import StudentProfile from './components/student/StudentProfile';

import LoginModal from './components/LoginModal';
import ScrollToTopButton from './components/ScrollToTopButton';
import { api, getAuthToken, getStoredUser, removeAuthToken, setStoredUser } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [portalMode, setPortalMode] = useState('ADMIN'); // 'ADMIN' or 'LIBRARIAN'
  
  // Tab states for each role
  const [adminTab, setAdminTab] = useState('overview');
  const [librarianTab, setLibrarianTab] = useState('overview');
  const [studentTab, setStudentTab] = useState('overview');

  // Stats states
  const [adminStats, setAdminStats] = useState(null);
  const [librarianStats, setLibrarianStats] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  const fetchAdminStats = async () => {
    try {
      setLoadingStats(true);
      const data = await api.getAdminStats();
      setAdminStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchLibrarianStats = async () => {
    try {
      setLoadingStats(true);
      const data = await api.getLibrarianStats();
      setLibrarianStats(data);
    } catch (err) {
      console.error('Failed to load librarian stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchStudentStats = async () => {
    try {
      setLoadingStats(true);
      const data = await api.getStudentDashboard();
      setStudentStats(data);
    } catch (err) {
      console.error('Failed to load student stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadRoleData = (user) => {
    if (user.role === 'ADMIN') {
      fetchAdminStats();
    } else if (user.role === 'LIBRARIAN') {
      fetchLibrarianStats();
    } else if (user.role === 'STUDENT') {
      fetchStudentStats();
    }
  };

  useEffect(() => {
    const verifySession = async () => {
      const token = getAuthToken();
      if (!token) {
        setAppLoading(false);
        return;
      }

      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
        const initialMode = user.role === 'LIBRARIAN' ? 'LIBRARIAN' : 'ADMIN';
        setPortalMode(initialMode);
        loadRoleData(user);
      } catch (err) {
        removeAuthToken();
        setCurrentUser(null);
      } finally {
        setAppLoading(false);
      }
    };

    verifySession();
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    } finally {
      removeAuthToken();
      setCurrentUser(null);
      setAdminTab('overview');
      setLibrarianTab('overview');
      setStudentTab('overview');
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    const mode = user.role === 'LIBRARIAN' ? 'LIBRARIAN' : 'ADMIN';
    setPortalMode(mode);
    loadRoleData(user);
  };

  const togglePortalMode = () => {
    const nextMode = portalMode === 'ADMIN' ? 'LIBRARIAN' : 'ADMIN';
    setPortalMode(nextMode);
    if (nextMode === 'ADMIN') {
      fetchAdminStats();
    } else {
      fetchLibrarianStats();
    }
  };

  const handleProfileUpdated = (updatedUser) => {
    setCurrentUser(updatedUser);
    setStoredUser(updatedUser);
    fetchStudentStats();
  };

  if (appLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#64748b' }}>
        Initializing Library Management System...
      </div>
    );
  }

  if (!currentUser) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  // 1. Student Portal View
  if (currentUser.role === 'STUDENT') {
    return (
      <div className="app-layout">
        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
          portalMode="STUDENT"
          onTogglePortalMode={null}
        />
        <div className="main-content">
          <StudentSidebar activeTab={studentTab} onSelectTab={setStudentTab} />
          <main className="content-area">
            {studentTab === 'overview' && (
              <StudentOverview
                stats={studentStats}
                loading={loadingStats}
                onNavigate={(tab) => {
                  setStudentTab(tab);
                  fetchStudentStats();
                }}
              />
            )}
            {studentTab === 'browse' && (
              <StudentBrowseBooks
                onActionCompleted={fetchStudentStats}
              />
            )}
            {studentTab === 'borrowed' && (
              <StudentBorrowedBooks />
            )}
            {studentTab === 'reservations' && (
              <StudentReservations
                onActionCompleted={fetchStudentStats}
              />
            )}
            {studentTab === 'fines' && (
              <StudentFines />
            )}
            {studentTab === 'profile' && (
              <StudentProfile
                currentUser={currentUser}
                onProfileUpdated={handleProfileUpdated}
              />
            )}
          </main>
        </div>
        <ScrollToTopButton />
      </div>
    );
  }

  // 2. Staff / Admin Views
  const isLibrarianView = portalMode === 'LIBRARIAN' || currentUser.role === 'LIBRARIAN';

  return (
    <div className="app-layout">
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        portalMode={portalMode}
        onTogglePortalMode={currentUser.role === 'ADMIN' ? togglePortalMode : null}
      />
      <div className="main-content">
        {isLibrarianView ? (
          <>
            <LibrarianSidebar activeTab={librarianTab} onSelectTab={setLibrarianTab} />
            <main className="content-area">
              {librarianTab === 'overview' && (
                <LibrarianOverview
                  stats={librarianStats}
                  loading={loadingStats}
                  onNavigate={(tab) => {
                    setLibrarianTab(tab);
                    fetchLibrarianStats();
                  }}
                />
              )}
              {librarianTab === 'students' && (
                <LibrarianStudents onActionCompleted={fetchLibrarianStats} />
              )}
              {librarianTab === 'books' && (
                <LibrarianBooks />
              )}
              {librarianTab === 'issue' && (
                <IssueBook
                  onIssueSuccess={() => {
                    fetchLibrarianStats();
                    setLibrarianTab('returns');
                  }}
                />
              )}
              {librarianTab === 'returns' && (
                <ReturnBook
                  onReturnSuccess={() => {
                    fetchLibrarianStats();
                  }}
                />
              )}
            </main>
          </>
        ) : (
          <>
            <AdminSidebar activeTab={adminTab} onSelectTab={setAdminTab} />
            <main className="content-area">
              {adminTab === 'overview' && (
                <DashboardOverview
                  stats={adminStats}
                  loading={loadingStats}
                  onNavigate={(tab) => {
                    setAdminTab(tab);
                    fetchAdminStats();
                  }}
                />
              )}
              {adminTab === 'books' && <BookManagement onActionCompleted={fetchAdminStats} />}
              {adminTab === 'categories' && <CategoryManagement onActionCompleted={fetchAdminStats} />}
              {adminTab === 'users' && <UserManagement onActionCompleted={fetchAdminStats} />}
            </main>
          </>
        )}
      </div>
      <ScrollToTopButton />
    </div>
  );
}
