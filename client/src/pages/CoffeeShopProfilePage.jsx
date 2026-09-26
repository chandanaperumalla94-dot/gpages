import React from 'react';
import { getProfileData, FoodDiningProfileMasthead, ProfileNavigation, HeroSection, AboutSection, ServicesSection, VideoGallery, PhotoGallery, ReviewsBlock, ContactSection, BusinessFooter } from '../components/public/PublicProfileShared';

const links = [['Home', '#home'], ['About', '#about'], ['Menu', '#menu'], ['Services', '#services'], ['Gallery', '#gallery'], ['Videos', '#videos'], ['Contact', '#contact'], ['Reviews', '#reviews']];
const defaults = ['Espresso', 'Cappuccino', 'Latte', 'Cold Coffee', 'Tea', 'Milkshakes', 'Smoothies', 'Juices'];
const snackDefaults = ['Sandwiches', 'Pastries', 'Cookies', 'Cakes', 'Snacks'];
const facilityDefaults = ['Indoor Seating', 'Outdoor Seating', 'Free Wi-Fi', 'Charging Points', 'AC', 'Parking', 'Work-Friendly', 'Study-Friendly', 'Pet-Friendly'];

export default function CoffeeShopProfilePage({ place }) {
  const profile = getProfileData(place);
  const beverages = profile.beverageCategories?.length ? profile.beverageCategories : defaults;
  const snacks = profile.snacks?.length ? profile.snacks : snackDefaults;
  const facilities = profile.facilities?.length ? profile.facilities : facilityDefaults;
  const services = profile.services?.length ? profile.services : ['Dine In', 'Takeaway', 'Delivery', 'Online Ordering'];
  return <div className="min-h-screen bg-[#f7f2e9] text-[#2d2925]">
    <FoodDiningProfileMasthead place={place} /><HeroSection place={place} profile={profile} eyebrow="Coffee shop" tagline={profile.tagline || profile.coffeeType || 'Good coffee, slow moments.'} cta="Explore the menu" ctaHref="#menu" />
    <ProfileNavigation links={links} />
    <AboutSection image={profile.gallery?.[1]}><p>{profile.about}</p><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-lg bg-white p-4"><span className="text-xs uppercase opacity-50">Coffee type</span><strong className="mt-1 block">{profile.coffeeType || 'Craft coffee'}</strong></div><div className="rounded-lg bg-white p-4"><span className="text-xs uppercase opacity-50">Price range</span><strong className="mt-1 block">{profile.priceRange || 'Ask in store'}</strong></div></div></AboutSection>
    <section id="menu" className="mx-auto max-w-7xl px-5 py-16 sm:px-8"><h2 className="font-display text-4xl font-semibold">Coffee categories</h2><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{beverages.map((item) => <div key={item} className="rounded-lg border border-black/10 bg-white p-5 text-lg font-semibold">{item}</div>)}</div><h3 className="mt-14 font-display text-3xl font-semibold">Food & snacks</h3><div className="mt-6 flex flex-wrap gap-3">{snacks.map((item) => <span key={item} className="rounded-full bg-[#e5d4bc] px-4 py-2 text-sm font-semibold">{item}</span>)}</div></section>
    <ServicesSection items={services} />
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8"><h2 className="font-display text-4xl font-semibold">Facilities</h2><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{facilities.map((item) => <div key={item} className="rounded-lg border border-black/10 bg-white p-4 text-sm font-semibold">{item}</div>)}</div></section>
    <PhotoGallery place={place} profile={profile} title="Cafe gallery" />
    <VideoGallery videos={profile.videos} title="Cafe videos" />
    <ReviewsBlock place={place} />
    <ContactSection place={place} profile={profile} title="Visit the cafe" />
    <BusinessFooter place={place} />
  </div>;
}
