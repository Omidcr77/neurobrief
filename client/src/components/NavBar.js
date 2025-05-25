// src/components/NavBar.js
import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaMoon, FaSun } from 'react-icons/fa';
import { ThemeContext } from '../App';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isLanding = pathname === '/';
  const isAuth = !!localStorage.getItem('token');
  const isAdmin = localStorage.getItem('role') === 'admin';
  const { theme, setTheme } = useContext(ThemeContext);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  const landingTextColor =
    theme === 'dark' ? 'text-white hover:text-blue-200' : 'text-gray-800 hover:text-blue-600';
  const linkColor = isLanding
    ? landingTextColor
    : 'text-gray-800 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400';
  const logoColor = isLanding
    ? theme === 'dark'
      ? 'text-white'
      : 'text-gray-800'
    : 'text-gray-800 dark:text-gray-100';
  const iconColor = isLanding
    ? theme === 'dark'
      ? 'text-white'
      : 'text-gray-800'
    : 'text-gray-800 dark:text-gray-100';
  const mobileColor = isLanding
    ? landingTextColor
    : 'text-gray-800 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400';

  const landingLinks = [
    { to: '/',        label: 'Home',     type: 'link'   },
    { to: '#about',   label: 'About',    type: 'anchor' },
    { to: '#services',label: 'Services', type: 'anchor' },
    { to: '#contact', label: 'Contact',  type: 'anchor' },
    { to: '/login',   label: 'Login',    type: 'link'   },
    { to: '/register',label: 'Sign Up',  type: 'link'   },
  ];
  const guestLinks = [
    { to: '/login',   label: 'Login',    type: 'link' },
    { to: '/register',label: 'Sign Up',  type: 'link' },
  ];
  const authLinks = [
    { to: '/summarize', label: 'Summarize', type: 'link' },
    { to: '/history',   label: 'History',   type: 'link' },
    { to: '/dashboard', label: 'Dashboard', type: 'link' },
  ];
  if (isAdmin) {
    authLinks.push(
      { to: '/admin',           label: 'Admin',     type: 'link' },
      { to: '/admin/users',     label: 'Users',     type: 'link' },
    );
  }
  authLinks.push({ to: '/', label: 'Logout', type: 'button' });

  const linksToShow = isLanding ? landingLinks : isAuth ? authLinks : guestLinks;

  return (
    <nav
      className={`
        fixed top-0 w-full z-50 border-b border-gray-200 dark:border-gray-700
        ${
          isLanding
            ? 'bg-white bg-opacity-20 backdrop-blur-lg'
            : 'bg-white dark:bg-gray-800'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        <Link to="/" className={`text-2xl font-bold transition-colors duration-200 ${logoColor}`}>
          NeuroBrief
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {linksToShow.map((link, idx) => {
            const base = `relative px-3 py-2 font-medium transition-colors duration-200 ${linkColor}`;
            if (link.type === 'anchor') {
              const id = link.to.replace('#', '');
              return (
                <a
                  key={idx}
                  href={link.to}
                  onClick={(e) => handleScrollTo(e, id)}
                  className={base}
                >
                  {link.label}
                </a>
              );
            }
            if (link.type === 'link') {
              return (
                <Link key={idx} to={link.to} className={base}>
                  {link.label}
                </Link>
              );
            }
            // logout button
            return (
              <button
                key={idx}
                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                className={`${base} ${isLanding ? 'hover:text-red-300' : 'hover:text-red-600'}`}
              >
                {link.label}
              </button>
            );
          })}

          <button
            onClick={toggleTheme}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <FaSun className="text-yellow-400" />
            ) : (
              <FaMoon className="text-gray-800 dark:text-gray-200" />
            )}
          </button>
        </div>

        <div className="flex md:hidden items-center space-x-2">
          <button
            className={`p-2 text-2xl transition-colors duration-200 ${iconColor}`}
            onClick={() => setOpen(!open)}
          >
            {open ? <FiX /> : <FiMenu />}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <FaSun className="text-yellow-400" />
            ) : (
              <FaMoon className="text-gray-800 dark:text-gray-200" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div
          className={`
            md:hidden px-6 pb-4 space-y-4 border-t border-gray-200 dark:border-gray-700
            ${isLanding ? 'bg-gray-800 bg-opacity-90' : 'bg-white dark:bg-gray-800'}
          `}
        >
          {linksToShow.map((link, idx) => {
            if (link.type === 'anchor') {
              const id = link.to.replace('#', '');
              return (
                <a
                  key={idx}
                  href={link.to}
                  onClick={(e) => handleScrollTo(e, id)}
                  className={`block text-lg ${mobileColor}`}
                >
                  {link.label}
                </a>
              );
            }
            if (link.type === 'link') {
              return (
                <Link key={idx} to={link.to} className={`block text-lg ${mobileColor}`}>
                  {link.label}
                </Link>
              );
            }
            return (
              <button
                key={idx}
                onClick={() => { localStorage.clear(); window.location.href = '/'; }}
                className={`block text-lg ${
                  isLanding ? 'text-red-300 hover:text-red-500' : 'text-red-600 hover:text-red-800'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
