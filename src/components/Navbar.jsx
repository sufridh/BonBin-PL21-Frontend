import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navLinks = [
    { to: '/picks', label: '⚽ Tebak', show: !!user },
    { to: '/leaderboard', label: '🏆 Klasemen', show: true },
    { to: '/admin', label: '⚙️ Admin', show: user?.is_admin },
  ].filter(l => l.show);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-maroon-900/90 backdrop-blur-md border-b border-maroon-700 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to={user ? '/picks' : '/login'} className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <div>
              <span className="font-display text-lg text-gold-400 tracking-wider">BONBIN PL</span>
              <span className="text-maroon-300 text-xs ml-1 hidden sm:inline">PICK'EM</span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-gold-400 text-maroon-950'
                    : 'text-maroon-300 hover:text-cream-100 hover:bg-maroon-800'
                }`}
              >
                {label}
              </Link>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="text-maroon-300 hover:text-cream-100 text-sm px-3 py-1.5 ml-1"
              >
                Keluar
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
