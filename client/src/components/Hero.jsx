import React, { useEffect, useState } from 'react';
import LocationSelector from './LocationSelector';

const CITY_SLIDES = [
  { city: 'Rajahmundry', caption: 'The city of Godavari', count: '1,240+ local places', image: 'https://cdn.tripuntold.com/media/photos/location/2018/10/29/a4ce0187-5174-44cb-89f1-01242e9bdd29.jpg' },
  { city: 'Vijayawada', caption: 'Where culture meets the river', count: '2,180+ local places', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Indrakeeladri%20and%20Prakasam%20Barrage%20from%20Tadepalli%20%2802%29.jpg?width=1800' },
  { city: 'Visakhapatnam', caption: 'Coast, hills and city life', count: '3,020+ local places', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Aerial%20view%20of%20Rushikonda%20beach.jpg?width=2000' },
  { city: 'Kakinada', caption: 'The calm coastal city', count: '860+ local places', image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Scenic%20view%20of%20Kakinada%20beach%20during%20evening.jpg?width=1800' },
];

/**
 * A hand-drawn "directory board" illustration — small plaques pinned to a
 * board, each carrying a simple line icon for one category. This stands in
 * for a stock photo: it's grounded in the actual subject (a city directory)
 * rather than a generic hero graphic.
 */
function DirectoryBoard() {
  const plaques = [
    { icon: 'school', rot: -3, x: 0, y: 0 },
    { icon: 'health', rot: 2, x: 1, y: 0 },
    { icon: 'food', rot: -2, x: 0, y: 1 },
    { icon: 'temple', rot: 3, x: 1, y: 1 },
  ];

  const icons = {
    school: (
      <path d="M12 4 3 8.5 12 13l9-4.5L12 4Zm-6 6.2v4.6c0 1.3 2.7 2.7 6 2.7s6-1.4 6-2.7v-4.6" strokeWidth="1.4" />
    ),
    health: (
      <path d="M12 5v14M5 12h14M6 6l1.5 1.5M18 6l-1.5 1.5M6 18l1.5-1.5M18 18l-1.5-1.5" strokeWidth="1.4" strokeLinecap="round" />
    ),
    food: (
      <path
        d="M7 3v7a2 2 0 0 0 2 2v9M9 3v9M11 3v9M17 3c-2 1-2 4-2 6s.6 3 2 3v9"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    ),
    temple: (
      <path
        d="M12 3 6 9h12L12 3ZM5 9h14M6 12v7M18 12v7M9 12v7M15 12v7M4 19h16"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    ),
  };

  const labels = { school: 'Schools', health: 'Hospitals', food: 'Restaurants', temple: 'Temples' };

  return (
    <div className="relative mx-auto aspect-square max-w-md rounded-2xl bg-gradient-to-br from-ink to-ink-light p-6 shadow-[0_24px_60px_rgba(16,42,67,0.25)] sm:p-8">
      <div className="absolute left-1/2 top-3 h-2 w-2 -translate-x-1/2 rounded-full bg-marigold" />
      <div className="grid h-full grid-cols-2 gap-4 sm:gap-5">
        {plaques.map((p) => (
          <div
            key={p.icon}
            style={{ transform: `rotate(${p.rot}deg)` }}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-white/70 bg-white px-3 py-5 shadow-lg"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#1B2A4A" className="h-8 w-8">
              {icons[p.icon]}
            </svg>
            <span className="font-display text-sm font-medium text-ink">{labels[p.icon]}</span>
          </div>
        ))}
      </div>
      <span className="absolute -bottom-4 right-4 rounded-full bg-marigold px-3 py-1 font-display text-xs font-semibold text-white shadow-lg">
        +1,000 more
      </span>
    </div>
  );
}

export default function Hero() {
  const [slideIndex, setSlideIndex] = useState(0);
  const activeSlide = CITY_SLIDES[slideIndex];

  useEffect(() => {
    const timer = setInterval(() => setSlideIndex((index) => (index + 1) % CITY_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="home-hero relative overflow-hidden border-b border-slate-800 bg-[#061d38]">
      <div className="container-page relative isolate overflow-hidden">
        <img src={activeSlide.image} alt={`${activeSlide.city} city view`} className="home-hero-image" />
        <div className="home-hero-shade" />
        <div className="relative grid gap-8 py-8 sm:gap-10 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
        <div className="contents lg:block">
          <p className="order-1 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100 backdrop-blur lg:order-none"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Your city, beautifully organised</p>
          <h1 className="order-2 mt-4 max-w-xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-white sm:mt-5 sm:text-5xl lg:order-none lg:text-6xl">
            Discover everything around <span className="text-cyan-300">you.</span>
          </h1>
          <p className="order-3 mt-4 max-w-xl text-[15px] leading-relaxed text-white/85 sm:mt-5 sm:text-[17px] lg:order-none">
            Find trusted schools, colleges, hospitals, businesses, shopping
            destinations, restaurants and more in your city — verified by
            Google Pages, reviewed by people who've actually been there.
          </p>

          <div className="order-5 mt-5 rounded-2xl border border-white/60 bg-white/95 p-1.5 shadow-[0_20px_60px_rgba(2,12,27,0.34)] backdrop-blur sm:mt-8 sm:p-3 lg:order-none">
            <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Start exploring near you</p>
            <LocationSelector />
          </div>

          <div className="order-6 mt-5 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/20 pt-4 text-xs text-white/75 sm:mt-8 sm:gap-7 sm:pt-5 sm:text-sm lg:order-none">
            <div>
              <div className="font-display text-xl font-bold text-white sm:text-2xl">28+</div>
              states covered
            </div>
            <div>
              <div className="font-display text-xl font-bold text-white sm:text-2xl">40k+</div>
              verified listings
            </div>
            <div>
              <div className="font-display text-xl font-bold text-white sm:text-2xl">2M+</div>
              monthly visits
            </div>
          </div>
        </div>

        <div className="relative order-4 overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-3 shadow-[0_24px_70px_rgba(0,0,0,.3)] lg:order-none">
          <img key={activeSlide.image} src={activeSlide.image} alt={`${activeSlide.city} city view`} className="home-city-slide aspect-[4/3] h-auto w-full rounded-2xl object-cover" />
          <div className="absolute left-8 top-8 rounded-2xl bg-white/95 px-4 py-3 shadow-lg"><p className="text-xs font-semibold text-blue-600">📍 EXPLORE NOW</p><p className="mt-1 font-display text-xl font-bold text-ink">{activeSlide.city}</p><p className="text-xs text-ink/55">{activeSlide.caption}</p></div>
          <div className="absolute bottom-8 right-8 rounded-xl border border-white/30 bg-slate-950/50 px-4 py-3 text-sm font-medium text-white backdrop-blur">{activeSlide.count} →</div>
          <div className="absolute bottom-8 left-8 flex gap-1.5">{CITY_SLIDES.map((slide, index) => <button key={slide.city} type="button" onClick={() => setSlideIndex(index)} aria-label={`Show ${slide.city}`} className={`h-2 rounded-full transition-all ${index === slideIndex ? 'w-6 bg-white' : 'w-2 bg-white/55 hover:bg-white'}`} />)}</div>
        </div>
        </div>
      </div>
    </section>
  );
}
