import React, { useState } from 'react';
import FavoriteButton from '../FavoriteButton';
import ReviewsSection from '../ReviewsSection';
import api from '../../services/api';

export const safeUrl = (value) => {
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

const foodBusinessTypeMap = {
  restaurant: 'restaurant',
  restaurants: 'restaurant',
  'coffee-shop': 'coffee-shop',
  'coffee-shops': 'coffee-shop',
  'sweet-shops-&-bakery': 'bakery',
  'sweet-shops-and-bakery': 'bakery',
  bakery: 'bakery',
  'catering-service': 'catering',
  'catering-services': 'catering',
  catering: 'catering',
  'food-processing': 'food-processing',
};

export const resolveFoodBusinessType = (place) => {
  const businessType = place?.attributes?.businessProfile?.businessType || place?.attributes?.restaurantProfile?.businessType;
  const candidates = [businessType, place?.subcategory?.slug, place?.subcategory?.name, place?.category?.slug, place?.category?.name];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const key = String(candidate).trim().toLowerCase().replace(/[_\s]+/g, '-');
    if (foodBusinessTypeMap[key]) return foodBusinessTypeMap[key];
  }
  return '';
};

export const getProfileData = (place) => {
  const business = place?.attributes?.businessProfile || {};
  const legacy = place?.attributes?.restaurantProfile || {};
  const common = business.common || legacy.common || {};
  const categorySpecific = business.categorySpecific || legacy.categorySpecific || {};
  const legacyBasic = legacy.basicInformation || {};
  const legacyLocation = legacy.location || {};
  const legacyDetails = legacy.details || {};
  const merged = { ...common, ...categorySpecific, ...legacyBasic, ...legacyLocation, ...legacyDetails };
  return {
    ...merged,
    services: categorySpecific.services || common.services || legacy.services || place?.services || [],
    infrastructure: categorySpecific.infrastructure || common.infrastructure || legacy.infrastructure || place?.facilities || [],
    businessType: business.businessType || legacy.businessType || '',
    socialMedia: { ...(place?.socialLinks || {}), ...(common.socialMedia || {}), ...(legacy.socialMedia || {}) },
    openingHours: common.openingHours || legacy.openingHours || legacyDetails.openingHours || place?.workingHours || [],
    gallery: common.gallery || legacy.gallery || place?.images || [],
    videos: common.videos || legacy.videos || [],
    logo: common.logo || place?.logo || '',
    coverImage: common.coverImage || place?.coverImage || '',
    about: common.about || place?.description || '',
  };
};

export function ImageFrame({ src, alt, className = '', eager = false }) {
  return src ? <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} className={`h-full w-full object-cover ${className}`} /> : <div className={`h-full w-full bg-gradient-to-br from-stone-300 to-stone-700 ${className}`} aria-label={alt} />;
}

export function ProfileMasthead({ place }) {
  const [reportOpen, setReportOpen] = useState(false);
  const rating = Number(place.rating?.average || 0);
  const reviewCount = Number(place.rating?.count || 0);
  const profile = getProfileData(place);
  const category = place.subcategory?.name || place.category?.name || profile.businessType?.replace(/-/g, ' ') || 'Food & Dining';
  const share = () => navigator.share ? navigator.share({ title: place.name, url: window.location.href }) : navigator.clipboard?.writeText(window.location.href);
  const report = async () => { await api.post('/reports', { place: place._id, reason: 'other' }); setReportOpen(false); };
  return <section className="bg-[#f8fbff] px-5 pt-7 text-[#102d49] sm:px-8 sm:pt-10"><div className="mx-auto flex max-w-[1520px] flex-col justify-between gap-6 lg:flex-row lg:items-start"><div className="min-w-0"><p className="text-sm font-medium text-[#7794ad]">{category}</p><div className="mt-2 flex flex-wrap items-center gap-3"><h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">{place.name}</h1>{place.verified && <span className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white">Verified</span>}</div><div className="mt-3 flex items-center gap-2 text-sm text-[#7794ad]"><span className="tracking-[0.08em] text-teal-600" aria-label={`${rating} out of 5 stars`}>{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span><span>{rating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span></div></div><div className="flex flex-wrap items-center gap-2"><a href="#home" className="rounded-md bg-[#ed6949] px-5 py-3 text-sm font-bold text-white">Business profile</a><FavoriteButton placeId={place._id} /><button type="button" onClick={share} className="rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-medium">Share</button><button type="button" onClick={() => setReportOpen(true)} className="rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-medium">Report</button></div></div>{reportOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="w-full max-w-sm rounded-xl bg-white p-6 text-[#332622]"><h2 className="font-display text-2xl font-semibold">Report this business</h2><p className="mt-3 text-sm opacity-70">Our team will review this listing.</p><div className="mt-5 flex gap-3"><button type="button" onClick={() => setReportOpen(false)} className="flex-1 rounded border border-black/10 px-4 py-2">Cancel</button><button type="button" onClick={report} className="flex-1 rounded bg-black px-4 py-2 text-white">Report</button></div></div></div>}</section>;
}

export function ProfileNavigation({ links, action }) {
  const [open, setOpen] = useState(false);
  return <nav className="sticky top-0 z-40 border-y border-slate-200 bg-white/95 px-5 py-3 text-[#102d49] backdrop-blur sm:px-8"><div className="mx-auto flex max-w-[1520px] items-center justify-between gap-4"><div className="hidden flex-wrap items-center gap-x-7 gap-y-2 text-sm font-semibold lg:flex">{links.map(([label, href]) => <a key={href} href={href} className="transition-opacity hover:opacity-60">{label}</a>)}</div><div className="ml-auto flex items-center gap-2">{action}<button type="button" onClick={() => setOpen(!open)} className="rounded border border-slate-200 px-3 py-2 text-sm font-semibold lg:hidden">Menu</button></div></div>{open && <div className="mx-auto mt-3 max-w-[1520px] border-t border-slate-200 pt-2 lg:hidden">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)} className="block border-b border-slate-100 py-3 text-sm font-semibold">{label}</a>)}</div>}</nav>;
}

export function FoodDiningProfileMasthead({ place }) {
  const [reportOpen, setReportOpen] = useState(false);
  const rating = Number(place.rating?.average || 0);
  const reviewCount = Number(place.rating?.count || 0);
  const share = () => navigator.share ? navigator.share({ title: place.name, url: window.location.href }) : navigator.clipboard?.writeText(window.location.href);
  const report = async () => { await api.post('/reports', { place: place._id, reason: 'other' }); setReportOpen(false); };
  return <section className="bg-[#f8fbff] px-5 pt-7 text-[#102d49] sm:px-8 sm:pt-10"><div className="mx-auto max-w-[1520px]"><div className="flex flex-wrap items-center gap-3"><h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">{place.name}</h1>{place.verified && <span className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white">Verified</span>}</div><div className="mt-3 flex items-center gap-2 text-sm text-[#7794ad]"><span className="tracking-[0.08em] text-teal-600" aria-label={`${rating} out of 5 stars`}>{'\u2605'.repeat(Math.round(rating))}{'\u2606'.repeat(5 - Math.round(rating))}</span><span>{rating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span></div><div className="mt-6 flex flex-wrap items-center gap-2"><FavoriteButton placeId={place._id} /><button type="button" onClick={share} className="rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-medium">Share</button><button type="button" onClick={() => setReportOpen(true)} className="rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-medium">Report</button></div></div>{reportOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="w-full max-w-sm rounded-xl bg-white p-6 text-[#332622]"><h2 className="font-display text-2xl font-semibold">Report this business</h2><p className="mt-3 text-sm opacity-70">Our team will review this listing.</p><div className="mt-5 flex gap-3"><button type="button" onClick={() => setReportOpen(false)} className="flex-1 rounded border border-black/10 px-4 py-2">Cancel</button><button type="button" onClick={report} className="flex-1 rounded bg-black px-4 py-2 text-white">Report</button></div></div></div>}</section>;
}

export function BusinessHeader({ place, links, action }) {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
      <a href="#home" className="flex min-w-0 items-center gap-3"><div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-black/10 bg-white"><ImageFrame src={getProfileData(place).logo} alt={`${place.name} logo`} /></div><span className="truncate font-display text-xl font-semibold">{place.name}</span></a>
      <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex">{links.map(([label, href]) => <a key={href} href={href} className="transition-opacity hover:opacity-60">{label}</a>)}</nav>
      <div className="flex items-center gap-2">{action}<button type="button" onClick={() => setOpen(!open)} className="rounded border border-black/15 px-3 py-2 text-lg lg:hidden" aria-label="Open navigation">☰</button></div>
    </div>
    {open && <nav className="border-t border-black/10 px-5 py-2 lg:hidden">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)} className="block border-b border-black/10 py-3 text-sm font-semibold">{label}</a>)}</nav>}
  </header>;
}

export function HeroSection({ place, profile, eyebrow, tagline, cta = 'Get in touch', ctaHref = '#contact' }) {
  return <section id="home" className="bg-[#f8fbff] px-5 pb-5 sm:px-8 sm:pb-8"><div className="relative isolate mx-auto min-h-[480px] max-w-[1520px] overflow-hidden rounded-2xl bg-stone-900 text-white"><div className="absolute inset-0"><ImageFrame src={profile.coverImage || profile.gallery?.[0]} alt={`${place.name} banner`} eager /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" /></div><div className="relative mx-auto flex min-h-[480px] max-w-7xl items-end px-6 py-12 sm:px-10 sm:py-16"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">{eyebrow}</p><p className="mt-3 text-xl font-semibold text-amber-100 sm:text-2xl">{tagline}</p>{profile.about && <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">{profile.about}</p>}<a href={ctaHref} className="mt-7 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-bold text-stone-900">{cta}</a></div></div></div></section>;
}

export function AboutSection({ title = 'About', children, image }) {
  return <section id="about" className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">Our story</p><h2 className="mt-2 font-display text-4xl font-semibold">{title}</h2><div className="mt-5 text-sm leading-7 opacity-75">{children}</div></div><div className="h-72 overflow-hidden rounded-xl bg-black/10 lg:h-96"><ImageFrame src={image} alt={`${title} image`} /></div></section>;
}

export function ServicesSection({ title = 'Services', items = [] }) {
  return <section id="services" className="bg-black/5 px-5 py-16 sm:px-8"><div className="mx-auto max-w-7xl"><h2 className="font-display text-4xl font-semibold">{title}</h2><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map((item, index) => <div key={`${item}-${index}`} className="rounded-xl border border-black/10 bg-white p-5"><p className="text-lg font-semibold">{typeof item === 'string' ? item : item.name}</p>{typeof item !== 'string' && item.description && <p className="mt-2 text-sm opacity-65">{item.description}</p>}</div>)}</div></div></section>;
}

export function VideoGallery({ videos = [], title = 'Video Gallery' }) {
  const values = videos.map((video) => typeof video === 'string' ? { url: video } : video).filter((video) => video.url);
  return <section id="videos" className="mx-auto max-w-7xl px-5 py-16 sm:px-8"><h2 className="font-display text-4xl font-semibold">{title}</h2>{values.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{values.slice(0, 10).map((video, index) => <a key={`${video.url}-${index}`} href={safeUrl(video.url)} target="_blank" rel="noreferrer" className="rounded-xl border border-black/10 bg-white p-4"><div className="grid aspect-video place-items-center rounded-lg bg-black/10 text-3xl">▶</div><p className="mt-3 truncate text-sm font-semibold">{video.title || 'Watch video'}</p></a>)}</div> : <p className="mt-5 text-sm opacity-60">Videos will be added soon.</p>}</section>;
}

export function PhotoGallery({ place, profile, title = 'Gallery' }) {
  const [lightbox, setLightbox] = useState(-1);
  const photos = (profile.gallery?.length ? profile.gallery : place.images || []).filter(Boolean).slice(0, 10);
  return <section id="gallery" className="bg-stone-900 px-5 py-16 text-white sm:px-8"><div className="mx-auto max-w-7xl"><h2 className="font-display text-4xl font-semibold">{title}</h2>{photos.length ? <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{photos.map((photo, index) => <button type="button" key={`${photo}-${index}`} onClick={() => setLightbox(index)} className="aspect-square overflow-hidden rounded-lg"><img src={photo} alt={`${place.name} gallery ${index + 1}`} className="h-full w-full object-cover transition hover:scale-105" /></button>)}</div> : <p className="mt-5 text-sm text-white/60">Photos will be added soon.</p>}</div>{lightbox >= 0 && <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4" onClick={() => setLightbox(-1)}><img src={photos[lightbox]} alt={`${place.name} gallery`} className="max-h-[90vh] max-w-[94vw] object-contain" /></div>}</section>;
}

export function ContactSection({ place, profile, title = 'Contact' }) {
  const phone = place.phone ? `tel:${place.phone.replace(/\s/g, '')}` : '';
  const email = place.email ? `mailto:${place.email}` : '';
  const map = safeUrl(profile.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address || '')}`);
  return <section id="contact" className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_.8fr]"><div><h2 className="font-display text-4xl font-semibold">{title}</h2><p className="mt-4 text-sm leading-7 opacity-70">{place.address}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{phone && <a href={phone} className="rounded-lg border border-black/10 bg-white p-4 text-sm font-semibold">{place.phone}</a>}{email && <a href={email} className="rounded-lg border border-black/10 bg-white p-4 text-sm font-semibold">{place.email}</a>}<a href={map} target="_blank" rel="noreferrer" className="rounded-lg border border-black/10 bg-white p-4 text-sm font-semibold">Open location</a>{profile.socialMedia?.whatsapp && <a href={safeUrl(profile.socialMedia.whatsapp)} target="_blank" rel="noreferrer" className="rounded-lg border border-black/10 bg-white p-4 text-sm font-semibold">WhatsApp</a>}</div><div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">{Object.entries(profile.socialMedia || {}).filter(([key, value]) => key !== 'whatsapp' && value).map(([key, value]) => <a key={key} href={safeUrl(value)} target="_blank" rel="noreferrer">{key}</a>)}</div></div><div className="rounded-xl border border-black/10 bg-white p-6"><h3 className="font-display text-2xl font-semibold">Opening hours</h3><div className="mt-5 space-y-3 text-sm">{profile.openingHours?.length ? profile.openingHours.map((hour) => <div key={hour.day} className="flex justify-between gap-4"><span className="capitalize opacity-60">{hour.day}</span><strong>{hour.closed ? 'Closed' : `${hour.open || ''} - ${hour.close || ''}`}</strong></div>) : <p className="opacity-60">Opening hours have not been added yet.</p>}</div></div></section>;
}

export function InteractionBar({ place }) {
  const [reportOpen, setReportOpen] = useState(false);
  const report = async () => { await api.post('/reports', { place: place._id, reason: 'other' }); setReportOpen(false); };
  return <><div className="fixed bottom-5 right-4 z-30 flex flex-wrap items-center gap-2 rounded-full border border-black/10 bg-white/95 p-2 shadow-xl"><FavoriteButton placeId={place._id} /><button type="button" onClick={() => navigator.share ? navigator.share({ title: place.name, url: window.location.href }) : navigator.clipboard?.writeText(window.location.href)} className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold">Share</button><a href="#reviews" className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold">Comment</a><button type="button" onClick={() => setReportOpen(true)} className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold">Report</button></div>{reportOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="w-full max-w-sm rounded-xl bg-white p-6"><h2 className="font-display text-2xl font-semibold">Report this business</h2><p className="mt-3 text-sm opacity-70">Our team will review this listing.</p><div className="mt-5 flex gap-3"><button type="button" onClick={() => setReportOpen(false)} className="flex-1 rounded border border-black/10 px-4 py-2">Cancel</button><button type="button" onClick={report} className="flex-1 rounded bg-black px-4 py-2 text-white">Report</button></div></div></div>}</>;
}

export function ReviewsBlock({ place }) {
  return <section id="reviews" className="bg-black/5 px-5 py-16 sm:px-8"><div className="mx-auto max-w-4xl rounded-xl border border-black/10 bg-white p-5 sm:p-8"><ReviewsSection placeId={place._id} /></div></section>;
}

export function BusinessFooter({ place }) {
  return <footer className="bg-stone-950 px-5 py-10 text-white sm:px-8"><div className="mx-auto max-w-7xl"><h2 className="font-display text-2xl font-semibold">{place.name}</h2><p className="mt-3 text-sm text-white/60">{place.address}</p><p className="mt-6 text-xs text-white/40">{new Date().getFullYear()} {place.name}</p></div></footer>;
}

export function ProfileLoading({ error }) {
  return <div className="grid min-h-screen place-items-center bg-white p-6 text-center"><div><h1 className="font-display text-3xl font-semibold">{error ? 'This profile is unavailable' : 'Loading profile...'}</h1>{error && <p className="mt-3 text-sm opacity-60">{error}</p>}</div></div>;
}
