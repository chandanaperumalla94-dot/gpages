import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import FavoriteButton from '../components/FavoriteButton';
import ReviewsSection from '../components/ReviewsSection';
import { resolveFoodBusinessType } from '../components/public/PublicProfileShared';

const DAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
const REPORT_REASONS = [
  ['incorrect_information', 'Incorrect information'],
  ['closed_business', 'Closed business'],
  ['duplicate_listing', 'Duplicate listing'],
  ['fake_listing', 'Fake listing'],
  ['inappropriate_content', 'Inappropriate content'],
  ['other', 'Other'],
];

function EnquiryForm({ placeId }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', message: '' });
  const [status, setStatus] = useState('idle');

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.post('/enquiries', { place: placeId, ...form });
      setStatus('sent');
      setForm({ ...form, message: '' });
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return <p className="rounded border border-moss/40 bg-moss/5 p-4 text-sm text-moss">Your enquiry has been sent. The business will contact you soon.</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded border border-line bg-white/50 p-4">
      <h3 className="font-display text-lg font-medium text-ink">Contact this business</h3>
      <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-ink/40" />
      <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-ink/40" />
      <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-ink/40" />
      <textarea required rows={3} placeholder="What would you like to ask?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="rounded border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-ink/40" />
      {status === 'error' && <p className="text-sm text-vermilion">Something went wrong. Please try again.</p>}
      <button type="submit" disabled={status === 'sending'} className="rounded bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-light disabled:opacity-60">
        {status === 'sending' ? 'Sending…' : 'Send enquiry'}
      </button>
    </form>
  );
}

function ReportModal({ placeId, onClose }) {
  const [reason, setReason] = useState(REPORT_REASONS[0][0]);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('idle');

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.post('/reports', { place: placeId, reason, description });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-sm rounded-md bg-paper p-5">
        {status === 'sent' ? (
          <>
            <p className="text-[15px] text-ink">Thanks — our team will review this listing.</p>
            <button onClick={onClose} className="mt-4 rounded border border-line px-4 py-2 text-sm">Close</button>
          </>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <h3 className="font-display text-lg font-medium text-ink">Report this listing</h3>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="rounded border border-line bg-white px-3 py-2 text-[14px]">
              {REPORT_REASONS.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <textarea rows={3} placeholder="Add details (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded border border-line bg-white px-3 py-2 text-[14px]" />
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 rounded border border-line px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={status === 'sending'} className="flex-1 rounded bg-vermilion px-4 py-2 text-sm font-medium text-paper disabled:opacity-60">
                {status === 'sending' ? 'Submitting…' : 'Submit report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SchoolActionButtons({ place, onShare, onReport, onDelete }) {
  const website = place.website && (place.website.startsWith('http') ? place.website : `https://${place.website}`);

  return (
    <div className="flex flex-wrap gap-2">
      <div className="[&>button]:border-white/60 [&>button]:text-white [&>button]:hover:border-white [&>button]:hover:bg-white/15">
        <FavoriteButton placeId={place._id} />
      </div>
      <button type="button" onClick={onShare} className="rounded border border-white/60 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm hover:border-white hover:bg-white/15">
        ↗ Share
      </button>
      <button type="button" onClick={onReport} className="rounded border border-white/60 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm hover:border-white hover:bg-white/15">
        ⚑ Report
      </button>
      {website && (
        <a href={website} target="_blank" rel="noopener noreferrer" className="rounded border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-800 hover:bg-cyan-100">
          Visit website
        </a>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete} className="rounded border border-vermilion px-4 py-2 text-sm font-medium text-vermilion hover:bg-vermilion/10">
          Delete listing
        </button>
      )}
    </div>
  );
}

function ContactLink({ href, icon, label, children }) {
  return (
    <a href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined} className="flex min-w-0 items-center gap-2 rounded border border-line bg-white px-3 py-2 text-sm text-ink/70 transition hover:border-cyan-300 hover:text-ink">
      <span className="text-lg" aria-hidden="true">{icon}</span>
      <span className="truncate">{children || label}</span>
    </a>
  );
}

function HomeAppliancesDetailLayout({ place, mapsUrl, socialLinks, onShare, onReport }) {
  const heroImage = place.coverImage || place.images?.[0] || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1200&q=80';
  const categoryCards = [
    { name: 'Refrigerators', image: 'https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?auto=format&fit=crop&w=900&q=80' },
    { name: 'Washing Machines', image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaa1b2?auto=format&fit=crop&w=900&q=80' },
    { name: 'Air Conditioners', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80' },
    { name: 'LED TVs', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80' },
    { name: 'Microwave Ovens', image: 'https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?auto=format&fit=crop&w=900&q=80' },
    { name: 'Kitchen Appliances', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80' },
    { name: 'Small Appliances', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80' },
    { name: 'Home Audio', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80' },
  ];

  const featuredProducts = [
    { name: 'Refrigerator', price: '₹ 28,990', image: 'https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?auto=format&fit=crop&w=900&q=80' },
    { name: 'Washing Machine', price: '₹ 32,490', image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaa1b2?auto=format&fit=crop&w=900&q=80' },
    { name: 'LED TV', price: '₹ 49,990', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80' },
    { name: 'Microwave Oven', price: '₹ 9,990', image: 'https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?auto=format&fit=crop&w=900&q=80' },
    { name: 'Air Conditioner', price: '₹ 38,990', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80' },
  ];

  const brandLogos = ['SAMSUNG', 'LG', 'Whirlpool', 'Haier', 'IFB', 'BOSCH', 'Panasonic', 'HITACHI'];
  const facilityCards = [
    { title: 'Wide Range', icon: '🧰' },
    { title: 'Expert Guidance', icon: '💡' },
    { title: 'Easy EMI', icon: '💳' },
    { title: 'Installation', icon: '🛠️' },
    { title: 'Warranty Support', icon: '🛡️' },
    { title: 'Special Offers', icon: '🎁' },
  ];

  const websiteUrl = place.website && (place.website.startsWith('http') ? place.website : `https://${place.website}`);
  const phoneHref = place.phone ? `tel:${place.phone}` : '#';
  const whatsappUrl = socialLinks.whatsapp
    ? (socialLinks.whatsapp.startsWith('http') ? socialLinks.whatsapp : `https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`)
    : `https://wa.me/${place.phone?.replace(/\D/g, '') || '919999999999'}`;

  return (
    <div className="container-page py-5">
      <header className="rounded-t-[18px] border border-line bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-[#1d4ed8] to-[#0ea5e9] text-sm font-bold text-white">{place.name.charAt(0).toUpperCase()}</div>
            <div className="font-display text-xl font-semibold text-ink">{place.name}</div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-ink/70 md:flex">
            {['Home', 'About Us', 'Gallery', 'Products', 'Services', 'Videos', 'Contact Us'].map((item) => (
              <a key={item} href="#" className="hover:text-ink">{item}</a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <div className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm text-ink/60">
              <span>⌕</span>
              <span>Search for Home Appliances...</span>
            </div>
            <button className="ml-2 rounded-full bg-blue-600 px-3 py-2 text-sm font-medium text-white">Call Now</button>
          </div>
        </div>
      </header>

      <main className="rounded-b-[18px] border-x border-b border-line bg-[#f3f5f7] p-4 sm:p-6">
        <section className="grid gap-5 overflow-hidden rounded-[20px] bg-[#eff7fb] p-4 shadow-sm md:grid-cols-[0.95fr_1.05fr] md:p-6">
          <div className="flex flex-col justify-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2b6cb0]">Home appliances</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">Modern Living Starts at Home</h1>
            <p className="mt-4 text-base text-ink/60">Top brands • Best prices • Trusted quality</p>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/55">
              Upgrade your home with the latest home appliances for a smarter, easier, and more comfortable lifestyle.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={onShare} className="rounded-md bg-[#1d4ed8] px-5 py-2.5 text-sm font-medium text-white">Explore Products</button>
              <a href={phoneHref} className="rounded-md border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink/70">Book Appointment</a>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                ['Free Delivery', 'On Select Products'],
                ['Brand Warranty', '100% Genuine Products'],
                ['Expert Support', 'Before & After Purchase'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-xl border border-line bg-white p-3 shadow-sm">
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="mt-1 text-[11px] text-ink/55">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-[20px] bg-white">
            <img src={heroImage} alt={place.name} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute right-4 top-4 rounded-full bg-[#0ea5e9] px-3 py-2 text-xs font-semibold text-white shadow-lg">Smart Homes • Happy Lives</div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl font-semibold text-ink">Shop by Category</h2>
            <a href="#" className="text-sm text-ink/60 hover:text-ink">View All Categories →</a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoryCards.map((item, index) => (
              <div key={item.name} className="overflow-hidden rounded-[18px] border border-line bg-white shadow-sm">
                <img src={item.image} alt={item.name} className="h-32 w-full object-cover" />
                <div className="p-4 text-center">
                  <p className="text-lg font-semibold text-ink">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl font-semibold text-ink">Featured Products</h2>
            <a href="#" className="text-sm text-ink/60 hover:text-ink">View All Products →</a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {featuredProducts.map((product) => (
              <div key={product.name} className="overflow-hidden rounded-[18px] border border-line bg-white p-3 shadow-sm">
                <img src={product.image} alt={product.name} className="h-32 w-full rounded-lg object-cover" />
                <div className="mt-3">
                  <p className="text-base font-semibold text-ink">{product.name}</p>
                  <p className="mt-1 text-sm text-ink/50">{product.price}</p>
                  <button className="mt-3 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[20px] border border-line bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-3xl font-semibold text-ink">Watch Our Video</h2>
            </div>
            <div className="overflow-hidden rounded-[16px] border border-line bg-[#edf6fb]">
              <iframe
                src="https://www.youtube.com/embed/7w3a7VjTEYQ"
                title={`${place.name} video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-[280px] w-full"
              />
            </div>
          </div>

          <div className="rounded-[20px] border border-line bg-white p-5 shadow-sm">
            <h2 className="font-display text-3xl font-semibold text-ink">Our Facilities</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {facilityCards.map((item) => (
                <div key={item.title} className="rounded-[14px] border border-line bg-[#f4f8fc] p-4 text-center">
                  <div className="text-2xl">{item.icon}</div>
                  <p className="mt-2 text-sm font-semibold text-ink">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[20px] border border-line bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl font-semibold text-ink">Top Brands We Deal With</h2>
            <a href="#" className="text-sm text-ink/60 hover:text-ink">View All Reviews →</a>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {brandLogos.map((brand) => (
              <div key={brand} className="flex h-16 items-center justify-center rounded-lg border border-line bg-[#f7fbff] text-sm font-bold text-ink/70">{brand}</div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[20px] border border-line bg-white p-5 shadow-sm">
            <h2 className="font-display text-3xl font-semibold text-ink">About Us</h2>
            <p className="mt-4 text-base leading-relaxed text-ink/60">
              G-PAGES brings you the best home appliances from top brands at competitive prices. We are committed to providing quality products, expert guidance, and seamless shopping experiences for every home.
            </p>
            <button className="mt-5 rounded-md bg-[#1d4ed8] px-5 py-2.5 text-sm font-medium text-white">Learn More About Us</button>
          </div>

          <div className="rounded-[20px] border border-line bg-white p-5 shadow-sm">
            <h2 className="font-display text-3xl font-semibold text-ink">What Our Customers Say</h2>
            <div className="mt-4 space-y-3">
              {[
                '“Excellent service and genuine products. Highly recommended.”',
                '“Reliable service and prompt delivery. Very happy with the purchase.”',
              ].map((quote) => (
                <div key={quote} className="rounded-[14px] border border-line bg-[#f7fbff] p-4 text-sm leading-relaxed text-ink/65">{quote}</div>
              ))}
            </div>
          </div>
        </section>

        <footer className="mt-10 rounded-[18px] bg-[#071d33] px-5 py-6 text-paper/80">
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <div className="font-display text-2xl font-semibold text-paper">{place.name}</div>
              <p className="mt-3 text-sm leading-relaxed text-paper/70">Your trusted destination for home appliances, smart living, and quality essentials.</p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-paper/55">Quick Links</p>
              <ul className="mt-3 space-y-2 text-sm text-paper/75">
                <li>Home</li>
                <li>About Us</li>
                <li>Gallery</li>
                <li>Products</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-paper/55">Contact Us</p>
              <ul className="mt-3 space-y-2 text-sm text-paper/75">
                <li>{place.phone || '+91 98765 43210'}</li>
                <li>{place.email || 'support@gpages.com'}</li>
                <li>{place.address || 'Shop No. 12, Main Road, Rajahmundry'}</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-paper/55">Subscribe</p>
              <div className="mt-3 flex">
                <input placeholder="Enter your email address" className="w-full rounded-l-md border border-r-0 border-paper/20 bg-white/5 px-3 py-2 text-sm text-paper placeholder:text-paper/35 outline-none" />
                <button className="rounded-r-md bg-blue-600 px-4 py-2 text-sm font-medium text-white">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-paper/10 pt-4 text-xs text-paper/40">© {new Date().getFullYear()} {place.name}. All rights reserved.</div>
        </footer>
      </main>
    </div>
  );
}

function MattressDetailLayout({ place, mapsUrl, socialLinks, onShare, onReport }) {
  const heroImage = place.coverImage || place.images?.[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80';
  const mattressTypes = [
    { name: 'Spring Mattresses', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
    { name: 'Memory Foam Mattresses', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
    { name: 'Latex Mattresses', image: 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=900&q=80' },
    { name: 'Orthopedic Mattresses', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
    { name: 'Hybrid Mattresses', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80' },
    { name: 'Kids Mattresses', image: 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=900&q=80' },
  ];

  const featuredProducts = [
    { name: 'Spring Comfort Mattress', price: '₹ 18,999', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
    { name: 'Memory Foam Mattress', price: '₹ 22,499', image: 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=900&q=80' },
    { name: 'Latex Mattress', price: '₹ 27,999', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
    { name: 'Orthopedic Mattress', price: '₹ 21,999', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80' },
    { name: 'Hybrid Mattress', price: '₹ 24,999', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
    { name: 'Kids Mattress', price: '₹ 12,999', image: 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=900&q=80' },
  ];

  const galleryImages = [
    heroImage,
    'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  ];

  const rating = 4.9;
  const websiteUrl = place.website && (place.website.startsWith('http') ? place.website : `https://${place.website}`);
  const whatsappUrl = socialLinks.whatsapp
    ? (socialLinks.whatsapp.startsWith('http') ? socialLinks.whatsapp : `https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`)
    : `https://wa.me/${place.phone?.replace(/\D/g, '') || '919999999999'}`;

  return (
    <div className="container-page py-5">
      <header className="border-b border-line bg-white shadow-sm">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1d4ed8] text-base font-bold text-white shadow-sm">D</div>
            <div>
              <div className="font-display text-2xl font-semibold text-ink">DreamRest</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">Better Sleep</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-ink/70 md:flex">
            {['Home', 'About Us', 'Mattresses', 'Collections', 'Reviews', 'Contact'].map((item) => (
              <a key={item} href="#" className="hover:text-ink">{item}</a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button className="rounded-full border border-line px-3 py-2 text-sm text-ink/70">Search</button>
            <button className="rounded-full bg-[#1d4ed8] px-4 py-2 text-sm font-medium text-white">Call Now</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] bg-[#f5f7fb] px-3 pb-6 pt-5 sm:px-5 lg:px-6">
        <section className="overflow-hidden rounded-[20px] bg-white shadow-sm">
          <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-center bg-[linear-gradient(135deg,#0d1b2a,#1e3a5f_50%,#3d5674)] p-6 text-white sm:p-8 lg:p-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#cfe8ff]">Better sleep | healthier life</p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">Premium Mattresses for a Dreamy Tomorrow</h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
                Experience unmatched comfort, support, and durability with our range of premium mattresses designed for every sleeper.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={onShare} className="rounded-md bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white">Explore Collection</button>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-md border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-medium text-white">Contact Us</a>
              </div>
            </div>

            <div className="relative min-h-[310px] bg-[#edf4ff] md:min-h-[420px]">
              <img src={heroImage} alt={`${place.name} mattress hero`} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute bottom-5 right-5 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-ink shadow-lg">★★★★★ {rating}</div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
          <div className="overflow-hidden rounded-[18px] border border-line bg-white shadow-sm">
            <img src={galleryImages[1]} alt={`${place.name} showroom`} className="h-full w-full object-cover" />
          </div>

          <div className="rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1d4ed8]">About us</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Your Comfort, Our Priority</h2>
            <p className="mt-3 text-base leading-relaxed text-ink/60">
              At DreamRest, we believe that a good night’s sleep is the foundation of a healthier lifestyle. Our premium mattresses are designed to deliver the right balance of softness, support, and durability for every body type and sleeping style.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Premium Quality', 'Mattresses'],
                ['10+ Years', 'Experience'],
                ['Trusted', 'Brands'],
                ['Expert', 'Consultation'],
              ].map(([heading, value]) => (
                <div key={heading} className="rounded-xl border border-line bg-[#f4f8ff] p-3">
                  <p className="font-display text-2xl font-semibold text-[#1d4ed8]">{heading}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-ink/55">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a href={websiteUrl || whatsappUrl} target="_blank" rel="noreferrer" className="rounded-md bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white">Read More</a>
              <button onClick={onReport} className="rounded-md border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink/70">Get Quote</button>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1d4ed8]">Mattress types</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Shop by Mattress Type</h2>
            </div>
            <button className="text-sm text-ink/60 hover:text-ink">View All Collections →</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mattressTypes.map((item) => (
              <div key={item.name} className="overflow-hidden rounded-[18px] border border-line bg-[#f5f8ff] shadow-sm">
                <img src={item.image} alt={item.name} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <p className="text-base font-semibold text-ink">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1d4ed8]">Featured products</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Featured Mattresses</h2>
            </div>
            <button className="text-sm text-ink/60 hover:text-ink">View All Products →</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map((product) => (
              <div key={product.name} className="overflow-hidden rounded-[18px] border border-line bg-[#f9fbff] shadow-sm">
                <img src={product.image} alt={product.name} className="h-52 w-full object-cover" />
                <div className="p-4">
                  <p className="text-lg font-semibold text-ink">{product.name}</p>
                  <p className="mt-1 text-sm text-[#1d4ed8]">{product.price}</p>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded-md border border-[#b9d0ff] bg-white px-3 py-2 text-xs font-medium text-ink/75">View Details</button>
                    <button className="rounded-md bg-[#2563eb] px-3 py-2 text-xs font-medium text-white">Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1d4ed8]">Why choose us</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Why Choose DreamRest?</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['Premium Quality', 'Durable materials and expert craftsmanship'],
              ['Affordable Pricing', 'Comfortable sleep without overspending'],
              ['Free Delivery', 'Fast delivery across your city'],
              ['10 Years Warranty', 'Reliable support when you need it'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-[14px] border border-line bg-[#f4f8ff] p-4 text-center">
                <p className="text-base font-semibold text-ink">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1d4ed8]">Special offers</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Up to 40% Off</h2>
            <p className="mt-3 text-base text-ink/60">Upgrade your sleep with seasonal discounts and special bundles on premium mattresses.</p>
            <button className="mt-5 rounded-md bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white">Shop Now</button>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-line bg-white shadow-sm">
            <img src={galleryImages[3]} alt={`${place.name} offer`} className="h-full w-full object-cover" />
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1d4ed8]">Gallery</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Our Gallery</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {galleryImages.map((image, index) => (
                <img key={`${image}-${index}`} src={image} alt={`${place.name} gallery ${index + 1}`} className="h-32 w-full rounded-[12px] object-cover" />
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1d4ed8]">Customer reviews</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink">What Our Customers Say</h2>
            <div className="mt-5 space-y-3 text-sm leading-relaxed text-ink/65">
              <div className="rounded-[12px] border border-line bg-[#f4f8ff] p-4">“Excellent service and very comfortable mattresses. Highly recommended.”</div>
              <div className="rounded-[12px] border border-line bg-[#f4f8ff] p-4">“Great quality, prompt delivery, and very helpful staff. We are happy with our purchase.”</div>
            </div>
          </div>
        </section>

        <footer className="mt-8 rounded-[18px] bg-[#071d33] px-5 py-6 text-paper/80">
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <div className="font-display text-2xl font-semibold text-paper">DreamRest</div>
              <p className="mt-3 text-sm leading-relaxed text-paper/70">Better Sleep, Healthier Life.</p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-paper/55">Quick Links</p>
              <ul className="mt-3 space-y-2 text-sm text-paper/75">
                <li>Home</li>
                <li>About Us</li>
                <li>Mattresses</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-paper/55">Contact</p>
              <ul className="mt-3 space-y-2 text-sm text-paper/75">
                <li>{place.phone || '+91 98765 43210'}</li>
                <li>{place.email || 'support@dreamrest.com'}</li>
                <li>{place.address || 'Main Road, Rajahmundry'}</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-paper/55">Subscribe</p>
              <div className="mt-3 flex">
                <input placeholder="Your email" className="w-full rounded-l-md border border-r-0 border-paper/20 bg-white/5 px-3 py-2 text-sm text-paper placeholder:text-paper/35 outline-none" />
                <button className="rounded-r-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white">Join</button>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-paper/10 pt-4 text-xs text-paper/40">© {new Date().getFullYear()} DreamRest. All rights reserved.</div>
        </footer>
      </main>
    </div>
  );
}

function NurseryDetailLayout({ place, mapsUrl, socialLinks, onShare, onReport }) {
  const heroImage = place.coverImage || place.images?.[0] || 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1400&q=80';
  const categoryCards = [
    { name: 'Indoor Plants', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80' },
    { name: 'Outdoor Plants', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80' },
    { name: 'Flowering Plants', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80' },
    { name: 'Fruit Plants', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80' },
    { name: 'Herbs & Medicinal Plants', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80' },
    { name: 'Succulents & Cactus', image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80' },
    { name: 'Garden Accessories', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80' },
    { name: 'Seeds & Soil', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80' },
  ];

  const featuredPlants = [
    { name: 'Peace Lily', price: '₹ 399', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80' },
    { name: 'Money Plant', price: '₹ 249', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80' },
    { name: 'Rose Plant', price: '₹ 349', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80' },
    { name: 'Tulsi Plant', price: '₹ 199', image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80' },
    { name: 'Areca Palm', price: '₹ 599', image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80' },
    { name: 'Cactus Mix', price: '₹ 299', image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80' },
  ];

  const galleryImages = [
    heroImage,
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
  ];

  const services = [
    'Plant Sale',
    'Landscaping',
    'Garden Design',
    'Plant Care',
    'Bulk Orders',
    'Home Delivery',
  ];

  const websiteUrl = place.website && (place.website.startsWith('http') ? place.website : `https://${place.website}`);
  const whatsappUrl = socialLinks.whatsapp
    ? (socialLinks.whatsapp.startsWith('http') ? socialLinks.whatsapp : `https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`)
    : `https://wa.me/${place.phone?.replace(/\D/g, '') || '919999999999'}`;

  return (
    <div className="container-page py-5">
      <header className="border-b border-line bg-white/95 shadow-sm">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2f8f4a] text-lg font-bold text-white">🌿</div>
            <div>
              <div className="font-display text-2xl font-semibold text-ink">GreenSprout</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/50">Nursery & Garden Center</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-ink/70 md:flex">
            {['Home', 'About Us', 'Plants', 'Indoor Plants', 'Outdoor Plants', 'Gallery', 'Services', 'Contact'].map((item) => (
              <a key={item} href="#" className="hover:text-ink">{item}</a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button className="rounded-full border border-line px-3 py-2 text-sm text-ink/70">Search</button>
            <button className="rounded-full bg-[#2f8f4a] px-4 py-2 text-sm font-medium text-white">Call Now</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] bg-[#f5f8f2] px-3 pb-6 pt-5 sm:px-5 lg:px-6">
        <section className="overflow-hidden rounded-[20px] bg-[#edf5ec] shadow-sm">
          <div className="grid md:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-center bg-[linear-gradient(135deg,#edf7eb,#dfeee1)] p-6 text-ink sm:p-8 lg:p-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2f8f4a]">Healthy Plants | Greener Tomorrow</p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">Bring Nature Home with Our Premium Plants</h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-ink/60">
                Wide range of indoor & outdoor plants, garden essentials, and sustainable greenery for your home and workspace.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={onShare} className="rounded-md bg-[#2f8f4a] px-5 py-2.5 text-sm font-medium text-white">Explore Our Collection</button>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-md border border-[#2f8f4a]/30 bg-white px-5 py-2.5 text-sm font-medium text-ink">Contact Us</a>
              </div>
            </div>

            <div className="relative min-h-[300px] bg-[#ecf7ee] md:min-h-[420px]">
              <img src={heroImage} alt={`${place.name} nursery hero`} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute bottom-5 right-5 rounded-[14px] border border-white/40 bg-white/80 px-4 py-3 text-center shadow-lg backdrop-blur-sm">
                <div className="font-display text-2xl font-semibold text-[#2f8f4a]">Plants</div>
                <div className="mt-1 text-sm font-medium text-ink">Make Life Better</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
          <div className="overflow-hidden rounded-[18px] border border-line bg-white shadow-sm">
            <img src={galleryImages[1]} alt={`${place.name} nursery shop`} className="h-full w-full object-cover" />
          </div>

          <div className="rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2f8f4a]">About us</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Welcome to GreenSprout Nursery</h2>
            <p className="mt-3 text-base leading-relaxed text-ink/60">
              We bring you nature’s beauty with a wide variety of healthy plants, flowers, vegetables, and gardening essentials. Whether you are a home gardener, landscaper, or plant enthusiast, we have something for every green space.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Premium Quality', 'Plants'],
                ['Expert Guidance', 'Advice'],
                ['Wide Variety', 'Selection'],
                ['Affordable', 'Prices'],
              ].map(([heading, value]) => (
                <div key={heading} className="rounded-xl border border-line bg-[#f4fbf4] p-3">
                  <p className="font-display text-xl font-semibold text-[#2f8f4a]">{heading}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-ink/55">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a href={websiteUrl || whatsappUrl} target="_blank" rel="noreferrer" className="rounded-md bg-[#2f8f4a] px-5 py-2.5 text-sm font-medium text-white">Read More</a>
              <button onClick={onReport} className="rounded-md border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink/70">Get Quote</button>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2f8f4a]">Categories</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Shop by Plant Category</h2>
            </div>
            <button className="text-sm text-ink/60 hover:text-ink">View All Categories →</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categoryCards.map((item) => (
              <div key={item.name} className="overflow-hidden rounded-[18px] border border-line bg-[#f7faf7] shadow-sm">
                <img src={item.image} alt={item.name} className="h-36 w-full object-cover" />
                <div className="p-4">
                  <p className="text-base font-semibold text-ink">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2f8f4a]">Featured products</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Featured Products</h2>
            </div>
            <button className="text-sm text-ink/60 hover:text-ink">View All Products →</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featuredPlants.map((product) => (
              <div key={product.name} className="overflow-hidden rounded-[18px] border border-line bg-[#f7faf7] shadow-sm">
                <img src={product.image} alt={product.name} className="h-52 w-full object-cover" />
                <div className="p-4">
                  <p className="text-lg font-semibold text-ink">{product.name}</p>
                  <p className="mt-1 text-sm text-[#2f8f4a]">{product.price}</p>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded-md border border-[#bfe3c5] bg-white px-3 py-2 text-xs font-medium text-ink/75">Add to Cart</button>
                    <button className="rounded-md bg-[#2f8f4a] px-3 py-2 text-xs font-medium text-white">Buy Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2f8f4a]">Why choose us</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Why Choose Us?</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['Healthy & Fresh Plants', 'Expert guidance and healthy plant care'],
              ['Expert Guidance & Support', 'Personalized recommendations for every space'],
              ['Safe & Secure Packaging', 'Plants delivered in excellent condition'],
              ['Home Delivery', 'Available across the city'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-[14px] border border-line bg-[#f4fbf4] p-4 text-center">
                <p className="text-base font-semibold text-ink">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2f8f4a]">Our gallery</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Our Gallery</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {galleryImages.map((image, index) => (
                <img key={`${image}-${index}`} src={image} alt={`${place.name} gallery ${index + 1}`} className="h-32 w-full rounded-[12px] object-cover" />
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-line bg-white shadow-sm">
            <img src={galleryImages[2]} alt={`${place.name} garden`} className="h-full w-full object-cover" />
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2f8f4a]">Our services</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Our Services</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <div key={service} className="rounded-[12px] border border-line bg-[#f4fbf4] px-3 py-4 text-sm font-medium text-ink/75">{service}</div>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2f8f4a]">Customer reviews</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink">What Our Customers Say</h2>
            <div className="mt-5 space-y-3 text-sm leading-relaxed text-ink/65">
              <div className="rounded-[12px] border border-line bg-[#f4fbf4] p-4">“Excellent quality plants and very helpful guidance. I got the perfect plants for my home.”</div>
              <div className="rounded-[12px] border border-line bg-[#f4fbf4] p-4">“Beautiful, healthy plants and timely delivery. Great service and friendly support.”</div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2f8f4a]">Get in touch</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Visit Our Nursery</h2>
            <div className="mt-4 space-y-3 text-sm text-ink/75">
              {place.address && <p className="rounded-[12px] border border-line bg-[#f4fbf4] px-3 py-3">📍 {place.address}</p>}
              {place.phone && <a href={`tel:${place.phone}`} className="block rounded-[12px] border border-line bg-[#f4fbf4] px-3 py-3 hover:text-ink">📞 {place.phone}</a>}
              {websiteUrl && <a href={websiteUrl} target="_blank" rel="noreferrer" className="block rounded-[12px] border border-line bg-[#f4fbf4] px-3 py-3 text-[#2f8f4a] hover:underline">🌐 Visit website</a>}
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="block rounded-[12px] border border-line bg-[#f4fbf4] px-3 py-3 text-[#2f8f4a] hover:underline">📍 Get directions</a>
            </div>
          </div>

          <div className="overflow-hidden rounded-[18px] border border-line bg-white shadow-sm">
            <iframe
              title={`${place.name} map`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(place.address || place.name)}&output=embed`}
              className="h-full min-h-[270px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function FurnitureDetailLayout({ place, mapsUrl, socialLinks, onShare, onReport }) {
  const heroImage = place.coverImage || place.images?.[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80';
  const furnitureCollections = [
    { name: 'Living Room', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
    { name: 'Bedroom', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
    { name: 'Dining Room', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80' },
    { name: 'Office Furniture', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80' },
    { name: 'Wardrobes', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
    { name: 'Study Tables', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80' },
    { name: 'TV Units', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
    { name: 'Custom Furniture', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80' },
  ];

  const featuredProducts = [
    { name: 'Modern L-Shape Sofa', price: '₹ 45,999', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80' },
    { name: 'King Size Bed', price: '₹ 32,999', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
    { name: 'Dining Table Set', price: '₹ 29,999', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80' },
    { name: 'Office Work Desk', price: '₹ 18,999', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80' },
  ];

  const galleryImages = [
    heroImage,
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
  ];

  const websiteUrl = place.website && (place.website.startsWith('http') ? place.website : `https://${place.website}`);
  const whatsappUrl = socialLinks.whatsapp
    ? (socialLinks.whatsapp.startsWith('http') ? socialLinks.whatsapp : `https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`)
    : `https://wa.me/${place.phone?.replace(/\D/g, '') || '919999999999'}`;

  return (
    <div className="container-page py-5">
      <header className="border-b border-line bg-white/95 shadow-sm">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-[#a86d2f] text-sm font-bold text-white shadow-sm">{place.name.charAt(0).toUpperCase()}</div>
            <div>
              <div className="font-display text-xl font-semibold text-ink sm:text-2xl">{place.name}</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-ink/70 md:flex">
            {['Home', 'About us', 'Furniture', 'Collections', 'Gallery', 'Contact'].map((item) => (
              <a key={item} href="#" className="hover:text-ink">{item}</a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <button className="rounded-full border border-line px-4 py-2 text-sm text-ink/70">Search</button>
            <button className="rounded-full bg-[#a86d2f] px-4 py-2 text-sm font-medium text-white">Call Now</button>
          </div>
        </div>
      </header>

      <main className="bg-[#f5efe8] px-3 pb-6 pt-5 sm:px-5 lg:px-6">
        <section className="overflow-hidden rounded-[24px] bg-[#1a180f] shadow-[0_12px_35px_rgba(20,16,8,0.12)]">
          <div className="grid md:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-center bg-[linear-gradient(135deg,rgba(22,18,12,0.88),rgba(61,38,20,0.72))] p-6 text-white sm:p-8 lg:p-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e6c9a2]">Premium furniture store</p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-6xl">Transform Your Space</h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
                Modern furniture for modern living. Quality, comfort, and elegance crafted for your home and office.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button onClick={onShare} className="rounded-md bg-[#c38b4d] px-5 py-3 text-sm font-medium text-white">Explore Collection</button>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-md border border-white/25 bg-white/5 px-5 py-3 text-sm font-medium text-white">Contact Us</a>
              </div>
            </div>

            <div className="relative min-h-[300px] md:min-h-[420px]">
              <img src={heroImage} alt={`${place.name} hero`} className="h-full w-full object-cover" />
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
          <div className="overflow-hidden rounded-[18px] border border-line bg-white shadow-sm">
            <img src={galleryImages[1]} alt={place.name} className="h-full w-full object-cover" />
          </div>

          <div className="rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9f6d2f]">About us</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Your Trusted Furniture Partner</h2>
            <p className="mt-3 text-base leading-relaxed text-ink/60">
              We create comfortable and stylish spaces with premium furniture that balances beauty, comfort, and lasting quality.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['15+', 'Years Experience'],
                ['Premium', 'Materials'],
                ['Custom', 'Furniture'],
                ['Warranty', 'Support'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-line bg-[#f8f4ef] p-3">
                  <p className="font-display text-2xl font-semibold text-[#a86d2f]">{value}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-ink/55">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a href={websiteUrl || whatsappUrl} target="_blank" rel="noreferrer" className="rounded-md bg-[#a86d2f] px-5 py-2.5 text-sm font-medium text-white">Read More</a>
              <button onClick={() => onReport()} className="rounded-md border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink/70">Get Quote</button>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9f6d2f]">Collections</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Our Furniture Collections</h2>
            </div>
            <button className="text-sm text-ink/60 hover:text-ink">View All Collections →</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {furnitureCollections.map((item) => (
              <div key={item.name} className="overflow-hidden rounded-[18px] border border-line bg-[#f7f2ea] shadow-sm">
                <img src={item.image} alt={item.name} className="h-36 w-full object-cover" />
                <div className="p-4">
                  <p className="text-base font-semibold text-ink">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9f6d2f]">Featured products</p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Featured Products</h2>
            </div>
            <button className="text-sm text-ink/60 hover:text-ink">View All Products →</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <div key={product.name} className="overflow-hidden rounded-[18px] border border-line bg-[#faf5f0] shadow-sm">
                <img src={product.image} alt={product.name} className="h-52 w-full object-cover" />
                <div className="p-4">
                  <p className="text-lg font-semibold text-ink">{product.name}</p>
                  <p className="mt-1 text-sm text-[#a86d2f]">{product.price}</p>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded-md border border-[#d7b48b] bg-white px-3 py-2 text-xs font-medium text-ink/75">View Details</button>
                    <button className="rounded-md bg-[#a86d2f] px-3 py-2 text-xs font-medium text-white">Enquire Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9f6d2f]">Gallery</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Our Gallery</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {galleryImages.map((image, index) => (
                <img key={`${image}-${index}`} src={image} alt={`${place.name} gallery ${index + 1}`} className="h-36 w-full rounded-[14px] object-cover" />
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9f6d2f]">Why choose us</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Why Choose Us</h2>
            <div className="mt-5 space-y-3">
              {[
                'Premium quality materials',
                'Custom design solutions',
                'Affordable pricing',
                'Expert craftsmanship',
              ].map((item) => (
                <div key={item} className="rounded-xl border border-line bg-[#f8f4ef] px-3 py-3 text-sm font-medium text-ink/75">{item}</div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9f6d2f]">Directions</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Visit Our Store</h2>
            <div className="mt-4 space-y-3 text-sm text-ink/75">
              {place.address && <p className="rounded-[12px] border border-line bg-[#faf5f0] px-3 py-3">📍 {place.address}</p>}
              {place.phone && <a href={`tel:${place.phone}`} className="block rounded-[12px] border border-line bg-[#faf5f0] px-3 py-3 hover:text-ink">📞 {place.phone}</a>}
              {websiteUrl && <a href={websiteUrl} target="_blank" rel="noreferrer" className="block rounded-[12px] border border-line bg-[#faf5f0] px-3 py-3 text-[#a86d2f] hover:underline">🌐 Visit website</a>}
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="block rounded-[12px] border border-line bg-[#faf5f0] px-3 py-3 text-[#a86d2f] hover:underline">📍 Get directions</a>
            </div>
          </div>

          <div className="rounded-[18px] border border-line bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9f6d2f]">Contact</p>
            <h2 className="mt-1 font-display text-3xl font-semibold text-ink">Get In Touch</h2>
            <div className="mt-4 flex flex-col gap-3">
              <input placeholder="Your name" className="rounded-[12px] border border-line bg-[#faf5f0] px-3 py-3 text-sm outline-none focus:border-[#d1a06d]" />
              <input placeholder="Email" className="rounded-[12px] border border-line bg-[#faf5f0] px-3 py-3 text-sm outline-none focus:border-[#d1a06d]" />
              <textarea rows={4} placeholder="Your requirements" className="rounded-[12px] border border-line bg-[#faf5f0] px-3 py-3 text-sm outline-none focus:border-[#d1a06d]" />
            </div>
            <button className="mt-4 w-full rounded-[12px] bg-[#a86d2f] px-4 py-3 text-base font-semibold text-white">Send enquiry</button>
          </div>
        </section>
      </main>
    </div>
  );
}

function SchoolDetailLayout({ place, mapsUrl, socialLinks, academics, onShare, onReport, onDelete }) {
  const website = place.website && (place.website.startsWith('http') ? place.website : `https://${place.website}`);
  const cover = place.coverImage || place.images?.[0];
  const highlights = place.attributes?.highlights || place.attributes?.keyHighlights || place.services || [];
  const admissions = academics.admission || academics.admissions || academics.admissionProcess || academics.eligibility;
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(place.address)}&output=embed`;
  const whatsappUrl = socialLinks.whatsapp
    ? (socialLinks.whatsapp.startsWith('http') ? socialLinks.whatsapp : `https://wa.me/${socialLinks.whatsapp.replace(/\D/g, '')}`)
    : null;

  return (
    <div className="container-page py-8 sm:py-10">
      <section className="overflow-hidden rounded-[1.5rem] border border-[#b8e7e5] bg-white shadow-[0_18px_55px_rgba(16,42,67,0.12)]">
        <div className="relative h-[330px] overflow-hidden bg-[#082f49] sm:h-[430px]">
          {cover ? <img src={cover} alt={`${place.name} cover`} className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-[linear-gradient(135deg,#073b4c,#0b7285_55%,#14b8a6)]" />}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,31,49,.08)_10%,rgba(4,31,49,.32)_44%,rgba(4,31,49,.96)_100%)]" />
          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm sm:left-8 sm:top-8">
            <span className="h-2 w-2 rounded-full bg-cyan-300" /> {place.category?.name || 'School'}
          </div>
          <div className="absolute bottom-0 left-0 right-0 grid gap-5 p-5 text-white sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="flex flex-wrap items-center gap-2 font-display text-3xl font-semibold leading-tight sm:text-5xl">
                {place.name}
                {place.verified && <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-[#063047]">✓ Verified</span>}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/85">
                <span className="text-amber-300" aria-label={`${place.rating?.average || 0} out of 5 stars`}>{'★'.repeat(Math.round(place.rating?.average || 0))}{'☆'.repeat(5 - Math.round(place.rating?.average || 0))}</span>
                <span className="font-semibold text-white">{place.rating?.average || 0}</span>
                <span>({place.rating?.count || 0} reviews)</span>
              </div>
              <p className="mt-3 flex max-w-2xl items-start gap-2 text-sm leading-relaxed text-white/80"><span aria-hidden="true">⌖</span>{place.address}</p>
            </div>
            <SchoolActionButtons place={place} onShare={onShare} onReport={onReport} onDelete={onDelete} />
          </div>
        </div>
        <div className="grid divide-y divide-line bg-[#f5fbfb] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[[place.rating?.count || 0, 'Parent reviews'], [place.facilities?.length || 0, 'Listed facilities'], [place.images?.length || 0, 'School photos']].map(([value, label]) => (
            <div key={label} className="flex items-center gap-3 px-5 py-4 sm:justify-center sm:px-3">
              <span className="font-display text-2xl font-semibold text-[#087f8c]">{value}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/50">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <nav aria-label="School detail sections" className="sticky top-0 z-20 -mx-5 mt-5 overflow-x-auto border-y border-line bg-paper/95 px-5 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-full sm:border sm:px-4">
        <div className="flex min-w-max gap-2 text-sm font-semibold text-ink/60">
          {[['#overview', 'Overview'], ['#facilities', 'Facilities'], ['#academics', 'Academics'], ['#reviews', 'Reviews'], ['#location', 'Location']].map(([href, label]) => <a key={href} href={href} className="rounded-full px-3 py-1.5 transition hover:bg-cyan-100 hover:text-cyan-800">{label}</a>)}
        </div>
      </nav>

      <div className="mt-6 flex flex-col gap-5">
        <section id="overview" className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-[0_8px_30px_rgba(16,42,67,0.05)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">Get to know the campus</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Overview</h2>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-700">About the school</h3>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink/65">{place.description || 'School information will be updated soon.'}</p>
              {website && <a href={website} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm font-medium text-cyan-700 hover:underline">Open official website ↗</a>}
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-700">Key highlights</h3>
              {highlights.length > 0 ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {highlights.map((highlight) => <div key={highlight} className="rounded-xl border border-cyan-100 bg-[linear-gradient(135deg,#f0fdfa,#ecfeff)] px-3 py-3 text-sm font-medium text-ink/75"><span className="mr-2 text-cyan-700">✓</span>{highlight}</div>)}
                </div>
              ) : <p className="mt-3 text-sm text-ink/50">Highlights will be updated soon.</p>}
            </div>
          </div>
          {(place.phone || place.email || whatsappUrl || socialLinks.instagram || socialLinks.facebook || website) && (
            <div className="mt-7 border-t border-line pt-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-700">Contact</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {place.phone && <ContactLink href={`tel:${place.phone}`} icon="☎" label="Call">{place.phone}</ContactLink>}
                {whatsappUrl && <ContactLink href={whatsappUrl} icon="◉" label="WhatsApp" />}
                {socialLinks.instagram && <ContactLink href={socialLinks.instagram} icon="◎" label="Instagram" />}
                {socialLinks.facebook && <ContactLink href={socialLinks.facebook} icon="f" label="Facebook" />}
                {website && <ContactLink href={website} icon="↗" label="Website" />}
              </div>
            </div>
          )}
        </section>

        <section id="facilities" className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">Built for everyday learning</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Facilities &amp; Infrastructure</h2>
          {place.facilities?.length > 0 ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{place.facilities.map((facility) => <div key={facility} className="group rounded-xl border border-line bg-paper/60 px-4 py-4 text-sm font-medium text-ink/75 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50"><span className="mr-2 text-cyan-700">◆</span>{facility}</div>)}</div> : <p className="mt-4 text-sm text-ink/50">Facility details will be updated soon.</p>}
        </section>

        <section id="academics" className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-2xl font-semibold text-ink">Academics &amp; Admission</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[['Board', academics.board], ['Curriculum', academics.curriculum], ['Classes', academics.classes], ['Admission', admissions]].filter(([, value]) => value).map(([label, value]) => <div key={label} className="rounded-lg bg-cyan-50/70 p-4"><div className="text-xs font-semibold uppercase tracking-wide text-cyan-700">{label}</div><div className="mt-2 text-sm leading-relaxed text-ink/75">{Array.isArray(value) ? value.join(', ') : value}</div></div>)}
          </div>
          {!academics.board && !academics.curriculum && !academics.classes && !admissions && <p className="mt-4 text-sm text-ink/50">Academic and admission details will be updated soon.</p>}
        </section>

        <section id="reviews" className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-7"><ReviewsSection placeId={place._id} /></section>

        <section id="location" className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-2xl font-semibold text-ink">Location</h2>
          <p className="mt-3 flex items-start gap-2 text-[15px] leading-relaxed text-ink/65"><span aria-hidden="true">⌖</span>{place.address}</p>
          <div className="mt-5 overflow-hidden rounded-xl border border-line bg-ink/5">
            <iframe title={`Map showing ${place.name}`} src={mapEmbedUrl} className="h-72 w-full border-0 sm:h-96" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm font-medium text-cyan-700 hover:underline">Open in Google Maps ↗</a>
        </section>
      </div>
    </div>
  );
}

export default function PlaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/places/${id}`)
      .then(({ data }) => setPlace(data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: place?.name, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard');
    }
  };

  const handleAdminDelete = async () => {
    if (!window.confirm(`Delete "${place.name}" permanently? This cannot be undone.`)) return;

    try {
      await api.delete(`/admin/businesses/${place._id}`);
      navigate('/admin/businesses');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="container-page py-20 text-center text-ink/50">Loading…</div>;
  if (error || !place) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Listing not found</h1>
        <Link to="/" className="mt-4 inline-block text-vermilion underline underline-offset-2">Back to homepage</Link>
      </div>
    );
  }

  const mapsUrl = place.coordinates?.lat
    ? `https://www.google.com/maps/search/?api=1&query=${place.coordinates.lat},${place.coordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}`;
  const socialLinks = place.socialLinks || {};
  const academics = place.attributes || {};
  const gallery = place.images || [];
  const isSchoolCategory = ['school', 'schools'].includes((place.category?.slug || '').toLowerCase()) || ['school', 'schools'].includes((place.category?.name || '').toLowerCase());
  const foodBusinessType = resolveFoodBusinessType(place);
  const businessType = place.attributes?.businessProfile?.businessType;
  const isRestaurant = businessType === 'restaurant'
    || (!businessType && !place.attributes?.businessProfile && Boolean(place.attributes?.restaurantProfile))
    || ['restaurant', 'restaurants'].includes((place.subcategory?.slug || place.category?.slug || '').toLowerCase())
    || ['restaurant', 'restaurants'].includes((place.subcategory?.name || place.category?.name || '').toLowerCase());
  const categoryName = place.subcategory?.name || place.category?.name || 'Business';
  const categoryMatches = (value) => String(value || '').toLowerCase();
  const isHomeAppliancesCategory = /home appliances|appliance|appliances|refrigerator|washing machine|air conditioner|led tv|microwave/.test(categoryMatches(place.subcategory?.name || place.category?.name));
  const isFurnitureShopCategory = /furniture|furniture shop|wardrobe|sofa|bedroom|dining room|office furniture|custom furniture/.test(categoryMatches(place.subcategory?.name || place.category?.name));
  const isMattressShopCategory = /mattress|mattress shop|mattresses|sleep|bed/.test(categoryMatches(place.subcategory?.name || place.category?.name));
  const isNurseryCategory = /nursery|nurseries|plant|plants|garden|gardening|flower shop|flowers|seed|soil/.test(categoryMatches(place.subcategory?.name || place.category?.name));
  const categoryFacilityDefaults = isHomeAppliancesCategory
    ? ['Product demonstration area', 'Installation service', 'Repair and maintenance support', 'Home delivery', 'Warranty assistance', 'EMI and digital payments']
    : isFurnitureShopCategory
      ? ['Furniture display showroom', 'Custom design and measurements', 'Home delivery', 'Assembly and installation', 'Interior consultation', 'EMI and digital payments']
      : isMattressShopCategory
        ? ['Mattress trial area', 'Sleep comfort consultation', 'Custom size options', 'Home delivery', 'Old mattress exchange', 'Warranty support']
        : null;

  if (isSchoolCategory) {
    return (
      <>
        <SchoolDetailLayout
          place={place}
          mapsUrl={mapsUrl}
          socialLinks={socialLinks}
          academics={academics}
          onShare={handleShare}
          onReport={() => setShowReport(true)}
          onDelete={user?.role === 'admin' ? handleAdminDelete : null}
        />
        {showReport && <ReportModal placeId={place._id} onClose={() => setShowReport(false)} />}
      </>
    );
  }

  if (foodBusinessType) return <Navigate to={`/business/${place._id}`} replace />;
  if (isMattressShopCategory) {
    return (
      <>
        <MattressDetailLayout
          place={place}
          mapsUrl={mapsUrl}
          socialLinks={socialLinks}
          onShare={handleShare}
          onReport={() => setShowReport(true)}
        />
        {showReport && <ReportModal placeId={place._id} onClose={() => setShowReport(false)} />}
      </>
    );
  }
  if (isNurseryCategory) {
    return (
      <>
        <NurseryDetailLayout
          place={place}
          mapsUrl={mapsUrl}
          socialLinks={socialLinks}
          onShare={handleShare}
          onReport={() => setShowReport(true)}
        />
        {showReport && <ReportModal placeId={place._id} onClose={() => setShowReport(false)} />}
      </>
    );
  }
  if (isFurnitureShopCategory) {
    return (
      <>
        <FurnitureDetailLayout
          place={place}
          mapsUrl={mapsUrl}
          socialLinks={socialLinks}
          onShare={handleShare}
          onReport={() => setShowReport(true)}
        />
        {showReport && <ReportModal placeId={place._id} onClose={() => setShowReport(false)} />}
      </>
    );
  }
  if (isHomeAppliancesCategory) {
    return (
      <>
        <HomeAppliancesDetailLayout
          place={place}
          mapsUrl={mapsUrl}
          socialLinks={socialLinks}
          onShare={handleShare}
          onReport={() => setShowReport(true)}
        />
        {showReport && <ReportModal placeId={place._id} onClose={() => setShowReport(false)} />}
      </>
    );
  }

  const isShoppingCategory = /shopping|mall|retail|boutique|appliance|furniture|mattress|nursery|store|electronics|fashion/.test(categoryMatches(place.subcategory?.name || place.category?.name));

  const shoppingMallServices = [
    'Multi-brand shopping',
    'Fashion & lifestyle',
    'Electronics & gadgets',
    'Home & decor',
    'Food court access',
    'Family-friendly zones',
    'Easy parking',
    'Gift & seasonal offers',
  ];

  const shoppingMallFacilities = [
    'Free parking',
    'Elevators & escalators',
    'Food court',
    'Rest rooms',
    'Security & CCTV',
    'Kids play area',
    'Premium brands',
    'Easy accessibility',
  ];

  const defaultServices = isShoppingCategory
    ? shoppingMallServices
    : [
        'Walk-in service',
        'Online enquiries',
        'Verified information',
        'Customer support',
        'Easy access',
        'Digital payments',
      ];

  const defaultFacilities = categoryFacilityDefaults || (isShoppingCategory
    ? shoppingMallFacilities
    : [
        'Easy access',
        'Digital payments',
        'Customer support',
        'Free parking',
        'Family seating',
        '24/7 assistance',
      ]);

  const displayServices = place.services?.length ? place.services : defaultServices;
  const displayFacilities = place.facilities?.length ? place.facilities : defaultFacilities;
  const primaryPhoto = place.coverImage || gallery[0];
  const galleryPhotos = [...new Set([...(place.coverImage ? [place.coverImage] : []), ...gallery].filter(Boolean))].slice(0, 10);
  const whatsappNumber = socialLinks.whatsapp?.replace(/\D/g, '') || place.phone?.replace(/\D/g, '') || '919999999999';
  const whatsappUrl = socialLinks.whatsapp
    ? (socialLinks.whatsapp.startsWith('http') ? socialLinks.whatsapp : `https://wa.me/${whatsappNumber}`)
    : `https://wa.me/${whatsappNumber}`;
  const instagramUrl = socialLinks.instagram || 'https://instagram.com';
  const facebookUrl = socialLinks.facebook || 'https://facebook.com';
  const websiteUrl = place.website && (place.website.startsWith('http') ? place.website : `https://${place.website}`);
  const aboutSummary = place.description || 'Premium brands, family shopping, and daily essentials under one roof.';
  const heroVideoUrl = place.video || 'https://www.youtube.com/embed/7w3a7VjTEYQ';

  const shoppingCollections = [
    { name: 'Sarees', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80' },
    { name: 'Designer Wear', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80' },
    { name: 'Bridal Wear', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80' },
    { name: 'Party Wear', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80' },
    { name: 'Kurtis', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80' },
    { name: 'Lehengas', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80' },
    { name: 'Western Wear', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80' },
  ];

  const shoppingArrivals = [
    { name: 'Royal Blue Saree', price: '₹ 5,999', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80' },
    { name: 'Floral Midi Dress', price: '₹ 3,499', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80' },
    { name: 'Bridal Lehenga', price: '₹ 18,999', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80' },
    { name: 'Designer Kurta Set', price: '₹ 6,299', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80' },
  ];

  const shoppingBrandLogos = [
    { name: 'Fashion', icon: '🛍️', tint: 'from-pink-100 to-rose-200' },
    { name: 'Electronics', icon: '📱', tint: 'from-cyan-100 to-sky-200' },
    { name: 'Home', icon: '🏠', tint: 'from-amber-100 to-yellow-200' },
    { name: 'Dining', icon: '🍽️', tint: 'from-orange-100 to-red-200' },
    { name: 'Lifestyle', icon: '✨', tint: 'from-violet-100 to-purple-200' },
  ];

  return (
    <div className="container-page py-8">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[30px] border border-[#e9dcc7] bg-[#f5efe8] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#b97d3d]">Tradition meets trend</p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">{place.name}</h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-ink/60">Discover timeless fashion and elegant styles for every occasion with curated boutique collections.</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button onClick={handleShare} className="rounded-md bg-[#b77b4f] px-5 py-3 text-sm font-medium text-white shadow-sm">Explore Collection</button>
                <button onClick={() => setShowReport(true)} className="rounded-md border border-[#d7c5ad] bg-white px-5 py-3 text-sm font-medium text-ink/75">Book Appointment</button>
              </div>
            </div>

            <div className="relative min-h-[420px]">
              <img src={primaryPhoto} alt={`${place.name} hero`} className="h-full w-full object-cover" />
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-line bg-[#f8f7f4] p-5 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-3xl font-semibold text-ink">Our Collections</h2>
            <span className="text-sm text-ink/50">Explore our range</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
            {shoppingCollections.map((item) => (
              <div key={item.name} className="overflow-hidden rounded-[18px] border border-line bg-white shadow-sm">
                <img src={item.image} alt={item.name} className="h-28 w-full object-cover" />
                <div className="p-3">
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  <p className="mt-1 text-[10px] text-ink/40">View collection</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[24px] border border-line bg-white shadow-sm">
            <img src={primaryPhoto} alt={`${place.name} interior`} className="h-[330px] w-full object-cover" />
          </div>

          <div className="rounded-[24px] border border-line bg-[#f8f7f4] p-6 sm:p-8">
            <h3 className="font-display text-3xl font-semibold text-ink">About {place.name}</h3>
            <p className="mt-4 text-base leading-relaxed text-ink/60">{aboutSummary}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {['10+ Years of Experience', 'Custom Tailoring', 'Personal Styling', 'Designer Collections'].map((feature) => (
                <div key={feature} className="rounded-xl border border-line bg-white p-3 text-sm font-medium text-ink/75">{feature}</div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-line bg-[#f8f7f4] p-6 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="font-display text-3xl font-semibold text-ink">New Arrivals</h3>
            <button onClick={handleShare} className="text-sm text-ink/60 hover:text-ink">View all →</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {shoppingArrivals.map((item) => (
              <div key={item.name} className="overflow-hidden rounded-[20px] border border-line bg-white shadow-sm">
                <img src={item.image} alt={item.name} className="h-72 w-full object-cover" />
                <div className="p-4">
                  <p className="text-lg font-semibold text-ink">{item.name}</p>
                  <p className="mt-2 text-sm text-ink/60">{item.price}</p>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded-md border border-[#d7c5ad] bg-white px-3 py-2 text-xs font-medium text-ink/75">View Details</button>
                    <button className="rounded-md bg-[#b77b4f] px-3 py-2 text-xs font-medium text-white">Buy</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-line bg-[#f8f7f4] p-6 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
          <h3 className="font-display text-3xl font-semibold text-ink">Our Services</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {['Custom Stitching', 'Alterations', 'Personal Styling', 'Bridal Consultation', 'Custom Designs'].map((service) => (
              <div key={service} className="rounded-[18px] border border-line bg-[#f4f7fb] p-4 text-center text-sm font-medium text-ink/70">{service}</div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-line bg-[#f8f7f4] p-6 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
            <h3 className="font-display text-3xl font-semibold text-ink">Directions</h3>
            <div className="mt-4 space-y-3 text-sm text-ink/75">
              {place.address && <p className="rounded-[12px] border border-line bg-white px-3 py-2">📍 {place.address}</p>}
              {place.phone && <a href={`tel:${place.phone}`} className="block rounded-[12px] border border-line bg-white px-3 py-2 hover:text-ink">📞 {place.phone}</a>}
              {place.email && <a href={`mailto:${place.email}`} className="block rounded-[12px] border border-line bg-white px-3 py-2 hover:text-ink">✉️ {place.email}</a>}
              {websiteUrl && <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="block rounded-[12px] border border-line bg-white px-3 py-2 text-vermilion hover:underline">🌐 Visit official website</a>}
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block rounded-[12px] border border-line bg-white px-3 py-2 text-vermilion hover:underline">📍 Get directions</a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block rounded-[12px] border border-line bg-white px-3 py-2 text-[#25d366] hover:underline">💬 WhatsApp</a>
            </div>
          </div>

          <div className="rounded-[24px] border border-line bg-[#f8f7f4] p-6 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
            <h3 className="font-display text-3xl font-semibold text-ink">Contact us</h3>
            <div className="mt-4 flex flex-col gap-3">
              <input placeholder="Your name" className="rounded-[12px] border border-line bg-white px-3 py-3 text-sm text-ink placeholder:text-ink/45 outline-none focus:border-[#8bb8d9]" />
              <input placeholder="Email" className="rounded-[12px] border border-line bg-white px-3 py-3 text-sm text-ink placeholder:text-ink/45 outline-none focus:border-[#8bb8d9]" />
              <input placeholder="Phone (optional)" className="rounded-[12px] border border-line bg-white px-3 py-3 text-sm text-ink placeholder:text-ink/45 outline-none focus:border-[#8bb8d9]" />
              <textarea rows={5} placeholder="What would you like to ask?" className="rounded-[12px] border border-line bg-white px-3 py-3 text-sm text-ink placeholder:text-ink/45 outline-none focus:border-[#8bb8d9]" />
            </div>
            <button className="mt-4 w-full rounded-[14px] bg-[#0d2f4d] px-4 py-3 text-base font-semibold text-white shadow-lg shadow-[#0d2f4d]/10 transition hover:bg-[#123b5d]">
              Send enquiry
            </button>
          </div>
        </section>

        <section id="reviews" className="rounded-[24px] border border-line bg-[#f8f7f4] p-6 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
          <ReviewsSection placeId={place._id} />
        </section>
      </div>

      {showReport && <ReportModal placeId={place._id} onClose={() => setShowReport(false)} />}
    </div>
  );
}
