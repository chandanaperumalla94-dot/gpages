import React from 'react';
import { Link } from 'react-router-dom';

export default function BusinessesPage() {
  const steps = [
    ['01', 'Create your profile', 'Add your name, category, location, contact details, services, and images.'],
    ['02', 'Submit for review', 'Every new listing starts as pending so the directory stays trustworthy.'],
    ['03', 'Get discovered', 'After approval, your listing appears in city, category, search, and trending results.'],
  ];

  return (
    <div className="container-page py-12 sm:py-20">
      <div className="rounded-3xl bg-gradient-to-br from-ink-dark via-ink to-[#155E75] p-8 text-paper shadow-[0_22px_55px_rgba(16,42,67,0.22)] sm:p-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-marigold">For business owners</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold sm:text-6xl">Put your business in the places people are already looking.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-paper/65">Create a rich listing, add services and images, and submit it for a quick admin review. Once approved, customers can find and contact you.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/business/register?role=business" className="rounded-lg bg-marigold px-5 py-3 text-sm font-semibold text-white shadow-lg">Join as a business</Link>
          <Link to="/business/dashboard" className="rounded-lg border border-paper/20 px-5 py-3 text-sm font-medium text-paper hover:bg-paper/10">Open business dashboard</Link>
        </div>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {steps.map(([number, title, text]) => (
          <div key={number} className="rounded-2xl border border-white/80 bg-white/85 p-6 shadow-sm">
            <span className="font-display text-3xl text-vermilion">{number}</span>
            <h2 className="mt-6 font-display text-xl font-semibold text-ink">{title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/55">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
