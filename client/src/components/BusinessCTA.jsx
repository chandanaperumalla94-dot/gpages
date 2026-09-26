import React from 'react';
import { Link } from 'react-router-dom';

export default function BusinessCTA() {
  return (
    <section className="bg-[#f7fbff] py-12 sm:py-16">
      <div className="container-page flex flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl bg-gradient-to-r from-[#062449] via-[#084d77] to-[#08a6a6] px-7 py-10 shadow-[0_20px_55px_rgba(4,51,88,.2)] sm:flex-row sm:items-center sm:px-10">
        <div className="max-w-lg">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-200">Grow with G-PAGES</p><h2 className="mt-3 font-display text-2xl font-bold text-paper sm:text-3xl">
            Own a business? Get discovered by people searching in your city.
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-paper/60">
            List your school, clinic, restaurant or shop for free. Add photos,
            services and hours — once verified, you're live for everyone
            searching your category and city.
          </p>
        </div>
        <Link
          to="/business/register"
          className="whitespace-nowrap rounded-xl bg-white px-6 py-3 font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-cyan-50"
        >
          List your business
        </Link>
      </div>
    </section>
  );
}
