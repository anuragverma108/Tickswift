import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import {
  HomeIcon,
  TicketIcon,
  PlusCircleIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  WifiIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, isOnline, userRole } = useFirebase();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'My Tickets', href: '/my-tickets', icon: TicketIcon },
    { name: 'Raise Ticket', href: '/raise-ticket', icon: PlusCircleIcon },
    // Admin Panel will be conditionally rendered below
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex h-screen bg-dark-950">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-900/95 backdrop-blur-xl border-r border-dark-700/50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-dark-700/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="text-xl font-bold text-white">TickSwift</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`sidebar-item ${isActive(item.href) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            ))}
            {/* Admin Panel link only for admins */}
            {userRole === 'admin' && (
              <Link
                to="/admin"
                className={`sidebar-item ${isActive('/admin') ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <UserGroupIcon className="h-5 w-5 mr-3" />
                <span className="text-sm font-medium">Admin Panel</span>
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-dark-900/95 backdrop-blur-xl border-b border-dark-700/50 h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-700"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-4">
            {/* Network Status Indicator */}
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <div className="flex items-center text-green-400">
                  <WifiIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs">Online</span>
                </div>
              ) : (
                <div className="flex items-center text-red-400">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs">Offline</span>
                </div>
              )}
            </div>

            <button className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-700 relative">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3">
              {/* Removed user image/avatar */}
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">
                  {currentUser?.displayName || 'User'}
                </p>
                <p className="text-xs text-gray-400">
                  {currentUser?.email || 'user@example.com'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-700"
                title="Logout"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-dark-950 p-6">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout; 