import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Categories', to: '/categories' },
  { label: 'Explore', to: '/explore' },
  { label: 'Businesses', to: '/businesses' },
  { label: 'About', to: '/about' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [placeName, setPlaceName] = useState('Business');
  const { user, logout } = useAuth();
  const location = useLocation();
  const isPlaceHeader = /^\/place\//.test(location.pathname);

  useEffect(() => {
    if (!isPlaceHeader) {
      setPlaceName('Business');
      return;
    }

    const placeId = location.pathname.split('/').filter(Boolean)[1];
    if (!placeId) {
      setPlaceName('Business');
      return;
    }

    let ignore = false;
    api
      .get(`/places/${placeId}`)
      .then(({ data }) => {
        if (!ignore && data?.data?.name) {
          setPlaceName(data.data.name);
        }
      })
      .catch(() => {
        if (!ignore) setPlaceName('Business');
      });

    return () => { ignore = true; };
  }, [isPlaceHeader, location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 shadow-sm backdrop-blur">
      <div className="container-page flex h-[58px] items-center justify-between">
        {isPlaceHeader ? (
          <Link to={location.pathname} aria-label={placeName} className="flex min-w-0 items-center">
            <span className="truncate text-[15px] font-semibold text-ink sm:text-[17px]">{placeName}</span>
          </Link>
        ) : (
          <Link to="/" aria-label="Company home" className="flex items-center">
            <span className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">Company</span>
          </Link>
        )}

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-[15px] transition-colors hover:text-ink ${
                  isActive ? 'border-b-2 border-blue-600 py-[19px] text-blue-600 font-medium' : 'py-[21px] text-ink/75'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/search" aria-label="Search" className="text-ink/50 hover:text-ink">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
              <circle cx="11" cy="11" r="7" strokeWidth="1.6" />
              <path d="m20 20-3.5-3.5" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Link>
          {user ? (
            <>
              <Link
                to={user.role === 'admin' ? '/admin' : user.role === 'business' ? '/business/dashboard' : '/dashboard'}
                className="text-[15px] text-ink/70 hover:text-ink"
              >
                {user.role === 'admin' ? 'Admin dashboard' : user.role === 'business' ? 'Business dashboard' : user.name.split(' ')[0]}
              </Link>
              <button
                onClick={logout}
                className="rounded border border-line px-4 py-2 text-[15px] text-ink/70 transition hover:border-ink/30 hover:text-ink"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-[15px] text-ink/70 hover:text-ink">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-[15px] font-medium text-white shadow-sm transition hover:bg-blue-700"
              >
                Join Company
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded border border-line md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3 w-4">
            <span
              className={`absolute left-0 top-0 h-[1.5px] w-4 bg-ink transition-transform ${open ? 'translate-y-[6px] rotate-45' : ''}`}
            />
            <span className={`absolute left-0 top-[6px] h-[1.5px] w-4 bg-ink transition-opacity ${open ? 'opacity-0' : ''}`} />
            <span
              className={`absolute left-0 top-[12px] h-[1.5px] w-4 bg-ink transition-transform ${open ? '-translate-y-[6px] -rotate-45' : ''}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-white px-5 pb-5 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded px-2 py-2.5 text-[15px] text-ink/80 hover:bg-ink/5"
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
            {user ? (
              <button
                onClick={logout}
                className="rounded border border-line px-4 py-2.5 text-center text-[15px] text-ink/70"
              >
                Log out
              </button>
            ) : (
              <>
                <Link to="/login" className="rounded border border-line px-4 py-2.5 text-center text-[15px] text-ink/70">
                  Log in
                </Link>
                <Link to="/register" className="rounded-lg bg-marigold px-4 py-2.5 text-center text-[15px] font-medium text-white">
                  Join Company
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
