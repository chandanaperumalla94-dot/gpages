import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="container-page py-12 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-vermilion">About the directory</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink sm:text-6xl">Discover trusted local places across every day needs.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/60">
            This directory helps people find the right places by category, city, and location — from daily essentials to services, businesses, and community favorites.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/categories" className="inline-block rounded-lg bg-vermilion px-5 py-3 text-sm font-medium text-paper">Browse categories</Link>
            <Link to="/explore" className="inline-block rounded-lg border border-line px-5 py-3 text-sm font-medium text-ink/70">Explore cities</Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-line bg-[#f8fbff] p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div className="grid gap-4">
            {[
              'Clear categories',
              'Local discovery',
              'Verified businesses',
              'Better decisions',
            ].map((item) => (
              <div key={item} className="rounded-[18px] border border-line bg-white p-4 shadow-sm text-sm font-medium text-ink">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-20 grid gap-5 md:grid-cols-3">
        {[
          ['Clear browsing', 'Browse relevant categories and listings without clutter or confusion.'],
          ['Local discovery', 'Each listing is grouped by category and location so people can reach the right place faster.'],
          ['Trusted results', 'Verified businesses and reviews help people choose places that fit their needs and preferences.'],
        ].map(([title, text]) => (
          <div key={title} className="rounded-2xl border border-line bg-white/70 p-6">
            <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/55">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
