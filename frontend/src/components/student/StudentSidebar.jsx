import React from 'react';
import { LayoutDashboard, BookOpen, BookMarked, Clock, DollarSign, User } from 'lucide-react';

export default function StudentSidebar({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'browse', label: 'Browse Books', icon: BookOpen },
    { id: 'borrowed', label: 'My Borrowed Books', icon: BookMarked },
    { id: 'reservations', label: 'My Reservations', icon: Clock },
    { id: 'fines', label: 'My Fines', icon: DollarSign },
    { id: 'profile', label: 'My Profile', icon: User },
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
