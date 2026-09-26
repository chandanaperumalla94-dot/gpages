const Place = require('../models/Place');
const Category = require('../models/Category');
const Favorite = require('../models/Favorite');
const { AppError } = require('../middleware/errorHandler');

const foodBusinessTypes = {
  Restaurants: 'restaurant',
  'Coffee Shops': 'coffee-shop',
  'Sweet Shops & Bakery': 'bakery',
  'Catering Services': 'catering',
  'Food Processing': 'food-processing',
};

const validateBusinessTaxonomy = async (payload) => {
  if (!payload.category) return;

  const category = await Category.findById(payload.category).select('name parent');
  if (!category) throw new AppError('Selected category was not found.', 400);

  const subcategory = payload.subcategory
    ? await Category.findById(payload.subcategory).select('name parent')
    : null;
  if (payload.subcategory && !subcategory) throw new AppError('Selected subcategory was not found.', 400);

  if (category.name !== 'Food & Dining') {
    if (subcategory && String(subcategory.parent) !== String(category._id)) {
      throw new AppError('Selected subcategory does not belong to the selected category.', 400);
    }
    return;
  }

  if (!subcategory || String(subcategory.parent) !== String(category._id) || !foodBusinessTypes[subcategory.name]) {
    throw new AppError('Food & Dining requires a valid subcategory.', 400);
  }

  const businessType = payload.attributes?.businessProfile?.businessType;
  if (businessType !== foodBusinessTypes[subcategory.name]) {
    throw new AppError(`Business type must be ${foodBusinessTypes[subcategory.name]} for ${subcategory.name}.`, 400);
  }
};

const normalizeAttributes = (attributes) => {
  if (!attributes || typeof attributes !== 'object') return attributes;
  const normalized = { ...attributes };
  const profile = normalized.businessProfile;
  if (profile && typeof profile === 'object') {
    const common = { ...(profile.common || {}) };
    common.gallery = Array.isArray(common.gallery) ? common.gallery.filter(Boolean).slice(0, 10) : [];
    common.videos = Array.isArray(common.videos) ? common.videos.filter(Boolean).slice(0, 50) : [];
    normalized.businessProfile = { ...profile, common };
  }
  // Legacy restaurantProfile data is intentionally preserved for backwards compatibility.
  return normalized;
};

const normalizeGallery = (images) => Array.isArray(images) ? images.filter(Boolean).slice(0, 10) : images;

const isSafeImageUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return false;
  if (value.startsWith('/uploads/') || value.startsWith('/images/')) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

const validateBusinessMedia = (payload) => {
  const common = payload.attributes?.businessProfile?.common;
  const imageValues = [
    payload.logo,
    payload.coverImage,
    ...(payload.images || []),
    common?.logo,
    common?.coverImage,
    ...(common?.gallery || []),
  ].filter(Boolean);

  if (Array.isArray(payload.images) && payload.images.length > 10) {
    throw new AppError('A gallery can contain at most 10 images.', 400);
  }
  if (Array.isArray(common?.gallery) && common.gallery.length > 10) {
    throw new AppError('A gallery can contain at most 10 images.', 400);
  }
  if (imageValues.some((value) => !isSafeImageUrl(value))) {
    throw new AppError('Image URLs must be valid HTTP(S) URLs or uploaded image paths.', 400);
  }
};

/**
 * GET /api/places
 * Powers both the city+category listing page and global search.
 * Query params:
 *   city, category, area, q (text search), rating (min), verified,
 *   sort (rating|newest|popular), page, limit, plus arbitrary
 *   attribute filters as attr[<key>]=<value> (category-specific filters).
 */
const getPlaces = async (req, res, next) => {
  try {
    const {
      city,
      category,
      area,
      q,
      rating,
      verified,
      sort = 'rating',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { status: 'approved' };
    if (city) filter['location.city'] = city;
    if (area) filter['location.area'] = area;
    if (category) filter.category = category;
    if (verified === 'true') filter.verified = true;
    if (rating) filter['rating.average'] = { $gte: Number(rating) };
    if (q) {
      filter.$or = [
        { $text: { $search: q } },
        { name: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { services: { $regex: q, $options: 'i' } },
      ];
    }

    // Category-specific attribute filters: attr[board]=CBSE&attr[emergency]=true
    if (req.query.attr && typeof req.query.attr === 'object') {
      Object.entries(req.query.attr).forEach(([key, value]) => {
        filter[`attributes.${key}`] = value;
      });
    }

    const sortMap = {
      rating: { 'rating.average': -1 },
      newest: { createdAt: -1 },
      popular: { views: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [places, total] = await Promise.all([
      Place.find(filter)
        .populate('category', 'name slug icon parent')
        .populate('subcategory', 'name slug parent')
        .sort(sortMap[sort] || sortMap.rating)
        .skip(skip)
        .limit(Number(limit)),
      Place.countDocuments(filter),
    ]);

    // Track search appearances for "most searched" analytics when a text query was used
    if (q && places.length) {
      await Place.updateMany(
        { _id: { $in: places.map((p) => p._id) } },
        { $inc: { searchAppearances: 1 } }
      );
    }

    res.status(200).json({
      success: true,
      data: places,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/places/:id — detail page; increments view count and records recently-viewed. */
const getPlaceById = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id)
      .populate('category', 'name slug icon filters parent')
      .populate('subcategory', 'name slug parent')
      .populate('location.state location.district location.city location.area', 'name slug')
      .populate('owner', 'name email');

    if (!place || place.status !== 'approved') {
      return next(new AppError('Listing not found.', 404));
    }

    place.views += 1;
    await place.save();

    if (req.user) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { recentlyViewed: { place: place._id } },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          recentlyViewed: { $each: [{ place: place._id }], $position: 0, $slice: 20 },
        },
      });
    }

    res.status(200).json({ success: true, data: place });
  } catch (error) {
    next(error);
  }
};

/** GET /api/places/trending?city=... */
const getTrending = async (req, res, next) => {
  try {
    const filter = { status: 'approved' };
    if (req.query.city) filter['location.city'] = req.query.city;

    const places = await Place.find(filter)
      .populate('category', 'name slug icon')
      .sort({ views: -1, 'rating.average': -1 })
      .limit(Number(req.query.limit) || 8);

    res.status(200).json({ success: true, data: places });
  } catch (error) {
    next(error);
  }
};

/** POST /api/places — business owner submits a new listing (starts as 'pending'). */
const createPlace = async (req, res, next) => {
  try {
    await validateBusinessTaxonomy(req.body);
    validateBusinessMedia(req.body);
    if (req.body.attributes?.businessProfile?.businessType && req.body.attributes.restaurantProfile) {
      throw new AppError('Food & Dining listings must use attributes.businessProfile; restaurantProfile is legacy-only.', 400);
    }
    const place = await Place.create({
      ...req.body,
      images: normalizeGallery(req.body.images),
      attributes: normalizeAttributes(req.body.attributes),
      owner: req.user._id,
      status: 'pending',
    });

    const BusinessRequest = require('../models/BusinessRequest');
    await BusinessRequest.create({
      owner: req.user._id,
      place: place._id,
      placeSnapshot: place.toObject(),
    });

    res.status(201).json({
      success: true,
      message: 'Listing submitted successfully. It will go live after admin approval.',
      data: place,
    });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/places/:id — owner edits their own listing; edits re-enter pending review. */
const updatePlace = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return next(new AppError('Listing not found.', 404));

    const isOwner = place.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to edit this listing.', 403));
    }

    await validateBusinessTaxonomy({
      category: req.body.category || place.category,
      subcategory: req.body.subcategory || place.subcategory,
      attributes: req.body.attributes || place.attributes,
    });
    Object.assign(place, {
      ...req.body,
      images: req.body.images === undefined ? place.images : normalizeGallery(req.body.images),
      attributes: req.body.attributes === undefined ? place.attributes : normalizeAttributes(req.body.attributes),
    });
    validateBusinessMedia(req.body);
    if (isOwner && req.user.role !== 'admin') {
      place.status = 'pending'; // owner edits require re-approval
      place.rejectionReason = null;
    }
    await place.save();

    res.status(200).json({ success: true, message: 'Listing updated.', data: place });
  } catch (error) {
    next(error);
  }
};

/** DELETE /api/places/:id */
const deletePlace = async (req, res, next) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return next(new AppError('Listing not found.', 404));

    const isOwner = place.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to delete this listing.', 403));
    }

    await place.deleteOne();
    res.status(200).json({ success: true, message: 'Listing deleted.' });
  } catch (error) {
    next(error);
  }
};

/** POST /api/favorites/:placeId — toggle favorite for the current user. */
const toggleFavorite = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const existing = await Favorite.findOne({ user: req.user._id, place: placeId });

    if (existing) {
      await existing.deleteOne();
      await Place.findByIdAndUpdate(placeId, { $inc: { favoritesCount: -1 } });
      return res.status(200).json({ success: true, favorited: false });
    }

    await Favorite.create({ user: req.user._id, place: placeId });
    await Place.findByIdAndUpdate(placeId, { $inc: { favoritesCount: 1 } });
    res.status(200).json({ success: true, favorited: true });
  } catch (error) {
    next(error);
  }
};

/** GET /api/favorites — the places the current user has favorited. */
const getMyFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'place',
        populate: { path: 'category', select: 'name slug' },
      })
      .sort('-createdAt');

    // Filter out favorites whose place was since deleted or unapproved
    const places = favorites.map((f) => f.place).filter(Boolean);
    res.status(200).json({ success: true, data: places });
  } catch (error) {
    next(error);
  }
};

/** GET /api/places/mine — all listings owned by the current business user, any status. */
const getMyPlaces = async (req, res, next) => {
  try {
    const places = await Place.find({ owner: req.user._id })
      .populate('category', 'name slug parent')
      .populate('subcategory', 'name slug parent')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: places });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlaces,
  getPlaceById,
  getTrending,
  getMyPlaces,
  getMyFavorites,
  createPlace,
  updatePlace,
  deletePlace,
  toggleFavorite,
};
