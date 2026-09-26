import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import LocationCascadeFields from '../../components/LocationCascadeFields';
import BusinessMediaUploader from '../../components/business/BusinessMediaUploader';

const initialLocation = { state: '', district: '', city: '', area: '' };
const defaultHours = {
  mon: { open: '', close: '', closed: false },
  tue: { open: '', close: '', closed: false },
  wed: { open: '', close: '', closed: false },
  thu: { open: '', close: '', closed: false },
  fri: { open: '', close: '', closed: false },
  sat: { open: '', close: '', closed: false },
  sun: { open: '', close: '', closed: false },
};

const servicePresets = [
  { id: '1', name: 'Dine In', icon: '🍽️', description: 'Enjoy a comfortable dining experience.' },
  { id: '2', name: 'Take Away', icon: '🥡', description: 'Fresh meals prepared for takeaway.' },
  { id: '3', name: 'Home Delivery', icon: '🛵', description: 'Quick delivery to your doorstep.' },
  { id: '4', name: 'Online Ordering', icon: '🛒', description: 'Order from your phone in seconds.' },
];

const facilityPresets = [
  { id: '1', name: 'AC Dining', icon: '❄️', description: 'Comfortable air-conditioned seating.' },
  { id: '2', name: 'Parking', icon: '🚗', description: 'Dedicated parking for guests.' },
  { id: '3', name: 'Free Wi-Fi', icon: '📶', description: 'High-speed internet for guests.' },
  { id: '4', name: 'Family Dining', icon: '👨‍👩‍👧‍👦', description: 'A welcoming family atmosphere.' },
];

const cuisineOptions = ['Indian', 'South Indian', 'North Indian', 'Chinese', 'Italian', 'Continental', 'Fast Food', 'Biryani', 'Cafe', 'Bakery', 'Multi Cuisine', 'Other'];

const makeId = () => Math.random().toString(36).slice(2, 10);

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block text-sm font-medium text-[#4b3d3b]">
      <span className="mb-2 block">{label}</span>
      <input
        type={type}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#ebded8] bg-white px-3.5 py-2.5 text-sm text-[#2b1f1c] outline-none transition focus:border-[#a83f32] focus:ring-2 focus:ring-[#a83f32]/10"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <label className="block text-sm font-medium text-[#4b3d3b]">
      <span className="mb-2 block">{label}</span>
      <textarea
        rows={rows}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#ebded8] bg-white px-3.5 py-2.5 text-sm text-[#2b1f1c] outline-none transition focus:border-[#a83f32] focus:ring-2 focus:ring-[#a83f32]/10"
      />
    </label>
  );
}

function DashboardCard({ title, subtitle, action, children }) {
  return (
    <section className="rounded-[24px] border border-[#ebded8] bg-white p-5 shadow-[0_8px_28px_rgba(38,27,25,0.05)] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[1.7rem] font-semibold text-[#2b1f1c]">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-[#776763]">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function RestaurantEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [location, setLocation] = useState(initialLocation);
  const [restaurant, setRestaurant] = useState({
    restaurantName: '',
    category: '',
    subcategory: '',
    cuisineType: 'Indian',
    phone: '',
    email: '',
    website: '',
    logo: '',
    address: '',
    googleMapsUrl: '',
    about: '',
    establishedYear: '',
    priceRange: '',
    foodType: 'Both',
    banner: '',
    aboutImage: '',
    specialOffers: '',
    openingHours: defaultHours,
    services: servicePresets,
    videos: [],
    gallery: [],
    facilities: facilityPresets,
    socialMedia: { facebook: '', instagram: '', youtube: '', twitter: '', whatsapp: '' },
  });
  const [serviceDraft, setServiceDraft] = useState({ name: '', icon: '🍽️', description: '' });
  const [facilityDraft, setFacilityDraft] = useState({ name: '', icon: '✨', description: '' });
  const [videoDraft, setVideoDraft] = useState({ title: '', url: '', thumbnail: '' });
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editingFacilityId, setEditingFacilityId] = useState(null);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [existingAttributes, setExistingAttributes] = useState({});

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const { data } = await api.get('/places/mine');
        const found = data.data.find((item) => item._id === id);
        if (!found) throw new Error('Listing not found or you do not own it.');
        const canonical = found.attributes?.businessProfile || {};
        const legacy = found.attributes?.restaurantProfile || {};
        const profile = legacy;
        const common = canonical.common || {};
        const categorySpecific = canonical.categorySpecific || {};
        setExistingAttributes(found.attributes || {});

        const locationValue = {
          state: found.location?.state?._id || '',
          district: found.location?.district?._id || '',
          city: found.location?.city?._id || '',
          area: found.location?.area?._id || '',
        };

        const openingHours = profile.details?.openingHours?.length
          ? profile.details.openingHours.reduce((acc, item) => ({ ...acc, [item.day]: { open: item.open || '', close: item.close || '', closed: Boolean(item.closed) } }), { ...defaultHours })
          : { ...defaultHours };

        setLocation(locationValue);
        setRestaurant({
          restaurantName: common.businessName || profile.basicInformation?.restaurantName || found.name || '',
          category: found.category?._id || found.category || profile.basicInformation?.category || '',
          subcategory: found.subcategory?._id || found.subcategory || '',
          cuisineType: categorySpecific.cuisineType || profile.basicInformation?.cuisineType || profile.cuisineType || 'Indian',
          phone: common.phone || profile.basicInformation?.phone || found.phone || '',
          email: common.email || profile.basicInformation?.email || found.email || '',
          website: common.website || profile.basicInformation?.website || found.website || '',
          logo: common.logo || profile.basicInformation?.logo || found.logo || '',
          address: common.address || profile.location?.address || found.address || '',
          googleMapsUrl: common.googleMapsUrl || profile.location?.googleMapsUrl || profile.googleMapsUrl || '',
          about: common.about || profile.details?.about || found.description || '',
          establishedYear: categorySpecific.establishedYear || profile.details?.establishedYear || '',
          priceRange: categorySpecific.priceRange || profile.details?.priceRange || '',
          foodType: categorySpecific.foodType || profile.details?.foodType || 'Both',
          banner: common.coverImage || profile.details?.bannerImage || found.coverImage || '',
          aboutImage: common.aboutImage || profile.details?.aboutImage || '',
          specialOffers: profile.specialOffers || '',
          openingHours: common.openingHours?.length ? common.openingHours.reduce((acc, item) => ({ ...acc, [item.day]: { open: item.open || '', close: item.close || '', closed: Boolean(item.closed) } }), { ...defaultHours }) : openingHours,
          services: Array.isArray(categorySpecific.services) && categorySpecific.services.length ? categorySpecific.services.map((service, index) => typeof service === 'string' ? { id: `${index + 1}`, name: service, icon: servicePresets[index % servicePresets.length].icon, description: 'Available at this restaurant.' } : service) : (Array.isArray(profile.services) && profile.services.length ? profile.services : (found.services || []).map((service, index) => ({ id: `${index + 1}`, name: service, icon: servicePresets[index % servicePresets.length].icon, description: 'Available at this restaurant.' }))),
          videos: Array.isArray(common.videos) ? common.videos : (Array.isArray(profile.videos) ? profile.videos : []),
          gallery: Array.isArray(common.gallery) ? common.gallery : (Array.isArray(profile.gallery) ? profile.gallery : (found.images || []).slice(0, 10)),
          facilities: Array.isArray(categorySpecific.infrastructure) && categorySpecific.infrastructure.length ? categorySpecific.infrastructure : (Array.isArray(profile.infrastructure) && profile.infrastructure.length ? profile.infrastructure : (found.facilities || []).map((facility, index) => ({ id: `${index + 1}`, name: facility, icon: facilityPresets[index % facilityPresets.length].icon, description: 'Available for guests.' }))),
          socialMedia: {
            facebook: profile.socialMedia?.facebook || found.socialLinks?.facebook || '',
            instagram: profile.socialMedia?.instagram || found.socialLinks?.instagram || '',
            youtube: profile.socialMedia?.youtube || found.socialLinks?.youtube || '',
            twitter: profile.socialMedia?.twitter || '',
            whatsapp: profile.socialMedia?.whatsapp || found.socialLinks?.whatsapp || '',
          },
        });
      } catch (loadError) {
        setError(loadError.message || 'Unable to load the restaurant profile.');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, [id]);

  const updateField = (field, value) => {
    setRestaurant((current) => ({ ...current, [field]: value }));
  };

  const validateRestaurant = () => {
    if (!restaurant.restaurantName.trim()) return 'Restaurant name is required.';
    if (!restaurant.category) return 'Please select a category.';
    if (!restaurant.phone.trim()) return 'Phone is required.';
    if (!restaurant.address.trim()) return 'Address is required.';
    if (!location.state || !location.city) return 'Please select state and city.';
    if (!restaurant.about.trim()) return 'About Us is required.';
    if (!restaurant.banner.trim()) return 'Banner image is required.';
    return '';
  };

  const saveRestaurant = async (mode = 'draft') => {
    const validationError = validateRestaurant();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: restaurant.restaurantName,
        category: restaurant.category,
        subcategory: restaurant.subcategory || undefined,
        address: restaurant.address,
        description: restaurant.about,
        phone: restaurant.phone,
        email: restaurant.email || undefined,
        website: restaurant.website || undefined,
        logo: restaurant.logo || undefined,
        coverImage: restaurant.banner,
        images: restaurant.gallery.slice(0, 10),
        services: restaurant.services.map((item) => item.name),
        facilities: restaurant.facilities.map((item) => item.name),
        socialLinks: {
          facebook: restaurant.socialMedia.facebook || undefined,
          instagram: restaurant.socialMedia.instagram || undefined,
          youtube: restaurant.socialMedia.youtube || undefined,
          twitter: restaurant.socialMedia.twitter || undefined,
          whatsapp: restaurant.socialMedia.whatsapp || undefined,
        },
        location: {
          state: location.state,
          district: location.district || undefined,
          city: location.city,
          area: location.area || undefined,
        },
        attributes: (() => {
          return {
            // Retain legacy data for existing listings; new writes use businessProfile only.
            ...existingAttributes,
            businessProfile: {
              businessType: 'restaurant',
              common: {
                businessName: restaurant.restaurantName,
                logo: restaurant.logo,
                phone: restaurant.phone,
                email: restaurant.email,
                website: restaurant.website,
                address: restaurant.address,
                state: location.state,
                district: location.district,
                city: location.city,
                area: location.area,
                googleMapsUrl: restaurant.googleMapsUrl,
                about: restaurant.about,
                aboutImage: restaurant.aboutImage,
                coverImage: restaurant.banner,
                openingHours: Object.entries(restaurant.openingHours).map(([day, details]) => ({ day, ...details })),
                videos: restaurant.videos,
                gallery: restaurant.gallery,
                socialMedia: restaurant.socialMedia,
              },
              categorySpecific: {
                cuisineType: restaurant.cuisineType,
                establishedYear: restaurant.establishedYear,
                priceRange: restaurant.priceRange,
                foodType: restaurant.foodType,
                services: restaurant.services,
                infrastructure: restaurant.facilities,
                specialOffers: restaurant.specialOffers,
              },
            },
          };
        })(),
      };

      if (id) {
        await api.put(`/places/${id}`, payload);
      } else {
        await api.post('/places', payload);
      }

      setSuccess(mode === 'submit' ? 'Restaurant submitted for approval.' : 'Restaurant saved as draft.');
      if (mode === 'submit') {
        setTimeout(() => navigate('/business/dashboard'), 1000);
      }
    } catch (saveError) {
      setError(saveError.response?.data?.message || saveError.message || 'Unable to save the restaurant.');
    } finally {
      setSaving(false);
    }
  };

  const addService = () => {
    if (!serviceDraft.name.trim()) return;
    if (editingServiceId) {
      setRestaurant((current) => ({
        ...current,
        services: current.services.map((item) => item.id === editingServiceId ? { ...item, ...serviceDraft } : item),
      }));
      setEditingServiceId(null);
    } else {
      setRestaurant((current) => ({ ...current, services: [...current.services, { ...serviceDraft, id: makeId() }] }));
    }
    setServiceDraft({ name: '', icon: '🍽️', description: '' });
  };

  const addFacility = () => {
    if (!facilityDraft.name.trim()) return;
    if (editingFacilityId) {
      setRestaurant((current) => ({
        ...current,
        facilities: current.facilities.map((item) => item.id === editingFacilityId ? { ...item, ...facilityDraft } : item),
      }));
      setEditingFacilityId(null);
    } else {
      setRestaurant((current) => ({ ...current, facilities: [...current.facilities, { ...facilityDraft, id: makeId() }] }));
    }
    setFacilityDraft({ name: '', icon: '✨', description: '' });
  };

  const addVideo = () => {
    if (!videoDraft.title.trim() || !videoDraft.url.trim()) return;
    if (editingVideoId) {
      setRestaurant((current) => ({
        ...current,
        videos: current.videos.map((item) => item.id === editingVideoId ? { ...item, ...videoDraft } : item),
      }));
      setEditingVideoId(null);
    } else {
      setRestaurant((current) => ({ ...current, videos: [...current.videos, { ...videoDraft, id: makeId() }] }));
    }
    setVideoDraft({ title: '', url: '', thumbnail: '' });
  };

  const removeItem = (field, itemId) => {
    setRestaurant((current) => ({
      ...current,
      [field]: current[field].filter((item) => item.id !== itemId),
    }));
  };

  const galleryMessage = useMemo(() => (restaurant.gallery.length >= 10 ? 'Maximum 10 photos reached.' : 'Upload restaurant photos. Maximum 10 photos.'), [restaurant.gallery.length]);

  if (loading) {
    return <div className="min-h-screen bg-[#f4efed] px-5 py-24 text-center text-[#776763]">Loading restaurant dashboard…</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4efed] text-[#2d2323]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[250px] shrink-0 bg-[#1e2a36] p-5 text-white lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#a83f32] text-lg">🍽️</div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/60">Management</div>
              <div className="font-display text-2xl font-semibold">Restaurant</div>
            </div>
          </div>

          <nav className="space-y-2 text-sm font-medium">
            {['Dashboard', 'My Restaurant', 'Add / Edit Restaurant', 'Preview Restaurant', 'View Status', 'Reservations', 'Reviews', 'Profile', 'Settings', 'Logout'].map((label, index) => (
              <button
                key={label}
                type="button"
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${label === 'Add / Edit Restaurant' ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/5 hover:text-white'}`}
              >
                <span>{['🏠', '📋', '✏️', '👀', '📊', '🗓️', '⭐', '👤', '⚙️', '↩️'][index]}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="border-b border-[#e7dcd7] bg-[#fffaf8] px-5 py-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button type="button" className="grid h-10 w-10 place-items-center rounded-lg border border-[#e7dcd7] bg-white text-lg text-[#413534] lg:hidden">☰</button>
                <div className="font-display text-2xl font-semibold text-[#2b1f1c]">Restaurant Dashboard</div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className="grid h-10 w-10 place-items-center rounded-lg border border-[#e7dcd7] bg-white text-lg text-[#413534]">🔔</button>
                <div className="flex items-center gap-3 rounded-xl border border-[#e7dcd7] bg-white px-3 py-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-[#a83f32] text-sm text-white">RO</div>
                  <div className="text-sm font-medium text-[#403635]">Restaurant Owner</div>
                </div>
              </div>
            </div>
          </header>

          <main className="p-5 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <button type="button" onClick={() => navigate('/business/dashboard')} className="text-sm font-semibold text-[#a83f32]">← Back to Dashboard</button>
                <h1 className="mt-3 font-display text-4xl font-semibold text-[#2b1f1c]">Add / Edit Restaurant</h1>
                <p className="mt-2 text-sm text-[#70615f]">Manage your restaurant details. All information will appear on your restaurant website.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => navigate(`/business/${id}`)} className="rounded-xl border border-[#e7dcd7] bg-white px-4 py-2.5 text-sm font-semibold text-[#3f3030] shadow-sm">Preview Restaurant Page</button>
                <button type="button" onClick={() => saveRestaurant('submit')} className="rounded-xl bg-[#a83f32] px-5 py-2.5 text-sm font-semibold text-white shadow-sm">Submit for Approval</button>
              </div>
            </div>

            {error && <div className="mb-4 rounded-xl border border-[#f2c7c5] bg-[#fff1f0] px-4 py-3 text-sm text-[#a83f32]">{error}</div>}
            {success && <div className="mb-4 rounded-xl border border-[#cfe4d5] bg-[#edf9f1] px-4 py-3 text-sm text-[#2f5a3f]">{success}</div>}

            <div className="grid gap-5">
              <DashboardCard title="Basic Information" subtitle="Add your restaurant's basic details.">
                <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
                  <div className="space-y-4">
                    <Field label="Restaurant Name *" value={restaurant.restaurantName} onChange={(value) => updateField('restaurantName', value)} placeholder="e.g. Spice Haven" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-medium text-[#4b3d3b]">
                        <span className="mb-2 block">Category *</span>
                        <input value="Restaurants" readOnly className="w-full rounded-xl border border-[#ebded8] bg-white px-3.5 py-2.5 text-sm text-[#2b1f1c] outline-none" />
                      </label>

                      <label className="block text-sm font-medium text-[#4b3d3b]">
                        <span className="mb-2 block">Cuisine Type</span>
                        <select
                          value={restaurant.cuisineType}
                          onChange={(event) => updateField('cuisineType', event.target.value)}
                          className="w-full rounded-xl border border-[#ebded8] bg-white px-3.5 py-2.5 text-sm text-[#2b1f1c] outline-none transition focus:border-[#a83f32] focus:ring-2 focus:ring-[#a83f32]/10"
                        >
                          {cuisineOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </label>
                    </div>
                  </div>

                  <BusinessMediaUploader label="Business Logo *" value={restaurant.logo} onChange={(value) => updateField('logo', value)} placeId={id} previewClassName="h-32" />
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <Field label="Phone *" value={restaurant.phone} onChange={(value) => updateField('phone', value)} placeholder="+91 98765 43210" type="tel" />
                  <Field label="Email" value={restaurant.email} onChange={(value) => updateField('email', value)} placeholder="restaurant@gmail.com" type="email" />
                  <Field label="Website" value={restaurant.website} onChange={(value) => updateField('website', value)} placeholder="https://yourwebsite.com" type="url" />
                </div>
              </DashboardCard>

              <DashboardCard title="Location & Address" subtitle="Add your restaurant's location details.">
                <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
                  <div className="space-y-4">
                    <TextAreaField label="Address *" value={restaurant.address} onChange={(value) => updateField('address', value)} placeholder="Enter complete address" rows={2} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-[#ebded8] bg-[#fffaf8] p-3">
                        <div className="mb-2 text-sm font-medium text-[#4b3d3b]">State *</div>
                        <LocationCascadeFields value={location} onChange={setLocation} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-[#d7c4bd] bg-[#faf7f6] p-4">
                    <div className="mb-3 text-sm font-medium text-[#4b3d3b]">Google Maps Location</div>
                    <input
                      type="url"
                      value={restaurant.googleMapsUrl}
                      onChange={(event) => updateField('googleMapsUrl', event.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="w-full rounded-xl border border-[#ebded8] bg-white px-3 py-2 text-sm outline-none focus:border-[#a83f32]"
                    />
                    <div className="mt-4 rounded-2xl border border-[#ebded8] bg-[linear-gradient(135deg,#f3ece9,#dfeaf6)] p-4 text-center text-sm text-[#6a5d5b]">Map preview will appear here when available.</div>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Restaurant Details" subtitle="Tell guests more about your restaurant.">
                <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                  <TextAreaField label="About Us *" value={restaurant.about} onChange={(value) => updateField('about', value)} placeholder="Tell us about your restaurant, history, specialties..." rows={5} />
                  <div className="space-y-4">
                    <Field label="Established Year" value={restaurant.establishedYear} onChange={(value) => updateField('establishedYear', value)} placeholder="e.g. 2018" />
                    <label className="block text-sm font-medium text-[#4b3d3b]">
                      <span className="mb-2 block">Price Range</span>
                      <select value={restaurant.priceRange} onChange={(event) => updateField('priceRange', event.target.value)} className="w-full rounded-xl border border-[#ebded8] bg-white px-3.5 py-2.5 text-sm text-[#2b1f1c] outline-none transition focus:border-[#a83f32] focus:ring-2 focus:ring-[#a83f32]/10">
                        <option value="">Select price range</option>
                        <option value="₹">₹</option>
                        <option value="₹₹">₹₹</option>
                        <option value="₹₹₹">₹₹₹</option>
                        <option value="₹₹₹₹">₹₹₹₹</option>
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-[#4b3d3b]">
                      <span className="mb-2 block">Food Type</span>
                      <div className="flex flex-wrap gap-3 pt-2">
                        {['Vegetarian', 'Non-Vegetarian', 'Both'].map((type) => (
                          <label key={type} className="flex items-center gap-2 text-sm text-[#4b3d3b]">
                            <input type="radio" checked={restaurant.foodType === type} onChange={() => updateField('foodType', type)} className="h-4 w-4 accent-[#a83f32]" />
                            {type}
                          </label>
                        ))}
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <BusinessMediaUploader label="About Image" value={restaurant.aboutImage} onChange={(value) => updateField('aboutImage', value)} placeId={id} previewClassName="h-28" />
                  <BusinessMediaUploader label="Cover / Banner Image *" value={restaurant.banner} onChange={(value) => updateField('banner', value)} placeId={id} previewClassName="h-28" />
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {Object.keys(restaurant.openingHours).map((day) => (
                    <div key={day} className="rounded-xl border border-[#ebded8] bg-[#fffaf8] p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium capitalize text-[#3f3030]">{day}</span>
                        <label className="flex items-center gap-2 text-xs text-[#6a5d5b]">
                          <input type="checkbox" checked={restaurant.openingHours[day].closed} onChange={(event) => {
                            const clone = { ...restaurant.openingHours };
                            clone[day] = { ...clone[day], closed: event.target.checked };
                            updateField('openingHours', clone);
                          }} className="h-4 w-4 accent-[#a83f32]" />
                          Closed
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="time" value={restaurant.openingHours[day].open} onChange={(event) => {
                          const clone = { ...restaurant.openingHours };
                          clone[day] = { ...clone[day], open: event.target.value };
                          updateField('openingHours', clone);
                        }} className="w-full rounded-lg border border-[#ebded8] bg-white px-2 py-2 text-sm outline-none" />
                        <input type="time" value={restaurant.openingHours[day].close} onChange={(event) => {
                          const clone = { ...restaurant.openingHours };
                          clone[day] = { ...clone[day], close: event.target.value };
                          updateField('openingHours', clone);
                        }} className="w-full rounded-lg border border-[#ebded8] bg-white px-2 py-2 text-sm outline-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCard>

              <DashboardCard title="Services" subtitle="Add the services offered by your restaurant." action={<button type="button" className="rounded-xl bg-[#a83f32] px-3 py-2 text-sm font-semibold text-white" onClick={addService}>+ Add Service</button>}>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {restaurant.services.map((service) => (
                    <div key={service.id} className="rounded-2xl border border-[#ebded8] bg-[#fffaf8] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-2xl">{service.icon}</div>
                        <div className="flex gap-2 text-lg">
                          <button type="button" onClick={() => { setServiceDraft(service); setEditingServiceId(service.id); }} aria-label="Edit service">✏️</button>
                          <button type="button" onClick={() => removeItem('services', service.id)} aria-label="Delete service">🗑️</button>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-[#2f2221]">{service.name}</div>
                      <p className="mt-2 text-sm text-[#6b5d5b]">{service.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <input value={serviceDraft.name} onChange={(event) => setServiceDraft({ ...serviceDraft, name: event.target.value })} placeholder="Service name" className="rounded-xl border border-[#ebded8] bg-white px-3 py-2.5 text-sm outline-none" />
                  <input value={serviceDraft.icon} onChange={(event) => setServiceDraft({ ...serviceDraft, icon: event.target.value })} placeholder="Icon" className="rounded-xl border border-[#ebded8] bg-white px-3 py-2.5 text-sm outline-none" />
                  <input value={serviceDraft.description} onChange={(event) => setServiceDraft({ ...serviceDraft, description: event.target.value })} placeholder="Description" className="rounded-xl border border-[#ebded8] bg-white px-3 py-2.5 text-sm outline-none" />
                </div>
              </DashboardCard>

              <DashboardCard title="Video Gallery" subtitle="Add YouTube or hosted video links to showcase your restaurant." action={<button type="button" className="rounded-xl bg-[#a83f32] px-3 py-2 text-sm font-semibold text-white" onClick={addVideo}>+ Add Video</button>}>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {restaurant.videos.map((video) => (
                    <div key={video.id} className="overflow-hidden rounded-2xl border border-[#ebded8] bg-[#fffaf8]">
                      <div className="relative h-36 bg-[#e7d7d0]">
                        {video.thumbnail ? <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-4xl">▶️</div>}
                      </div>
                      <div className="p-3">
                        <div className="text-sm font-semibold text-[#2f2221]">{video.title}</div>
                        <div className="mt-1 truncate text-xs text-[#6b5d5b]">{video.url}</div>
                        <div className="mt-3 flex justify-end gap-3 text-lg">
                          <button type="button" onClick={() => { setVideoDraft(video); setEditingVideoId(video.id); }} aria-label="Edit video">✏️</button>
                          <button type="button" onClick={() => removeItem('videos', video.id)} aria-label="Delete video">🗑️</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <input value={videoDraft.title} onChange={(event) => setVideoDraft({ ...videoDraft, title: event.target.value })} placeholder="Video title" className="rounded-xl border border-[#ebded8] bg-white px-3 py-2.5 text-sm outline-none" />
                  <input value={videoDraft.url} onChange={(event) => setVideoDraft({ ...videoDraft, url: event.target.value })} placeholder="Video URL" className="rounded-xl border border-[#ebded8] bg-white px-3 py-2.5 text-sm outline-none" />
                  <input value={videoDraft.thumbnail} onChange={(event) => setVideoDraft({ ...videoDraft, thumbnail: event.target.value })} placeholder="Thumbnail URL" className="rounded-xl border border-[#ebded8] bg-white px-3 py-2.5 text-sm outline-none" />
                </div>
              </DashboardCard>

              <DashboardCard title="Photo Gallery" subtitle={galleryMessage}>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                  {restaurant.gallery.map((image, index) => (
                    <div key={`${image}-${index}`} className="relative overflow-hidden rounded-2xl border border-[#ebded8] bg-[#fffaf8]">
                      <img src={image} alt={`Gallery ${index + 1}`} className="h-32 w-full object-cover" />
                      <div className="absolute right-2 top-2 flex gap-2 rounded-lg bg-white/90 p-1">
                        <button type="button" onClick={() => setRestaurant((current) => ({ ...current, gallery: current.gallery.filter((_, idx) => idx !== index) }))} aria-label="Delete photo" className="text-sm">🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5"><BusinessMediaUploader label="Add gallery images" helpText="Upload or add URLs. Maximum 10 images." value={restaurant.gallery} onChange={(images) => updateField('gallery', images)} placeId={id} multiple max={10} previewClassName="h-28" /></div>
              </DashboardCard>

              <DashboardCard title="Featured Infrastructure" subtitle="Add facilities and amenities available at your restaurant." action={<button type="button" className="rounded-xl bg-[#a83f32] px-3 py-2 text-sm font-semibold text-white" onClick={addFacility}>+ Add Facility</button>}>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {restaurant.facilities.map((facility) => (
                    <div key={facility.id} className="rounded-2xl border border-[#ebded8] bg-[#fffaf8] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="text-2xl">{facility.icon}</div>
                        <div className="flex gap-2 text-lg">
                          <button type="button" onClick={() => { setFacilityDraft(facility); setEditingFacilityId(facility.id); }} aria-label="Edit facility">✏️</button>
                          <button type="button" onClick={() => removeItem('facilities', facility.id)} aria-label="Delete facility">🗑️</button>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-[#2f2221]">{facility.name}</div>
                      <p className="mt-2 text-sm text-[#6b5d5b]">{facility.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <input value={facilityDraft.name} onChange={(event) => setFacilityDraft({ ...facilityDraft, name: event.target.value })} placeholder="Facility name" className="rounded-xl border border-[#ebded8] bg-white px-3 py-2.5 text-sm outline-none" />
                  <input value={facilityDraft.icon} onChange={(event) => setFacilityDraft({ ...facilityDraft, icon: event.target.value })} placeholder="Icon" className="rounded-xl border border-[#ebded8] bg-white px-3 py-2.5 text-sm outline-none" />
                  <input value={facilityDraft.description} onChange={(event) => setFacilityDraft({ ...facilityDraft, description: event.target.value })} placeholder="Description" className="rounded-xl border border-[#ebded8] bg-white px-3 py-2.5 text-sm outline-none" />
                </div>
              </DashboardCard>

              <DashboardCard title="Social Media Links" subtitle="Optional links that will be displayed on the restaurant page.">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Facebook URL" value={restaurant.socialMedia.facebook} onChange={(value) => updateField('socialMedia', { ...restaurant.socialMedia, facebook: value })} placeholder="https://facebook.com/" />
                  <Field label="Instagram URL" value={restaurant.socialMedia.instagram} onChange={(value) => updateField('socialMedia', { ...restaurant.socialMedia, instagram: value })} placeholder="https://instagram.com/" />
                  <Field label="YouTube URL" value={restaurant.socialMedia.youtube} onChange={(value) => updateField('socialMedia', { ...restaurant.socialMedia, youtube: value })} placeholder="https://youtube.com/" />
                  <Field label="Twitter/X URL" value={restaurant.socialMedia.twitter} onChange={(value) => updateField('socialMedia', { ...restaurant.socialMedia, twitter: value })} placeholder="https://x.com/" />
                </div>
                <div className="mt-4">
                  <Field label="WhatsApp Number" value={restaurant.socialMedia.whatsapp} onChange={(value) => updateField('socialMedia', { ...restaurant.socialMedia, whatsapp: value })} placeholder="+91 98765 43210" />
                </div>
              </DashboardCard>

              <DashboardCard title="Special Offers" subtitle="Optional. Add ongoing discounts, happy hours, or chef specials.">
                <TextAreaField label="Special Offers" value={restaurant.specialOffers} onChange={(value) => updateField('specialOffers', value)} placeholder="Add ongoing offers, discounts, happy hours, or special dishes." rows={4} />
              </DashboardCard>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-[#e7dcd7] pt-5 sm:flex-row sm:justify-end">
              <button type="button" className="rounded-xl border border-[#e7dcd7] bg-white px-5 py-2.5 text-sm font-semibold text-[#342727]">Cancel</button>
              <button type="button" onClick={() => saveRestaurant('draft')} className="rounded-xl border border-[#e7dcd7] bg-white px-5 py-2.5 text-sm font-semibold text-[#342727]">Save as Draft</button>
              <button type="button" onClick={() => navigate(`/business/${id}`)} className="rounded-xl border border-[#e7dcd7] bg-white px-5 py-2.5 text-sm font-semibold text-[#342727]">Preview Restaurant</button>
              <button type="button" onClick={() => saveRestaurant('submit')} className="rounded-xl bg-[#a83f32] px-5 py-2.5 text-sm font-semibold text-white">Submit for Approval</button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
