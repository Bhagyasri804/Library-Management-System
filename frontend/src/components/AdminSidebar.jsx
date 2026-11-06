import React from 'react';
import { LayoutDashboard, BookText, Tags, Users } from 'lucide-react';

export default function AdminSidebar({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'books', label: 'Book Management', icon: BookText },
    { id: 'categories', label: 'Category Management', icon: Tags },
    { id: 'users', label: 'User Management', icon: Users },
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
