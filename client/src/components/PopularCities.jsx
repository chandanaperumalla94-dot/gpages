import React from 'react';
import { Link } from 'react-router-dom';

const CITIES = [
  {
    name: 'Rajahmundry',
    state: 'Andhra Pradesh',
    count: '1,240 listings',
    image: 'https://cdn.tripuntold.com/media/photos/location/2018/10/29/a4ce0187-5174-44cb-89f1-01242e9bdd29.jpg',
    landmark: 'Godavari riverside',
    to: '/andhra-pradesh/east-godavari/rajahmundry',
  },
  {
    name: 'Vijayawada',
    state: 'Andhra Pradesh',
    count: '2,180 listings',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=85',
    landmark: 'City of temples',
    to: '/andhra-pradesh/ntr/vijayawada',
  },
  {
    name: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    count: '3,020 listings',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85',
    landmark: 'Coastal city life',
    to: '/andhra-pradesh/visakhapatnam/visakhapatnam-city',
  },
  {
    name: 'Bapatla',
    state: 'Andhra Pradesh',
    count: '320 listings',
    image: '/images/bapatla/suryalanka-beach.jpg',
    landmark: 'Suryalanka beach',
    to: '/andhra-pradesh/bapatla/bapatla',
  },
  {
    name: 'Chittoor',
    state: 'Andhra Pradesh',
    count: '680 listings',
    image: '/images/chittoor/horsley-hills.jpg',
    landmark: 'Horsley Hills',
    to: '/andhra-pradesh/chittoor/chittoor',
  },
  {
    name: 'Machilipatnam',
    state: 'Andhra Pradesh',
    count: '410 listings',
    image: '/images/machilipatnam/manginapudi-beach.jpg',
    landmark: 'Manginapudi beach',
    to: '/andhra-pradesh/krishna/machilipatnam',
  },
];

export default function PopularCities() {
  return (
    <section className="border-b border-line bg-[#f5f9fc] py-14 sm:py-20">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">Go places</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Explore popular cities</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/55 sm:text-base">Find the places, people and local favourites that make every city worth exploring.</p>
          </div>
          <Link to="/explore" className="hidden shrink-0 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 sm:block">View all cities <span aria-hidden="true">→</span></Link>
        </div>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CITIES.map((city) => (
            <Link
              key={city.name}
              to={city.to}
              aria-label={`Explore ${city.name}`}
              className="group relative flex min-h-[245px] flex-col justify-end overflow-hidden rounded-2xl bg-ink shadow-lg transition duration-500 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 sm:min-h-[270px]"
            >
              <img src={city.image} alt={`${city.name} view`} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04172b] via-[#04172b]/35 to-transparent" />
              <div className="relative z-10 p-5 text-white sm:p-6">
                <span className="inline-flex rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">{city.landmark}</span>
                <h3 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{city.name}</h3>
                <div className="mt-1 text-sm text-white/70">{city.state} <span className="mx-1 text-white/40">·</span> {city.count}</div>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-ink shadow-md transition group-hover:bg-cyan-300">
                  Explore city <span aria-hidden="true" className="text-base leading-none">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Link to="/explore" className="mt-6 inline-flex rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm sm:hidden">View all cities <span className="ml-1" aria-hidden="true">→</span></Link>
      </div>
    </section>
  );
}
