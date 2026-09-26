
/**
 * Seeds categories and the location hierarchy.
 *
 * Run with:
 * npm run seed
 *
 * Safe to re-run.
 */

require('dotenv').config();

const dns = require('dns');
const mongoose = require('mongoose');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');

const dnsServers = (process.env.DNS_SERVERS || '')
  .split(',')
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers.length > 0) {
  dns.setServers(dnsServers);
}

const connectDB = require('../config/db');
const Location = require('../models/Location');
const Category = require('../models/Category');
const Place = require('../models/Place');
const User = require('../models/User');


// ============================================================
// HELPER
// ============================================================

const createSlug = (name) => {
  return slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });
};

const createPlaceName = (cityName, categoryName) => {
  const normalizedCategory = categoryName.replace(/s$/, '');
  return `${cityName} ${normalizedCategory} Hub`;
};

const createUniquePlaceSlug = async (cityId, cityName, categoryName) => {
  const baseSlug = createSlug(createPlaceName(cityName, categoryName));
  let slug = baseSlug;
  let suffix = 2;

  while (await Place.exists({ slug, 'location.city': cityId })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};


// ============================================================
// CATEGORY DATA
// ============================================================

const LEGACY_CATEGORIES = [
  {
    name: 'Schools',
    order: 1,
    filters: [
      {
        key: 'board',
        label: 'Board',
        type: 'select',
        options: ['CBSE', 'ICSE', 'State Board', 'IB'],
      },
      {
        key: 'classes',
        label: 'Classes',
        type: 'select',
        options: ['1-5', '1-10', '1-12', 'Nursery-5'],
      },
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: ['Private', 'Government', 'Aided'],
      },
      {
        key: 'gender',
        label: 'Gender',
        type: 'select',
        options: ['Co-ed', 'Boys', 'Girls'],
      },
    ],
  },

  {
    name: 'Colleges',
    order: 2,
  },

  {
    name: 'Universities',
    order: 3,
  },

  {
    name: 'Hospitals',
    order: 4,
    filters: [
      {
        key: 'specialization',
        label: 'Specialization',
        type: 'select',
        options: [
          'General',
          'Cardiology',
          'Orthopedics',
          'Pediatrics',
          'Multi-Specialty',
        ],
      },
      {
        key: 'emergency',
        label: '24x7 Emergency',
        type: 'boolean',
      },
    ],
  },

  {
    name: 'Clinics',
    order: 5,
  },

  {
    name: 'Pharmacies',
    order: 6,
  },

  {
    name: 'Restaurants',
    order: 7,
    filters: [
      {
        key: 'cuisine',
        label: 'Cuisine',
        type: 'select',
        options: [
          'South Indian',
          'North Indian',
          'Chinese',
          'Continental',
          'Multi-Cuisine',
        ],
      },
      {
        key: 'priceRange',
        label: 'Price Range',
        type: 'select',
        options: ['₹', '₹₹', '₹₹₹'],
      },
    ],
  },

  {
    name: 'Hotels',
    order: 8,
  },

  {
    name: 'Fashion Stores',
    order: 9,
  },

  {
    name: 'Shopping Malls',
    order: 10,
  },

  {
    name: 'Banks',
    order: 11,
  },

  {
    name: 'Gyms',
    order: 12,
  },

  {
    name: 'Salons',
    order: 13,
  },

  {
    name: 'Theatres',
    order: 14,
  },

  {
    name: 'Tourist Places',
    order: 15,
  },

  {
    name: 'Temples',
    order: 16,
  },

  {
    name: 'Parks',
    order: 17,
  },

  {
    name: 'IT Companies',
    order: 18,
  },

  {
    name: 'Coaching Centers',
    order: 19,
  },

  {
    name: 'Libraries',
    order: 20,
  },

  {
    name: 'Automobile Dealers',
    order: 21,
  },

  {
    name: 'Government Offices',
    order: 22,
  },

  {
    name: 'Real Estate',
    order: 23,
  },
];

const BUSINESS_CATEGORY_GROUPS = [
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

const REQUESTED_CATEGORY_NAMES = BUSINESS_CATEGORY_GROUPS.flatMap((group) => [group.name, ...group.children]);

const LEGACY_FILTERS = Object.fromEntries(
  LEGACY_CATEGORIES.filter((category) => category.filters).map((category) => [category.name, category.filters])
);

const CATEGORIES = REQUESTED_CATEGORY_NAMES.map((name, index) => ({
  name,
  order: index + 1,
  ...(LEGACY_FILTERS[name] ? { filters: LEGACY_FILTERS[name] } : {}),
}));


// ============================================================
// LOCATION DATA
// ============================================================

const LOCATIONS = {
  state: 'Andhra Pradesh',

  districts: {
    'Alluri Sitharama Raju': ['Paderu'],
    Anakapalli: ['Anakapalle'],
    Ananthapuramu: ['Anantapur'],
    Annamayya: ['Rayachoti'],
    Bapatla: ['Bapatla'],
    Chittoor: ['Chittoor'],
    'Dr. B.R. Ambedkar Konaseema': ['Amalapuram'],
    'East Godavari': [
      'Rajahmundry',
    ],
    Eluru: ['Eluru'],
    Guntur: ['Guntur'],
    Kakinada: ['Kakinada'],
    Krishna: ['Machilipatnam'],
    Kurnool: ['Kurnool'],
    Nandyal: ['Nandyal'],
    NTR: ['Vijayawada', 'Nuzvid'],
    Palnadu: ['Narasaraopet'],
    Prakasam: ['Ongole'],
    'Sri Potti Sriramulu Nellore': ['Nellore'],
    'Parvathipuram Manyam': ['Parvathipuram'],
    Srikakulam: ['Srikakulam'],
    'Sri Sathya Sai': ['Puttaparthi'],
    Tirupati: ['Tirupati'],
    Visakhapatnam: [
      'Visakhapatnam City',
    ],
    Vizianagaram: ['Vizianagaram'],
    'West Godavari': [
      'Bhimavaram',
      'Narasapuram',
      'Tadepalligudem',
      'Tanuku',
      'Palakollu',
    ],
    'YSR Kadapa': ['Kadapa'],
  },
};

const AREAS = {
  Rajahmundry: ['Danavaipeta', 'Morampudi', 'Dowleswaram', 'Bommuru'],
  Kakinada: ['Sarpavaram', 'Ramanayyapeta', 'Jagannaickpur'],
  Vijayawada: ['Benz Circle', 'Moghalrajpuram', 'Patamata'],
  Machilipatnam: ['Noblepet', 'Robertsonpet', 'Chilakalapudi'],
  'Visakhapatnam City': ['MVP Colony', 'Dwaraka Nagar', 'Madhurawada'],
  Anakapalle: ['Gavarapalem', 'Sankaram', 'Kondakoppaka'],
};

const IMAGE_SETS = [
  'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
];


// ============================================================
// SEED FUNCTION
// ============================================================

const run = async () => {
  try {

    // ========================================================
    // CONNECT DATABASE
    // ========================================================

    await connectDB();

    console.log('[seed] Database connected');


    // ========================================================
    // SEED CATEGORIES
    // ========================================================

    for (const category of CATEGORIES) {

      const slug = createSlug(category.name);

      await Category.findOneAndUpdate(
        {
          name: category.name,
        },

        {
          $set: {
            name: category.name,
            slug: slug,
            order: category.order,
            parent: null,
            filters: category.filters || [],
          },
        },

        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    for (const group of BUSINESS_CATEGORY_GROUPS) {
      const parentCategory = await Category.findOne({ name: group.name });
      if (!parentCategory) continue;

      const childNames = group.children || [];
      if (!childNames.length) continue;

      await Category.updateMany(
        { name: { $in: childNames } },
        { $set: { parent: parentCategory._id } }
      );

      await Category.deleteMany({
        parent: parentCategory._id,
        name: { $nin: childNames },
      });
    }

    console.log(
      `[seed] Ensured ${BUSINESS_CATEGORY_GROUPS.length} top-level categories and their subcategories`
    );


    // ========================================================
    // SEED STATE
    // ========================================================

    const stateSlug = createSlug(LOCATIONS.state);

    const state = await Location.findOneAndUpdate(
      {
        name: LOCATIONS.state,
        level: 'state',
        parent: null,
      },

      {
        $set: {
          name: LOCATIONS.state,
          slug: stateSlug,
          level: 'state',
          parent: null,
          status: 'active',
        },
      },

      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log(
      `[seed] State ready: ${state.name}`
    );

    // Kakinada is its own district; deactivate the old misplaced city entry
    // that may exist under East Godavari from an earlier seed.
    const oldEastGodavari = await Location.findOne({
      name: 'East Godavari',
      level: 'district',
      parent: state._id,
    });
    if (oldEastGodavari) {
      await Location.updateMany(
        { name: 'Kakinada', level: 'city', parent: oldEastGodavari._id },
        { $set: { status: 'inactive' } }
      );
    }
    const oldKrishna = await Location.findOne({
      name: 'Krishna',
      level: 'district',
      parent: state._id,
    });
    if (oldKrishna) {
      await Location.updateMany(
        { name: 'Vijayawada', level: 'city', parent: oldKrishna._id },
        { $set: { status: 'inactive' } }
      );
    }


    // ========================================================
    // SEED DISTRICTS
    // ========================================================

    for (const [districtName, cities] of Object.entries(
      LOCATIONS.districts
    )) {

      const districtSlug = createSlug(districtName);

      const district = await Location.findOneAndUpdate(
        {
          name: districtName,
          level: 'district',
          parent: state._id,
        },

        {
          $set: {
            name: districtName,
            slug: districtSlug,
            level: 'district',
            parent: state._id,
            status: 'active',
          },
        },

        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );


      console.log(
        `[seed] District ready: ${district.name}`
      );


      // ======================================================
      // SEED CITIES
      // ======================================================

      for (const cityName of cities) {

        const citySlug = createSlug(cityName);

        const city = await Location.findOneAndUpdate(
          {
            name: cityName,
            level: 'city',
            parent: district._id,
          },

          {
            $set: {
              name: cityName,
              slug: citySlug,
              level: 'city',
            parent: district._id,
            status: 'active',
          },
          },

          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          }
        );

        console.log(
          `[seed] City ready: ${cityName}`
        );

        for (const areaName of AREAS[cityName] || []) {
          await Location.findOneAndUpdate(
            { name: areaName, level: 'area', parent: city._id },
            { $set: { name: areaName, slug: createSlug(areaName), level: 'area', parent: city._id, status: 'active' } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }
      }
    }


    // ========================================================
    // COMPLETE
    // ========================================================

    const passwordHash = await bcrypt.hash('GooglePages@123', 12);
    const demoOwner = await User.findOneAndUpdate(
      { email: 'demo.owner@googlepages.local' },
      { $set: { name: 'Google Pages Demo Owner', email: 'demo.owner@googlepages.local', mobile: '9876543210', passwordHash, role: 'business', status: 'active' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const seedAdminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@googlepages.local';
    const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
    const adminPasswordHash = await bcrypt.hash(seedAdminPassword, 12);
    const seedAdmin = await User.findOneAndUpdate(
      { email: seedAdminEmail },
      {
        $set: {
          name: 'Google Pages Admin',
          email: seedAdminEmail,
          mobile: process.env.SEED_ADMIN_MOBILE || '9999999999',
          passwordHash: adminPasswordHash,
          role: 'admin',
          status: 'active',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`[seed] Admin ready: ${seedAdmin.email}`);

    const categories = await Category.find({ status: 'active' }).sort('order');
    const cities = await Location.find({ level: 'city', status: 'active' }).populate({ path: 'parent', populate: { path: 'parent' } });
    let placesCreated = 0;
    for (const city of cities) {
      const state = await Location.findOne({ level: 'state', _id: city.parent.parent });
      for (let categoryIndex = 0; categoryIndex < categories.length; categoryIndex += 1) {
        const category = categories[categoryIndex];
        const area = await Location.findOne({ level: 'area', parent: city._id }).skip(categoryIndex % Math.max(1, (AREAS[city.name] || []).length));
        const name = createPlaceName(city.name, category.name);
        const image = IMAGE_SETS[categoryIndex % IMAGE_SETS.length];
        const slug = await createUniquePlaceSlug(city._id, city.name, category.name);

        const place = await Place.findOneAndUpdate(
          { name, 'location.city': city._id, category: category._id },
          {
            $set: {
              name,
              slug,
              category: category._id,
              location: { state: state._id, district: city.parent._id, city: city._id, area: area?._id || null },
              address: `${area?.name || city.name} Main Road, ${city.name}, Andhra Pradesh`,
              description: `A trusted, locally loved ${category.name.toLowerCase()} serving families and visitors across ${city.name}.`,
              phone: '9876543210', email: 'hello@googlepages.local', website: 'https://www.google.com',
              images: [image, IMAGE_SETS[(categoryIndex + 3) % IMAGE_SETS.length]], coverImage: image,
              services: ['Walk-in service', 'Online enquiries', 'Verified information'],
              facilities: ['Easy access', 'Customer support', 'Digital payments'],
              coordinates: { lat: 16.98 + (categoryIndex % 5) * 0.006, lng: 81.78 + (categoryIndex % 4) * 0.006 },
              attributes: category.name === 'Schools' ? { board: categoryIndex % 2 ? 'State Board' : 'CBSE', classes: '1-12', type: 'Private', gender: 'Co-ed' } :
                category.name === 'Hospitals' ? { specialization: 'Multi-Specialty', emergency: 'true' } :
                category.name === 'Restaurants' ? { cuisine: categoryIndex % 2 ? 'South Indian' : 'Multi-Cuisine', priceRange: '₹₹' } : {},
              rating: { average: Number((4.1 + (categoryIndex % 8) / 10).toFixed(1)), count: 18 + categoryIndex * 4 },
              verified: true, status: 'approved', owner: demoOwner._id,
              views: 120 + categoryIndex * 17, favoritesCount: 8 + categoryIndex,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        if (place) placesCreated += 1;
      }
    }

    console.log(`[seed] Ensured Andhra Pradesh location tree, ${placesCreated} demo places, and admin ${seedAdmin.email}`);

    await mongoose.connection.close();

    console.log('[seed] Done.');

  } catch (err) {

    console.error('[seed] Failed:', err);

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // Ignore connection close errors
    }

    process.exit(1);
  }
};


// ============================================================
// START
// ============================================================

run();
