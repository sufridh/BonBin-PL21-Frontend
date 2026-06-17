import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Avatar from './Avatar';

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
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16 gap-1">
          {/* Logo */}
          <Link
            to={user ? '/picks' : '/login'}
            className="flex items-center gap-1.5 flex-shrink-0 min-w-0"
          >
            <img src="/logo.svg" alt="Bonbin PL" className="h-9 sm:h-11 w-auto flex-shrink-0" />
            <span className="font-display text-base sm:text-lg text-gold-400 tracking-wider whitespace-nowrap">
              BONBIN PL
            </span>
            <span className="text-maroon-300 text-xs ml-1 hidden md:inline whitespace-nowrap">PICK'EM</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar min-w-0">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex-shrink-0 whitespace-nowrap px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-gold-400 text-maroon-950'
                    : 'text-maroon-300 hover:text-cream-100 hover:bg-maroon-800'
                }`}
              >
                {label}
              </Link>
            ))}
            {user && (
              <Link
                to="/profile"
                className={`flex-shrink-0 ml-0.5 rounded-full transition-all ${
                  isActive('/profile') ? 'ring-2 ring-gold-400' : 'hover:ring-2 hover:ring-maroon-600'
                }`}
                title="Profil"
              >
                <Avatar src={user?.avatar_base64} name={user?.display_name} size={28} />
              </Link>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="flex-shrink-0 whitespace-nowrap text-maroon-300 hover:text-cream-100 text-xs sm:text-sm px-2 sm:px-3 py-1.5 ml-0.5"
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
