const Location = require('../models/Location');
const { AppError } = require('../middleware/errorHandler');

/** GET /api/locations/states */
const getStates = async (req, res, next) => {
  try {
    const states = await Location.find({ level: 'state', status: 'active' })
      .select('name slug')
      .sort('name');
    res.status(200).json({ success: true, data: states });
  } catch (error) {
    next(error);
  }
};

/** GET /api/locations/districts/:stateId */
const getDistricts = async (req, res, next) => {
  try {
    const districts = await Location.find({
      level: 'district',
      parent: req.params.stateId,
      status: 'active',
    })
      .select('name slug parent')
      .sort('name');
    res.status(200).json({ success: true, data: districts });
  } catch (error) {
    next(error);
  }
};

/** GET /api/locations/cities/:districtId */
const getCities = async (req, res, next) => {
  try {
    const cities = await Location.find({
      level: 'city',
      parent: req.params.districtId,
      status: 'active',
    })
      .select('name slug parent')
      .sort('name');
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    next(error);
  }
};

/** GET /api/locations/areas/:cityId */
const getAreas = async (req, res, next) => {
  try {
    const areas = await Location.find({
      level: 'area',
      parent: req.params.cityId,
      status: 'active',
    })
      .select('name slug parent')
      .sort('name');
    res.status(200).json({ success: true, data: areas });
  } catch (error) {
    next(error);
  }
};

/** GET /api/locations/resolve?state=andhra-pradesh&district=...&city=... — slug -> ids, for SEO-friendly URLs */
const resolveBySlug = async (req, res, next) => {
  try {
    const { state, district, city, area } = req.query;
    const result = {};

    if (state) {
      const stateDoc = await Location.findOne({ level: 'state', slug: state });
      if (!stateDoc) return next(new AppError('State not found.', 404));
      result.state = stateDoc;

      if (district) {
        const districtDoc = await Location.findOne({
          level: 'district',
          slug: district,
          parent: stateDoc._id,
        });
        if (!districtDoc) return next(new AppError('District not found.', 404));
        result.district = districtDoc;

        if (city) {
          const cityDoc = await Location.findOne({
            level: 'city',
            slug: city,
            parent: districtDoc._id,
          });
          if (!cityDoc) return next(new AppError('City not found.', 404));
          result.city = cityDoc;

          if (area) {
            const areaDoc = await Location.findOne({
              level: 'area',
              slug: area,
              parent: cityDoc._id,
            });
            if (areaDoc) result.area = areaDoc;
          }
        }
      }
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// --- Admin CRUD ---

const createLocation = async (req, res, next) => {
  try {
    const { name, level, parent } = req.body;
    if (level !== 'state' && !parent) {
      return next(new AppError(`A parent is required for level "${level}".`, 400));
    }
    const location = await Location.create({ name, level, parent: parent || null });
    res.status(201).json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
};

const updateLocation = async (req, res, next) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!location) return next(new AppError('Location not found.', 404));
    res.status(200).json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
};

const deleteLocation = async (req, res, next) => {
  try {
    const childExists = await Location.exists({ parent: req.params.id });
    if (childExists) {
      return next(
        new AppError('Cannot delete a location that still has child locations.', 400)
      );
    }
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) return next(new AppError('Location not found.', 404));
    res.status(200).json({ success: true, message: 'Location deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStates,
  getDistricts,
  getCities,
  getAreas,
  resolveBySlug,
  createLocation,
  updateLocation,
  deleteLocation,
};
