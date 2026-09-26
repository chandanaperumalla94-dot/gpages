import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const TABS = [
  { label: 'Overview', to: '/admin' },
  { label: 'Categories', to: '/admin/categories' },
  { label: 'Businesses', to: '/admin/businesses' },
  { label: 'Users', to: '/admin/users' },
];

export default function AdminLayout() {
  return (
    <div className="container-page py-12">
      <h1 className="font-display text-2xl font-semibold text-ink">Admin dashboard</h1>

      <nav className="mt-6 flex gap-1 border-b border-line">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/admin'}
            className={({ isActive }) =>
              `border-b-2 px-4 py-2.5 text-sm transition ${
                isActive ? 'border-vermilion text-ink font-medium' : 'border-transparent text-ink/55 hover:text-ink'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
