const User = require('../models/User');
const Place = require('../models/Place');
const Category = require('../models/Category');
const Location = require('../models/Location');
const Review = require('../models/Review');
const Enquiry = require('../models/Enquiry');
const BusinessRequest = require('../models/BusinessRequest');
const Notification = require('../models/Notification');
const { AppError } = require('../middleware/errorHandler');

const parseImportFile = (file) => {
  if (!file) return [];
  const text = file.buffer.toString('utf8').replace(/^\uFEFF/, '').trim();
  if (!text) return [];
  if (file.mimetype.includes('json') || file.originalname.toLowerCase().endsWith('.json')) {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : parsed.places || [];
  }
  const [header, ...rows] = text.split(/\r?\n/).filter(Boolean);
  const keys = header.split(',').map((key) => key.trim());
  return rows.map((row) => {
    const values = row.split(',');
    return keys.reduce((item, key, index) => ({ ...item, [key]: values[index]?.trim() || '' }), {});
  });
};

/** POST /api/admin/import — imports a JSON array or simple CSV into MongoDB. */
const importPlaces = async (req, res, next) => {
  try {
    const rows = parseImportFile(req.file);
    if (!rows.length) return next(new AppError('Upload a non-empty JSON or CSV file.', 400));
    const imported = [];
    for (const row of rows.slice(0, 500)) {
      if (!row.name || !row.category || !row.state || !row.district || !row.city || !row.address) continue;
      const [category, state, district, city] = await Promise.all([
        Category.findOne({ $or: [{ slug: String(row.category).toLowerCase() }, { name: new RegExp(`^${String(row.category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }] }),
        Location.findOne({ level: 'state', $or: [{ slug: String(row.state).toLowerCase() }, { name: new RegExp(`^${row.state}$`, 'i') }] }),
        Location.findOne({ level: 'district', $or: [{ slug: String(row.district).toLowerCase() }, { name: new RegExp(`^${row.district}$`, 'i') }] }),
        Location.findOne({ level: 'city', $or: [{ slug: String(row.city).toLowerCase() }, { name: new RegExp(`^${row.city}$`, 'i') }] }),
      ]);
      if (!category || !state || !district || !city) continue;
      const area = row.area ? await Location.findOne({ level: 'area', parent: city._id, name: new RegExp(`^${row.area}$`, 'i') }) : null;
      const images = String(row.images || row.image || '').split('|').map((image) => image.trim()).filter(Boolean);
      const place = await Place.create({
        name: row.name, category: category._id,
        location: { state: state._id, district: district._id, city: city._id, area: area?._id || null },
        address: row.address, description: row.description || '', phone: row.phone || null,
        website: row.website || null, images, coverImage: images[0] || null,
        services: String(row.services || '').split('|').map((v) => v.trim()).filter(Boolean),
        attributes: {}, rating: { average: Number(row.rating) || 0, count: Number(row.reviewCount) || 0 },
        verified: true, status: 'approved', owner: req.user._id,
      });
      imported.push(place);
    }
    res.status(201).json({ success: true, message: `${imported.length} places imported.`, data: imported });
  } catch (error) {
    next(error);
  }
};

// --- User management ---

/** GET /api/admin/users?search=&role=&status=&page=&limit= */
const getUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found.', 404));
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/admin/users/:id/status — block or unblock. */
const setUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'active' | 'blocked'
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!user) return next(new AppError('User not found.', 404));
    res.status(200).json({ success: true, message: `User ${status}.`, data: user });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/admin/users/:id/role */
const setUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'business', 'admin'].includes(role)) {
      return next(new AppError('Invalid role.', 400));
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return next(new AppError('User not found.', 404));
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError('User not found.', 404));
    res.status(200).json({ success: true, message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

// --- Business / listing approval workflow ---

/** GET /api/admin/businesses?status=pending */
const getBusinesses = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [places, total] = await Promise.all([
      Place.find(filter)
        .populate('category', 'name')
        .populate('owner', 'name email mobile')
        .populate('location.city', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Place.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: places,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/admin/businesses/:id/approve */
const approveBusiness = async (req, res, next) => {
  try {
    const place = await Place.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', verified: true, rejectionReason: null },
      { new: true }
    );
    if (!place) return next(new AppError('Listing not found.', 404));

    await BusinessRequest.findOneAndUpdate(
      { place: place._id },
      { status: 'approved', reviewedBy: req.user._id, reviewedAt: new Date() }
    );

    await Notification.create({
      user: place.owner,
      title: 'Listing approved',
      message: `${place.name} is now live on Google Pages.`,
      type: 'listing_approved',
      link: `/places/${place._id}`,
    });

    res.status(200).json({ success: true, message: 'Listing approved and published.', data: place });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/admin/businesses/:id/reject */
const rejectBusiness = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) return next(new AppError('A rejection reason is required.', 400));

    const place = await Place.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    );
    if (!place) return next(new AppError('Listing not found.', 404));

    await BusinessRequest.findOneAndUpdate(
      { place: place._id },
      { status: 'rejected', rejectionReason: reason, reviewedBy: req.user._id, reviewedAt: new Date() }
    );

    await Notification.create({
      user: place.owner,
      title: 'Listing rejected',
      message: `${place.name} was rejected: ${reason}`,
      type: 'listing_rejected',
      link: `/business/dashboard`,
    });

    res.status(200).json({ success: true, message: 'Listing rejected.', data: place });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/admin/businesses/:id/suspend */
const suspendBusiness = async (req, res, next) => {
  try {
    const place = await Place.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true }
    );
    if (!place) return next(new AppError('Listing not found.', 404));
    res.status(200).json({ success: true, message: 'Listing suspended.', data: place });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/admin/businesses/:id */
const deleteBusiness = async (req, res, next) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);
    if (!place) return next(new AppError('Listing not found.', 404));

    await BusinessRequest.deleteMany({ place: place._id });

    res.status(200).json({ success: true, message: 'Listing deleted.' });
  } catch (error) {
    next(error);
  }
};

// --- Platform analytics ---

/** GET /api/admin/analytics */
const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalBusinessOwners,
      totalPlaces,
      approvedPlaces,
      pendingPlaces,
      totalCategories,
      totalCities,
      totalReviews,
      totalEnquiries,
      mostViewed,
      mostSearchedByAppearance,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'business' }),
      Place.countDocuments(),
      Place.countDocuments({ status: 'approved' }),
      Place.countDocuments({ status: 'pending' }),
      Category.countDocuments(),
      Location.countDocuments({ level: 'city' }),
      Review.countDocuments(),
      Enquiry.countDocuments(),
      Place.find({ status: 'approved' }).sort('-views').limit(5).select('name views'),
      Place.find({ status: 'approved' }).sort('-searchAppearances').limit(5).select('name searchAppearances'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBusinessOwners,
        totalPlaces,
        approvedPlaces,
        pendingPlaces,
        totalCategories,
        totalCities,
        totalReviews,
        totalEnquiries,
        mostViewed,
        mostSearchedByAppearance,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  setUserStatus,
  setUserRole,
  deleteUser,
  getBusinesses,
  approveBusiness,
  rejectBusiness,
  suspendBusiness,
  deleteBusiness,
  getAnalytics,
  importPlaces,
};
