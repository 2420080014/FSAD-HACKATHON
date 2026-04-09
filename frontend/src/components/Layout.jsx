import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, MessageSquare, Activity, Shield, LogOut, Phone, Clock, Trash2 } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showClearModal, setShowClearModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleClearSession = () => {
    localStorage.clear();
    sessionStorage.clear();
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, roles: ['Seeker', 'Listener', 'Admin'] },
    { name: 'Mood & Stress', path: '/mood', icon: Activity, roles: ['Seeker'] },
    { name: 'Chat History', path: '/history', icon: Clock, roles: ['Seeker', 'Listener'] },
    { name: 'Moderation', path: '/admin', icon: Shield, roles: ['Admin'] },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-white/10 bg-slate-900/50 backdrop-blur-md flex flex-col p-4 fixed h-full z-20">
        <div className="flex items-center gap-3 mb-10 px-2 mt-4 text-accent-500">
          <MessageSquare className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-white">Companion</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            if (item.roles && !item.roles.includes(user?.role)) return null;
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4 space-y-2">
          <div className="px-4 py-3 flex items-center gap-3 text-slate-300">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center font-bold text-sm">
              {user?.nickname?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm leading-tight">{user?.nickname}</span>
              <span className="text-xs text-slate-500">{user?.role}</span>
            </div>
          </div>

          {/* Clear Session Button */}
          <button
            onClick={() => setShowClearModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all font-medium text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear Session Data
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen relative overflow-y-auto w-full">
        <Outlet />
      </main>

      {/* Persistent Emergency Button */}
      <a
        href="https://findahelpline.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-500 text-white p-4 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center justify-center transition-transform hover:scale-110 group z-50"
      >
        <Phone className="w-6 h-6 animate-pulse" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out pl-0 group-hover:pl-3 font-semibold">
          Emergency Resources
        </span>
      </a>

      {/* Clear Session Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <Trash2 className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Clear Session Data?</h3>
              <p className="text-slate-400 text-sm">
                This will remove all local browser data including your login session. No server data will be deleted.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleClearSession}
                className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-3 rounded-xl font-medium transition-all"
              >
                Clear & Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
