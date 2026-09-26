import React from 'react';
import { Link } from 'react-router-dom';

const COLUMNS = [
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Careers', to: '/careers' },
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Terms & conditions', to: '/terms' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Cities', to: '/explore' },
      { label: 'Categories', to: '/categories' },
      { label: 'Popular places', to: '/trending' },
    ],
  },
  {
    title: 'Business',
    links: [
      { label: 'List your business', to: '/business/register' },
      { label: 'Business login', to: '/business/login' },
      { label: 'Business support', to: '/business/support' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#071d33] py-10 text-paper/70">
      <div className="container-page grid gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="mt-1 flex items-center gap-2 text-sm text-paper/80">
            <span>📍</span>
            <span>Main Road, Rajahmundry</span>
          </div>

          <p className="mt-3 max-w-[220px] text-sm leading-relaxed">
            Helping people discover trusted places, one city at a time.
          </p>
          <div className="mt-5 flex gap-3 text-sm">
            {['Facebook', 'Instagram', 'LinkedIn', 'YouTube'].map((s) => (
              <a key={s} href="#" className="hover:text-paper" aria-label={s}>
                {s[0]}
              </a>
            ))}
          </div>
        </div>

        <div className="col-span-3 grid grid-cols-3 gap-2 sm:contents">
          {COLUMNS.map((col) => (
            <div key={col.title} className="min-w-0">
              <h4 className="font-display text-xs font-medium text-paper sm:text-sm">{col.title}</h4>
              <ul className="mt-3 flex flex-col gap-2 text-[11px] sm:mt-4 sm:gap-2.5 sm:text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="hover:text-paper">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container-page mt-12 border-t border-paper/10 pt-6 text-xs text-paper/40">
        © {new Date().getFullYear()} Company. All rights reserved.
      </div>
    </footer>
  );
}
