import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LayoutDashboard, FileText, LogOut, User, Cpu } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-all">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            Antigravity<span className="text-indigo-400 font-extrabold">Studio</span>
          </span>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated ? (
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/ai-hub"
              className={`flex items-center space-x-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive('/ai-hub')
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>AI Playground</span>
            </Link>
          </nav>
        ) : null}

        {/* User Status / Actions */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 rounded-full bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-300">
                <User className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-medium text-slate-200">{user.name}</span>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-indigo-300 border border-indigo-500/30">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-rose-950/40 hover:border-rose-800/60 hover:text-rose-400 transition-all"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
