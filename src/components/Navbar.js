import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Award, User, BookOpen, Home, MessageSquare, FileText, Menu, X } from 'lucide-react';
import '../App.css';

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: User },
    { path: '/modules', label: 'Learn', icon: BookOpen },
    { path: '/mock-interview', label: 'Interview', icon: MessageSquare },
    { path: '/resume-builder', label: 'Resume', icon: FileText },
  ];

  return (
    <nav className="navbar glass">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <Award size={28} color="var(--primary)" />
          <span className="logo-text">SoftSkill<span style={{color: 'var(--primary)'}}>Pro</span></span>
        </Link>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Links */}
        <div className={`nav-links ${isOpen ? 'open' : ''}`}>
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className="nav-link"
              onClick={() => setIsOpen(false)}
              style={{
                color: isActive(path) ? 'var(--primary)' : 'var(--text-muted)',
                background: isActive(path) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
