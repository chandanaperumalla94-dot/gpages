import React from 'react';
import { getProfileData, FoodDiningProfileMasthead, ProfileNavigation, HeroSection, AboutSection, ServicesSection, VideoGallery, PhotoGallery, ReviewsBlock, ContactSection, BusinessFooter } from '../components/public/PublicProfileShared';

const links = [['Home', '#home'], ['About', '#about'], ['Services', '#services'], ['Gallery', '#gallery'], ['Videos', '#videos'], ['Contact', '#contact'], ['Reviews', '#reviews']];
const serviceDefaults = ['Dine In', 'Take Away', 'Home Delivery', 'Online Ordering', 'Party Hall', 'Birthday Parties', 'Catering', 'Table Reservation'];
const facilityDefaults = ['AC Dining', 'Parking', 'Wi-Fi', 'Family Dining', 'Outdoor Seating', 'Private Dining', 'Kids Area', 'Live Kitchen'];

export default function RestaurantProfilePage({ place }) {
  const profile = getProfileData(place);
  const services = profile.services?.length ? profile.services : serviceDefaults;
  const facilities = profile.facilities?.length ? profile.facilities : facilityDefaults;
  const reservation = profile.reservationUrl ? profile.reservationUrl : '';
  return <div className="min-h-screen bg-[#fffaf7] text-[#332622]">
    <FoodDiningProfileMasthead place={place} /><HeroSection place={place} profile={profile} eyebrow={profile.cuisineType || 'Restaurant'} tagline={profile.tagline || 'Authentic taste. Beautiful experience.'} cta="Explore menu" ctaHref="#services" />
    <ProfileNavigation links={links} action={reservation && <a href={reservation} target="_blank" rel="noreferrer" className="hidden rounded-lg bg-[#8d2926] px-4 py-2 text-xs font-bold text-white sm:inline-flex">Table reservation</a>} />
    <AboutSection image={profile.aboutImage || profile.gallery?.[1]}><p>{profile.about}</p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"><div><span className="text-xs uppercase opacity-50">Cuisine</span><strong className="mt-1 block">{profile.cuisineType || 'Multi cuisine'}</strong></div><div><span className="text-xs uppercase opacity-50">Price range</span><strong className="mt-1 block">{profile.priceRange || 'Ask in store'}</strong></div><div><span className="text-xs uppercase opacity-50">Food type</span><strong className="mt-1 block">{profile.foodType || 'Both'}</strong></div><div><span className="text-xs uppercase opacity-50">Established</span><strong className="mt-1 block">{profile.establishedYear || 'Recently'}</strong></div></div></AboutSection>
    <ServicesSection items={services} title="Restaurant services" />
    <VideoGallery videos={profile.videos} title="Video gallery" />
    <PhotoGallery place={place} profile={profile} title="Photo gallery" />
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8"><h2 className="font-display text-4xl font-semibold">Featured infrastructure</h2><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{facilities.map((item) => <div key={item} className="rounded-lg border border-[#eadbd2] bg-white p-4 text-sm font-semibold">{item}</div>)}</div></section>
    <ReviewsBlock place={place} />
    <ContactSection place={place} profile={profile} title="Contact the restaurant" />
    <BusinessFooter place={place} />
  </div>;
}
