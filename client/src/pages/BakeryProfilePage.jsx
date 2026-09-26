import React from 'react';
import { getProfileData, FoodDiningProfileMasthead, ProfileNavigation, HeroSection, AboutSection, ServicesSection, VideoGallery, PhotoGallery, ReviewsBlock, ContactSection, BusinessFooter } from '../components/public/PublicProfileShared';

const links = [['Home', '#home'], ['About', '#about'], ['Products', '#products'], ['Services', '#services'], ['Gallery', '#gallery'], ['Videos', '#videos'], ['Contact', '#contact'], ['Reviews', '#reviews']];
const productDefaults = ['Traditional Sweets', 'Cakes', 'Pastries', 'Bread', 'Cookies', 'Snacks', 'Desserts', 'Chocolates'];
const serviceDefaults = ['Custom Cakes', 'Birthday Cakes', 'Wedding Cakes', 'Bulk Orders', 'Gift Hampers', 'Online Orders', 'Home Delivery', 'Takeaway'];

export default function BakeryProfilePage({ place }) {
  const profile = getProfileData(place);
  const products = profile.products?.length ? profile.products : productDefaults;
  const services = profile.specialServices?.length ? profile.specialServices : serviceDefaults;
  return <div className="min-h-screen bg-[#fffaf5] text-[#3a2922]">
    <FoodDiningProfileMasthead place={place} /><HeroSection place={place} profile={profile} eyebrow={profile.shopType || 'Bakery & sweets'} tagline={profile.tagline || 'Made fresh for your sweetest moments.'} cta="See our products" ctaHref="#products" />
    <ProfileNavigation links={links} />
    <AboutSection image={profile.gallery?.[1]}><p>{profile.about}</p><div className="mt-5 flex flex-wrap gap-3"><span className="rounded-full bg-[#f1d4b8] px-4 py-2 text-sm font-semibold">Established {profile.establishedYear || 'recently'}</span><span className="rounded-full bg-[#f1d4b8] px-4 py-2 text-sm font-semibold">Freshly prepared</span></div></AboutSection>
    <section id="products" className="bg-[#f8eadb] px-5 py-16 sm:px-8"><div className="mx-auto max-w-7xl"><h2 className="font-display text-4xl font-semibold">Our products</h2><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{products.map((product, index) => { const value = typeof product === 'string' ? { name: product } : product; return <article key={`${value.name}-${index}`} className="overflow-hidden rounded-xl border border-[#e7cdb4] bg-white"><div className="aspect-[4/3]"><img src={value.image || profile.gallery?.[index]} alt={value.name} className="h-full w-full object-cover" /></div><div className="p-4"><h3 className="font-display text-xl font-semibold">{value.name}</h3>{value.description && <p className="mt-2 text-sm opacity-70">{value.description}</p>}{value.price && <p className="mt-3 text-sm font-bold">{value.price}</p>}</div></article>; })}</div></div></section>
    <ServicesSection items={services} title="Shop services" />
    <PhotoGallery place={place} profile={profile} title="Product & shop gallery" />
    <VideoGallery videos={profile.videos} title="Bakery videos" />
    <ReviewsBlock place={place} />
    <ContactSection place={place} profile={profile} title="Visit the shop" />
    <BusinessFooter place={place} />
  </div>;
}
