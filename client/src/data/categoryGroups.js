export const CATEGORY_GROUPS = [
  { name: 'Education & Learning', children: ['Schools', 'Colleges', 'Universities', 'Training Institutes', 'Academies', 'Sports Academies'] },
  { name: 'Healthcare & Medical', children: ['Hospitals', 'Multispeciality Hospitals', 'Cardiology', 'ENT', 'Dental', 'Hearing Solutions', 'Fitness Centres'] },
  { name: 'Religious & Social', children: ['Temples', 'Churches', 'Trusts', 'NGOs', 'Associations'] },
  { name: 'Marriage & Wedding', children: ['Marriage Bureaus', 'Function Halls', 'Event Organizers', 'Flower Decoration', 'Fashion Designers', 'Beauty Parlours', 'Saloon & Spa'] },
  { name: 'Travel & Hospitality', children: ['Tours & Travels', 'Hotels & Residencies', 'Resorts', 'Party Zones'] },
  { name: 'Real Estate & Construction', children: ['Real Estate', 'Construction', 'Roofing', 'Interiors & Decorations', 'Tiles Shops', 'Furniture Shops'] },
  { name: 'Food & Dining', children: ['Restaurants', 'Coffee Shops', 'Sweet Shops & Bakery', 'Catering Services', 'Food Processing'] },
  { name: 'Shopping & Retail', children: ['Shopping Malls', 'Boutique', 'Home Appliances', 'Furniture Shops', 'Mattress Shops', 'Nurseries'] },
  { name: 'Automotive', children: ['Car Showrooms'] },
  { name: 'Industries & Manufacturing', children: ['Small Scale Industries', 'Trading Businesses'] },
  { name: 'Business & Professional Services', children: ['Consultancies', 'Agencies', 'Manpower Agencies', 'Professions'] },
  { name: 'Logistics & Moving', children: ['Packers & Movers'] },
  { name: 'Arts & Creative', children: ['Sculptures (Arts)'] },
];

export const CATEGORY_ICONS = {
  Schools: '🎓', Hospitals: '🏥', Temples: '🛕', 'Marriage Bureaus': '💍', 'Tours & Travels': '🧳', 'Real Estate': '🏠', Restaurants: '🍴', 'Shopping Malls': '🏬', 'Car Showrooms': '🚗', 'Small Scale Industries': '🏭', Consultancies: '💼', 'Packers & Movers': '📦', 'Sculptures (Arts)': '🗿',
  Colleges: '🏢', Universities: '🏛️', 'Training Institutes': '📚', Academies: '🎯', 'Sports Academies': '🏅', 'Multispeciality Hospitals': '🏨', Cardiology: '❤️', ENT: '👂', Dental: '🦷', 'Hearing Solutions': '🦻', 'Fitness Centres': '🏋️', Churches: '⛪', Trusts: '🤝', NGOs: '🌍', Associations: '👥', 'Function Halls': '🏛️', 'Event Organizers': '🎉', Catering: '🍽️', 'Flower Decoration': '💐', 'Fashion Designers': '👗', 'Beauty Parlours': '💄', 'Saloon & Spa': '💆', 'Hotels & Residencies': '🏨', Resorts: '🏝️', 'Party Zones': '🎊', Construction: '🏗️', Roofing: '🧱', 'Interiors & Decorations': '🛋️', 'Tiles Shops': '🔲', 'Furniture Shops': '🪑', 'Coffee Shops': '☕', 'Sweet Shops & Bakery': '🧁', 'Food Processing': '🥫', Boutique: '🛍️', 'Home Appliances': '🔌', 'Mattress Shops': '🛏️', Nurseries: '🌱', 'Trading Businesses': '📦', Agencies: '📣', 'Manpower Agencies': '🧑‍💼', Professions: '🧑‍⚕️',
};

export const slugifyCategory = (name) => name.toLowerCase().trim().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
