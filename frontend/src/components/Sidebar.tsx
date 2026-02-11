import React from 'react';
// @ts-nocheck
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { path: '/', icon: '👥', label: 'Personnes' },
  { path: '/tree', icon: '🌳', label: 'Arbre' },
  { path: '/timeline', icon: '📅', label: 'Timeline' },
  { path: '/stats', icon: '📊', label: 'Statistiques' },
  { path: '/map', icon: '🗺️', label: 'Carte' },
  { path: '/reports', icon: '📄', label: 'Rapports' },
  { path: '/export', icon: '💾', label: 'Export' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static`}>
        <div className="p-6 border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold dark:text-white">🌳 Généalogie</h1>
        </div>
        
        <nav className="p-4">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700">
          <Link
            to="/person/new"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <span>➕</span>
            <span>Ajouter une personne</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
