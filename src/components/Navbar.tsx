import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, LogOut } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAdmin, logout } = useAdmin();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navItems = [
    { label: 'About', to: '/about' },
    { label: 'Activities', to: '/activities' },
    { label: 'Members', to: '/members' },
    { label: 'Board', to: '/board' },
    { label: 'Contact', to: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass border-b border-aing-border' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo.png" alt="A.ing" className="h-8 w-auto opacity-90 group-hover:opacity-100 transition-opacity" />
          <span className="text-sm font-mono text-aing-muted group-hover:text-aing-blue transition-colors">
            @ Gachon
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link ${isActive(item.to) ? 'text-aing-white' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">
          {isAdmin ? (
            <>
              <Link to="/admin" className="nav-link text-aing-blue">Admin</Link>
              <button onClick={logout} className="nav-link flex items-center gap-1">
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="nav-link flex items-center gap-1 hover:text-aing-white">
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
          className="md:hidden text-aing-muted hover:text-aing-white transition-colors"
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
                isActive(item.to) ? 'text-aing-white' : 'text-aing-muted hover:text-aing-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
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
