import React from 'react';
import { getProfileData, FoodDiningProfileMasthead, ProfileNavigation, HeroSection, AboutSection, ServicesSection, VideoGallery, PhotoGallery, ReviewsBlock, ContactSection, BusinessFooter } from '../components/public/PublicProfileShared';

const links = [['Home', '#home'], ['About', '#about'], ['Products', '#products'], ['Facilities', '#facilities'], ['Gallery', '#gallery'], ['Videos', '#videos'], ['Contact', '#contact'], ['Reviews', '#reviews']];
const productDefaults = ['Processed Foods', 'Packaged Foods', 'Spices', 'Pickles', 'Snacks', 'Frozen Foods', 'Ready-to-Eat', 'Beverages', 'Other'];
const operationDefaults = ['Manufacturing', 'Packaging', 'Wholesale', 'Distribution', 'Private Label', 'Bulk Orders'];
const facilityDefaults = ['Manufacturing Unit', 'Packaging Unit', 'Cold Storage', 'Warehouse', 'Quality Control', 'Distribution'];
const certificationDefaults = ['FSSAI', 'ISO', 'Other Certifications'];

export default function FoodProcessingProfilePage({ place }) {
  const profile = getProfileData(place);
  const products = profile.products?.length ? profile.products : productDefaults;
  const operations = profile.operations?.length ? profile.operations : operationDefaults;
  const facilities = profile.facilities?.length ? profile.facilities : facilityDefaults;
  const certifications = profile.certifications?.length ? profile.certifications : certificationDefaults;
  return <div className="min-h-screen bg-[#eef2f2] text-[#17282b]">
    <FoodDiningProfileMasthead place={place} /><HeroSection place={place} profile={profile} eyebrow={profile.industryType || 'Food processing company'} tagline={profile.tagline || 'Reliable food production from source to shelf.'} cta="Explore products" ctaHref="#products" />
    <ProfileNavigation links={links} />
    <AboutSection image={profile.gallery?.[1]}><p>{profile.about}</p><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-lg bg-white p-4"><span className="text-xs uppercase opacity-50">Industry</span><strong className="mt-1 block">{profile.industryType || 'Food processing'}</strong></div><div className="rounded-lg bg-white p-4"><span className="text-xs uppercase opacity-50">Established</span><strong className="mt-1 block">{profile.establishedYear || 'Established business'}</strong></div></div></AboutSection>
    <section id="products" className="bg-[#dfe9e9] px-5 py-16 sm:px-8"><div className="mx-auto max-w-7xl"><h2 className="font-display text-4xl font-semibold">Product categories</h2><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{products.map((item, index) => { const value = typeof item === 'string' ? { name: item } : item; return <article key={`${value.name}-${index}`} className="rounded-lg border border-[#c5d4d4] bg-white p-5"><div className="aspect-[4/2] overflow-hidden rounded bg-black/5">{value.image && <img src={value.image} alt={value.name} className="h-full w-full object-cover" />}</div><h3 className="mt-4 font-display text-xl font-semibold">{value.name}</h3>{value.category && <p className="mt-1 text-xs uppercase opacity-50">{value.category}</p>}{value.description && <p className="mt-2 text-sm opacity-70">{value.description}</p>}</article>; })}</div></div></section>
    <section id="facilities" className="mx-auto max-w-7xl px-5 py-16 sm:px-8"><h2 className="font-display text-4xl font-semibold">Business operations</h2><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{operations.map((item) => <div key={item} className="rounded-lg bg-white p-5 text-lg font-semibold shadow-sm">{item}</div>)}</div><h3 className="mt-14 font-display text-3xl font-semibold">Facilities</h3><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{facilities.map((item) => <div key={item} className="rounded-lg border border-black/10 p-4 text-sm font-semibold">{item}</div>)}</div><h3 className="mt-14 font-display text-3xl font-semibold">Certifications</h3><div className="mt-6 flex flex-wrap gap-3">{certifications.map((item) => <span key={item} className="rounded-full bg-[#cfe0df] px-4 py-2 text-sm font-semibold">{item}</span>)}</div></section>
    <PhotoGallery place={place} profile={profile} title="Product & factory gallery" />
    <VideoGallery videos={profile.videos} title="Factory and product videos" />
    <ReviewsBlock place={place} />
    <ContactSection place={place} profile={profile} title="Contact the company" />
    <BusinessFooter place={place} />
  </div>;
}
