import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import BusinessMediaUploader from '../../components/business/BusinessMediaUploader';

const typeNames = { 'coffee-shop': 'Coffee Shops', bakery: 'Sweet Shops & Bakery', catering: 'Catering Services', 'food-processing': 'Food Processing' };
const inputClass = 'mt-1 w-full rounded-xl border border-[#e7dcd7] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#a83f32]';
const splitList = (value = '') => String(value).split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
const asText = (value) => Array.isArray(value) ? value.map((item) => typeof item === 'string' ? item : item.name).filter(Boolean).join('\n') : value || '';

function Field({ label, value, onChange, readOnly = false }) {
  return <label className="text-sm font-medium text-[#4b3d3b]">{label}<input readOnly={readOnly} value={value || ''} onChange={onChange} className={inputClass} /></label>;
}
function TextField({ label, value, onChange }) {
  return <label className="mt-4 block text-sm font-medium text-[#4b3d3b]">{label}<textarea rows={3} value={value || ''} onChange={onChange} className={inputClass} /></label>;
}

export default function CategoryBusinessEditor({ place, businessType }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const business = place.attributes?.businessProfile || {};
  const legacy = place.attributes?.restaurantProfile || {};
  const profile = { ...(business.common || legacy.common || {}), ...(business.categorySpecific || legacy.categorySpecific || {}) };
  const [form, setForm] = useState({
    name: place.name || '', category: place.category?._id || place.category || '', subcategory: place.subcategory?._id || place.subcategory || '',
    phone: place.phone || '', email: place.email || '', website: place.website || '', logo: place.logo || profile.logo || '', coverImage: place.coverImage || profile.coverImage || '',
    address: place.address || profile.address || '', description: place.description || profile.about || '', gallery: asText(place.images?.length ? place.images : profile.gallery),
    services: asText(place.services?.length ? place.services : profile.services), facilities: asText(place.facilities?.length ? place.facilities : profile.facilities),
    coffeeType: profile.coffeeType || '', beverageCategories: asText(profile.beverageCategories), snacks: asText(profile.snacks), cafeFacilities: asText(profile.facilities),
    shopType: profile.shopType || '', products: asText(profile.products), specialServices: asText(profile.specialServices), experience: profile.experience || '',
    serviceArea: profile.serviceArea || '', eventTypes: asText(profile.eventTypes), cateringServices: asText(profile.cateringServices), guestCapacityMin: profile.guestCapacity?.min || '',
    guestCapacityMax: profile.guestCapacity?.max || '', menuTypes: profile.menuTypes || '', packageDetails: profile.packageDetails || '', industryType: profile.industryType || '',
    operations: asText(profile.operations), certifications: asText(profile.certifications),
  });

  useEffect(() => { api.get('/categories').then(({ data }) => setCategories(data.data || [])).catch(() => setCategories([])); }, []);
  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const parentCategory = useMemo(() => categories.find((item) => item.name === 'Food & Dining'), [categories]);
  const subcategories = useMemo(() => categories.filter((item) => String(item.parent?._id || item.parent) === String(parentCategory?._id)), [categories, parentCategory]);
  const gallery = splitList(form.gallery).slice(0, 10);
  const categorySpecific = {
    'coffee-shop': { coffeeType: form.coffeeType, beverageCategories: splitList(form.beverageCategories), snacks: splitList(form.snacks), facilities: splitList(form.cafeFacilities) },
    bakery: { shopType: form.shopType, products: splitList(form.products), specialServices: splitList(form.specialServices) },
    catering: { experience: form.experience, serviceArea: form.serviceArea, eventTypes: splitList(form.eventTypes), cateringServices: splitList(form.cateringServices), guestCapacity: { min: form.guestCapacityMin, max: form.guestCapacityMax }, menuTypes: form.menuTypes, packageDetails: form.packageDetails },
    'food-processing': { industryType: form.industryType, products: splitList(form.products), operations: splitList(form.operations), facilities: splitList(form.facilities), certifications: splitList(form.certifications) },
  }[businessType];
  const subtypeFields = () => {
    if (businessType === 'coffee-shop') return <><Field label="Coffee Type" value={form.coffeeType} onChange={update('coffeeType')} /><TextField label="Beverage Categories" value={form.beverageCategories} onChange={update('beverageCategories')} /><TextField label="Food / Snacks" value={form.snacks} onChange={update('snacks')} /><TextField label="Cafe Facilities" value={form.cafeFacilities} onChange={update('cafeFacilities')} /></>;
    if (businessType === 'bakery') return <><Field label="Shop Type" value={form.shopType} onChange={update('shopType')} /><TextField label="Products" value={form.products} onChange={update('products')} /><TextField label="Special Services" value={form.specialServices} onChange={update('specialServices')} /></>;
    if (businessType === 'catering') return <><Field label="Experience" value={form.experience} onChange={update('experience')} /><Field label="Service Area" value={form.serviceArea} onChange={update('serviceArea')} /><TextField label="Event Types" value={form.eventTypes} onChange={update('eventTypes')} /><TextField label="Catering Services" value={form.cateringServices} onChange={update('cateringServices')} /><Field label="Minimum Guests" value={form.guestCapacityMin} onChange={update('guestCapacityMin')} /><Field label="Maximum Guests" value={form.guestCapacityMax} onChange={update('guestCapacityMax')} /><Field label="Menu Types" value={form.menuTypes} onChange={update('menuTypes')} /><TextField label="Package Details" value={form.packageDetails} onChange={update('packageDetails')} /></>;
    return <><Field label="Industry Type" value={form.industryType} onChange={update('industryType')} /><TextField label="Products" value={form.products} onChange={update('products')} /><TextField label="Business Operations" value={form.operations} onChange={update('operations')} /><TextField label="Facilities" value={form.facilities} onChange={update('facilities')} /><TextField label="Certifications" value={form.certifications} onChange={update('certifications')} /></>;
  };
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      await api.put('/places/' + place._id, {
        name: form.name, category: form.category, subcategory: form.subcategory || undefined, address: form.address, description: form.description,
        phone: form.phone, email: form.email || undefined, website: form.website || undefined, logo: form.logo || undefined, coverImage: form.coverImage || undefined,
        images: gallery, services: splitList(form.services), facilities: splitList(form.facilities || form.cafeFacilities),
        attributes: { ...place.attributes, businessProfile: { businessType, common: { businessName: form.name, logo: form.logo, phone: form.phone, email: form.email, website: form.website, address: form.address, about: form.description, coverImage: form.coverImage, gallery }, categorySpecific } },
      });
      setMessage(typeNames[businessType] + ' updated and sent for approval.');
    } catch (saveError) { setError(saveError.response?.data?.message || saveError.message || 'Unable to save this business.'); } finally { setSaving(false); }
  };

  return <div className="min-h-screen bg-[#f4efed] px-5 py-10 text-[#2d2323] sm:px-8"><div className="mx-auto max-w-4xl">
    <button type="button" onClick={() => navigate('/business/dashboard')} className="text-sm font-semibold text-[#a83f32]">← Back to Dashboard</button>
    <h1 className="mt-4 font-display text-4xl font-semibold">Edit {typeNames[businessType]}</h1><p className="mt-2 text-sm text-[#70615f]">This editor is specific to the selected business type.</p>
    {error && <p className="mt-4 rounded-xl bg-[#fff1f0] p-3 text-sm text-[#a83f32]">{error}</p>}{message && <p className="mt-4 rounded-xl bg-[#edf9f1] p-3 text-sm text-[#2f5a3f]">{message}</p>}
    <form onSubmit={save} className="mt-8 grid gap-5">
      <section className="rounded-[24px] border border-[#ebded8] bg-white p-5 sm:p-7"><h2 className="font-display text-2xl font-semibold">Basic information</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Business Name" value={form.name} onChange={update('name')} /><Field label="Phone" value={form.phone} onChange={update('phone')} /><Field label="Email" value={form.email} onChange={update('email')} /><Field label="Website" value={form.website} onChange={update('website')} /></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><BusinessMediaUploader label="Business Logo" value={form.logo} onChange={(value) => setForm((current) => ({ ...current, logo: value }))} placeId={place._id} previewClassName="h-32" /><BusinessMediaUploader label="Hero / Banner Image" value={form.coverImage} onChange={(value) => setForm((current) => ({ ...current, coverImage: value }))} placeId={place._id} previewClassName="h-32" /></div><TextField label="Address" value={form.address} onChange={update('address')} /><TextField label="Description" value={form.description} onChange={update('description')} /></section>
      <section className="rounded-[24px] border border-[#ebded8] bg-white p-5 sm:p-7"><h2 className="font-display text-2xl font-semibold">Category</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Category" value="Food & Dining" onChange={() => {}} readOnly /><label className="text-sm font-medium">Subcategory<select value={form.subcategory} onChange={update('subcategory')} className={inputClass}>{subcategories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></label></div></section>
      <section className="rounded-[24px] border border-[#ebded8] bg-white p-5 sm:p-7"><h2 className="font-display text-2xl font-semibold">{typeNames[businessType]} details</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{subtypeFields()}</div><div className="mt-5"><BusinessMediaUploader label="Gallery Images" helpText="Add up to 10 images." value={gallery} onChange={(images) => setForm((current) => ({ ...current, gallery: images.join('\n') }))} placeId={place._id} multiple max={10} previewClassName="h-28" /></div><TextField label="Services" value={form.services} onChange={update('services')} /><TextField label="Facilities" value={form.facilities} onChange={update('facilities')} /></section>
      <div className="flex justify-end gap-3"><button type="button" onClick={() => navigate('/business/' + place._id)} className="rounded-xl border border-[#e7dcd7] bg-white px-4 py-2.5 text-sm font-semibold">Preview</button><button type="submit" disabled={saving} className="rounded-xl bg-[#a83f32] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save changes'}</button></div>
    </form>
  </div></div>;
}
