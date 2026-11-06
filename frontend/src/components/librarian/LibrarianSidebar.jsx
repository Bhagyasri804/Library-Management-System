import React from 'react';
import { LayoutDashboard, Users, BookOpen, BookUp, BookDown } from 'lucide-react';

export default function LibrarianSidebar({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'books', label: 'Books Catalog', icon: BookOpen },
    { id: 'issue', label: 'Issue Books', icon: BookUp },
    { id: 'returns', label: 'Return Books', icon: BookDown },
  ];

  return (
    <aside className="sidebar">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`nav-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.id)}
          >
            <Icon size={19} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
