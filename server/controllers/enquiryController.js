const Enquiry = require('../models/Enquiry');
const Place = require('../models/Place');
const Notification = require('../models/Notification');
const { AppError } = require('../middleware/errorHandler');

/** POST /api/enquiries — submitted from a business details page's contact form. */
const createEnquiry = async (req, res, next) => {
  try {
    const { place, name, email, phone, message } = req.body;

    const placeDoc = await Place.findById(place);
    if (!placeDoc || placeDoc.status !== 'approved') {
      return next(new AppError('This listing is not currently accepting enquiries.', 400));
    }

    const enquiry = await Enquiry.create({
      place,
      user: req.user?._id || null,
      name,
      email,
      phone,
      message,
    });

    await Notification.create({
      user: placeDoc.owner,
      title: 'New enquiry received',
      message: `${name} sent an enquiry about ${placeDoc.name}.`,
      type: 'enquiry',
      link: `/business/dashboard/enquiries`,
    });

    res.status(201).json({ success: true, message: 'Your enquiry has been sent.', data: enquiry });
  } catch (error) {
    next(error);
  }
};

/** GET /api/enquiries/me — enquiries the current user has sent. */
const getMyEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find({ user: req.user._id })
      .populate('place', 'name slug images')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    next(error);
  }
};

/** GET /api/enquiries/business — enquiries received across all of the current business owner's listings. */
const getBusinessEnquiries = async (req, res, next) => {
  try {
    const myPlaces = await Place.find({ owner: req.user._id }).select('_id');
    const enquiries = await Enquiry.find({ place: { $in: myPlaces.map((p) => p._id) } })
      .populate('place', 'name slug')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: enquiries });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/enquiries/:id/status — business owner marks an enquiry responded/closed. */
const updateEnquiryStatus = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id).populate('place');
    if (!enquiry) return next(new AppError('Enquiry not found.', 404));
    if (enquiry.place.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('You do not have permission to update this enquiry.', 403));
    }
    enquiry.status = req.body.status;
    await enquiry.save();
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    next(error);
  }
};

module.exports = { createEnquiry, getMyEnquiries, getBusinessEnquiries, updateEnquiryStatus };
