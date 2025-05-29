// src/components/NavBar.js
import React, {
  useState,
  useContext,
  useEffect,
  useRef,
} from 'react';
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  FiMenu,
  FiX,
} from 'react-icons/fi';
import {
  FaMoon,
  FaSun,
  FaUserCircle,
  FaSignOutAlt,
} from 'react-icons/fa';
import api from '../api';
import { ThemeContext } from '../App';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [user, setUser] = useState(null);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef(null);

  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const isLanding    = pathname === '/';
  const isAuth       = !!localStorage.getItem('token');
  const isAdmin      = localStorage.getItem('role') === 'admin';

  const { theme, setTheme } = useContext(ThemeContext);
  const toggleTheme = () =>
    setTheme(theme === 'dark' ? 'light' : 'dark');

  // fetch profile if logged in
  useEffect(() => {
    if (!isAuth) return;
    let cancel = false;
    api.get('/auth/profile')
      .then((res) => {
        if (!cancel) setUser(res.data);
      })
      .catch(console.error);
    return () => { cancel = true; };
  }, [isAuth]);

  // click‐outside to close avatar dropdown
  useEffect(() => {
    const onClick = (e) => {
      if (
        avatarMenuRef.current &&
        !avatarMenuRef.current.contains(e.target)
      ) {
        setAvatarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () =>
      document.removeEventListener('mousedown', onClick);
  }, []);

  // scroll-spy for landing anchors
  useEffect(() => {
    if (!isLanding) return;
    const sections = ['hero','about','services','contact'];
    const opts = { rootMargin:'-50% 0px -50% 0px', threshold:0 };
    const obs = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const o = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActiveSection(id);
        });
      }, opts);
      o.observe(el);
      return o;
    }).filter(Boolean);
    return () => obs.forEach((o) => o.disconnect());
  }, [isLanding]);

  // smooth scroll
  const handleScrollTo = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
    setOpen(false);
  };

  // link colors based on theme / landing vs inner
  const landingTextColor =
    theme === 'dark'
      ? 'text-white hover:text-blue-300'
      : 'text-gray-800 hover:text-blue-600';
  const linkColor = isLanding
    ? landingTextColor
    : 'text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400';
  const logoColor = isLanding
    ? theme==='dark' ? 'text-white' : 'text-gray-800'
    : 'text-gray-800 dark:text-gray-100';
  const iconColor = logoColor;
  const mobileColor = isLanding
    ? landingTextColor
    : 'text-gray-800 dark:text-gray-200';

  // your link arrays:
  const landingLinks = [
    { to:'#hero',     label:'Home',     type:'anchor' },
    { to:'#about',    label:'About',    type:'anchor' },
    { to:'#services', label:'Services', type:'anchor' },
    { to:'#contact',  label:'Contact',  type:'anchor' },
  ];
  const guestLinks = [
    { to:'/login',    label:'Login',   type:'link' },
    { to:'/register', label:'Sign Up', type:'link', primary:true },
  ];
  const authLinks = [
    { to:'/summarize',label:'Summarize',type:'link' },
    { to:'/history',  label:'History',  type:'link' },
    { to:'/dashboard',label:'Dashboard',type:'link' },
  ];
  if (isAdmin) {
    authLinks.push(
      { to:'/admin',      label:'Admin', type:'link' },
      { to:'/admin/users',label:'Users', type:'link' },
    );
  }

  // ✏️ UPDATED: if NOT auth, merge landing & guest so login/signup appear on homepage
  const linksToShow = isAuth
    ? authLinks
    : [...landingLinks, ...guestLinks];

  const getLinkClass = (link, base) => {
    let isActive = false;
    if (link.type==='anchor') {
      isActive = isLanding && activeSection===link.to.slice(1);
    } else {
      isActive = !isLanding && pathname===link.to;
    }
    let cls = base;
    if (link.primary) {
      cls += ' bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 px-4 py-2 rounded-lg transition-all transform hover:scale-[1.03] shadow-md';
    }
    if (isActive) {
      cls += ' text-blue-600 dark:text-blue-400 font-semibold';
    }
    return cls;
  };

  // initials for avatar
  const getInitials = (name, email) => {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length>=2) {
        return (parts[0][0]+parts[1][0]).toUpperCase();
      }
      return name.slice(0,2).toUpperCase();
    }
    return email.slice(0,2).toUpperCase();
  };

  return (
    <>
      <a href={isLanding?'#hero':'/'} className="sr-only focus:not-sr-only">
        Skip to content
      </a>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={`
          fixed top-0 w-full z-50 transition-colors duration-300
          ${isLanding
            ? 'bg-gradient-to-br from-gray-100/80 to-blue-100/80 dark:from-gray-900/80 dark:to-blue-900/80 backdrop-blur-lg border-transparent'
            : 'bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700'}
        `}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          <Link to="/" className={`text-2xl font-bold ${logoColor}`}>
            NeuroBrief
          </Link>

          {/* DESKTOP */}
          <div className="hidden md:flex items-center space-x-6">
            {linksToShow.map((link, i) => {
              const base = `relative font-medium transition-colors duration-200 ${linkColor}`;
              if (link.type==='anchor') {
                return (
                  <a
                    key={i}
                    href={link.to}
                    onClick={(e)=>handleScrollTo(e,link.to.slice(1))}
                    className={getLinkClass(link, base)}
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <Link
                  key={i}
                  to={link.to}
                  className={getLinkClass(link, base)}
                >
                  {link.label}
                </Link>
              );
            })}

            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              aria-label="Toggle theme"
            >
              {theme==='dark'
                ? <FaSun className="text-yellow-400"/>
                : <FaMoon className="text-gray-800 dark:text-gray-200"/>}
            </button>

            {/* Avatar Dropdown */}
            {isAuth && (
              <div className="relative" ref={avatarMenuRef}>
                <button
                  onClick={()=>setAvatarMenuOpen(o=>!o)}
                  className="
                    w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white
                    flex items-center justify-center
                    focus:outline-none focus:ring-2 focus:ring-indigo-400
                    shadow-md hover:shadow-lg transition-all
                  "
                  aria-haspopup="true"
                  aria-expanded={avatarMenuOpen}
                >
                  {user
                    ? getInitials(user.name,user.email)
                    : <FaUserCircle className="text-2xl"/>}
                </button>
                {avatarMenuOpen && (
                  <div className="
                    absolute right-0 mt-2 w-48
                    bg-white dark:bg-gray-800
                    rounded-xl shadow-lg py-2 z-50 overflow-hidden
                    border border-gray-200 dark:border-gray-700
                  ">
                    <Link
                      to="/dashboard"
                      className="
                        flex items-center px-4 py-3 text-gray-700 dark:text-gray-200
                        hover:bg-gray-100 dark:hover:bg-gray-700 transition
                      "
                      onClick={()=>setAvatarMenuOpen(false)}
                    >
                      <FaUserCircle className="mr-3 text-blue-500" />
                      Profile
                    </Link>
                    <button
                      onClick={()=>{
                        navigate('/dashboard',{state:{openChangePwd:true}});
                        setAvatarMenuOpen(false);
                      }}
                      className="
                        w-full text-left flex items-center px-4 py-3
                        text-gray-700 dark:text-gray-200
                        hover:bg-gray-100 dark:hover:bg-gray-700 transition
                      "
                    >
                      <FaUserCircle className="mr-3 text-blue-500" />
                      Change Password
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={()=>{
                        localStorage.clear();
                        window.location.href='/';
                      }}
                      className="
                        w-full text-left flex items-center px-4 py-3
                        text-red-600 hover:bg-red-50
                        dark:text-red-400 dark:hover:bg-gray-700 transition
                      "
                    >
                      <FaSignOutAlt className="mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBILE */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={()=>setOpen(o=>!o)}
              className={`p-2 text-2xl ${iconColor}`}
            >
              {open ? <FiX/> : <FiMenu/>}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {theme==='dark'
                ? <FaSun className="text-yellow-400"/>
                : <FaMoon className="text-gray-800 dark:text-gray-200"/>}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`
        md:hidden fixed inset-0 z-40 transform
        transition-transform duration-300 ease-in-out
        ${open?'translate-x-0':'-translate-x-full'}
      `}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-blue-900"></div>
        <div className="relative flex flex-col items-center pt-24 space-y-4">
          {linksToShow.map((link,i)=>{
            const baseMob = link.primary
              ? 'w-4/5 text-center py-3 font-medium bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-800 transition-all transform hover:scale-[1.03]'
              : `w-4/5 text-center py-3 font-medium transition ${mobileColor}`;
            const isActive =
              (link.type==='anchor' && activeSection===link.to.slice(1))
              || (link.type==='link' && pathname===link.to);
            const activeCls = isActive
              ? ' text-blue-600 dark:text-blue-400 font-semibold'
              : '';
            if (link.type==='anchor') {
              return (
                <a
                  key={i}
                  href={link.to}
                  onClick={(e)=>handleScrollTo(e,link.to.slice(1))}
                  className={baseMob+activeCls}
                >
                  {link.label}
                </a>
              );
            }
            return (
              <Link
                key={i}
                to={link.to}
                onClick={()=>setOpen(false)}
                className={baseMob+activeCls}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Mobile profile / auth options */}
          {!isAuth ? (
            <>
              <div className="w-4/5 border-t border-gray-300 dark:border-gray-600 my-2"></div>
              <Link
                to="/login"
                onClick={()=>setOpen(false)}
                className="w-4/5 text-center py-3 font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-lg transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={()=>setOpen(false)}
                className="w-4/5 text-center py-3 font-medium bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-800 transition-all transform hover:scale-[1.03]"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <div className="w-4/5 border-t border-gray-300 dark:border-gray-600 my-2"></div>
              <Link
                to="/dashboard"
                onClick={()=>setOpen(false)}
                className="w-4/5 text-center py-3 font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-lg transition"
              >
                Profile
              </Link>
              <button
                onClick={()=>{
                  navigate('/dashboard',{state:{openChangePwd:true}});
                  setOpen(false);
                }}
                className="w-4/5 text-center py-3 font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-lg transition"
              >
                Change Password
              </button>
              <button
                onClick={()=>{
                  localStorage.clear();
                  window.location.href='/';
                }}
                className="w-4/5 text-center py-3 font-medium text-red-600 dark:text-red-400 hover:bg-red-100/50 dark:hover:bg-gray-700/50 rounded-lg transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}