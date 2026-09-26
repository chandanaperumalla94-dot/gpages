import React from 'react';
import { getProfileData, FoodDiningProfileMasthead, ProfileNavigation, HeroSection, AboutSection, ServicesSection, VideoGallery, PhotoGallery, ReviewsBlock, ContactSection, BusinessFooter } from '../components/public/PublicProfileShared';

const links = [['Home', '#home'], ['About', '#about'], ['Services', '#services'], ['Events', '#events'], ['Gallery', '#gallery'], ['Videos', '#videos'], ['Contact', '#contact'], ['Reviews', '#reviews']];
const eventDefaults = ['Wedding', 'Birthday', 'Engagement', 'Corporate Events', 'Housewarming', 'Anniversary', 'Party', 'Other Events'];
const serviceDefaults = ['Buffet', 'Per Plate Catering', 'Live Counters', 'Traditional Catering', 'Corporate Catering', 'Outdoor Catering', 'Event Catering', 'Bulk Food Orders'];

export default function CateringProfilePage({ place }) {
  const profile = getProfileData(place);
  const events = profile.eventTypes?.length ? profile.eventTypes : eventDefaults;
  const services = profile.cateringServices?.length ? profile.cateringServices : serviceDefaults;
  const capacity = profile.guestCapacity || {};
  return <div className="min-h-screen bg-[#f4f5f0] text-[#202b26]">
    <FoodDiningProfileMasthead place={place} /><HeroSection place={place} profile={profile} eyebrow="Catering services" tagline={profile.tagline || 'Thoughtful food for meaningful gatherings.'} cta="Plan your event" ctaHref="#contact" />
    <ProfileNavigation links={links} />
    <AboutSection image={profile.gallery?.[1]}><div className="grid gap-4 sm:grid-cols-2"><div><span className="text-xs uppercase opacity-50">Experience</span><strong className="mt-1 block text-xl">{profile.experience || 'Experienced team'}</strong></div><div><span className="text-xs uppercase opacity-50">Service areas</span><strong className="mt-1 block text-xl">{profile.serviceArea || 'Local and regional'}</strong></div></div><p className="mt-6">{profile.about}</p></AboutSection>
    <section id="events" className="mx-auto max-w-7xl px-5 py-16 sm:px-8"><h2 className="font-display text-4xl font-semibold">Events we cater</h2><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{events.map((item) => <div key={item} className="rounded-lg border border-black/10 bg-white p-5 text-lg font-semibold">{item}</div>)}</div></section>
    <ServicesSection items={services} title="Catering services" />
    <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-2"><div className="rounded-xl bg-[#dce6d4] p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">Capacity</p><h2 className="mt-2 font-display text-3xl font-semibold">Ready for your gathering</h2><div className="mt-6 grid grid-cols-2 gap-4"><div><span className="text-sm opacity-60">Minimum guests</span><strong className="block text-3xl">{capacity.min || 'Flexible'}</strong></div><div><span className="text-sm opacity-60">Maximum guests</span><strong className="block text-3xl">{capacity.max || 'Flexible'}</strong></div></div></div><div className="rounded-xl border border-black/10 bg-white p-7"><p className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">Menu types</p><h2 className="mt-2 font-display text-3xl font-semibold">{profile.menuTypes || 'Veg, Non-Veg and Both'}</h2><p className="mt-4 text-sm leading-7 opacity-70">{profile.packageDetails || 'Ask us for a custom menu and event package.'}</p></div></section>
    <PhotoGallery place={place} profile={profile} title="Food & event gallery" />
    <VideoGallery videos={profile.videos} title="Event videos" />
    <ReviewsBlock place={place} />
    <ContactSection place={place} profile={profile} title="Plan your catering" />
    <BusinessFooter place={place} />
  </div>;
}
