import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const { isAdmin, logout } = useAuth();
  const location = useLocation();
  const adminMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setAdminMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(e.target as Node)) {
        setAdminMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'About', to: '/about' },
    { label: 'Activities', to: '/activities' },
    { label: 'History', to: '/projects' },
    { label: 'Members', to: '/members' },
    { label: 'Team', to: '/team' },
    { label: 'Community', to: '/board' },
    { label: 'Contact', to: '/contact' },
  ];

  const adminMenuItems = [
    { label: 'Dashboard', to: '/admin' },
    { label: 'Posts', to: '/admin/posts' },
    { label: 'Members', to: '/admin/members' },
    { label: 'Projects', to: '/admin/projects' },
    { label: 'Activities', to: '/admin/activities' },
    { label: 'Comments', to: '/admin/comments' },
    { label: 'Messages', to: '/admin/messages' },
    { label: 'Settings', to: '/admin/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass border-b border-aing-border' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <img src="/logo.png" alt="A.ing" className="h-10 w-auto opacity-90 group-hover:opacity-100 transition-opacity" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${isActive(item.to) ? 'text-aing-text' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">
          {isAdmin ? (
            <div className="relative" ref={adminMenuRef}>
              <button
                onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                className="nav-link text-aing-blue flex items-center gap-1"
              >
                Admin
                <ChevronDown size={12} className={`transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {adminMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 glass border border-aing-border rounded-xl shadow-xl py-1 z-50">
                  {adminMenuItems.map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="block px-4 py-2 text-xs text-aing-muted hover:text-aing-text hover:bg-white/5 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-aing-border mt-1 pt-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-xs text-aing-muted hover:text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={12} />
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/admin/login" className="nav-link flex items-center gap-1 hover:text-aing-text">
              <LogIn size={14} />
              <span className="text-xs">Admin</span>
            </Link>
          )}
          <Link
            to="/contact"
            className="btn-ghost text-sm !px-4 !py-2"
          >
            Join Us
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-aing-muted hover:text-aing-text transition-colors"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-aing-border px-6 py-6 flex flex-col gap-4">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-base font-medium transition-colors ${
                isActive(item.to) ? 'text-aing-text' : 'text-aing-muted hover:text-aing-text'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <div className="pt-2 border-t border-aing-border flex flex-col gap-2">
              {adminMenuItems.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-xs text-aing-blue hover:text-aing-text transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
          <div className="pt-2 border-t border-aing-border">
            <Link to="/contact" className="btn-primary text-sm inline-block text-center w-full">
              Join Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
