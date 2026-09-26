const Report = require('../models/Report');
const { AppError } = require('../middleware/errorHandler');

/** POST /api/reports */
const createReport = async (req, res, next) => {
  try {
    const { place, reason, description } = req.body;
    const report = await Report.create({ user: req.user._id, place, reason, description });
    res.status(201).json({
      success: true,
      message: 'Thanks — our team will review this listing shortly.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/** GET /api/admin/reports */
const getReportsAdmin = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const reports = await Report.find(filter)
      .populate('user', 'name email')
      .populate('place', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/admin/reports/:id */
const updateReportAdmin = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!report) return next(new AppError('Report not found.', 404));
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

module.exports = { createReport, getReportsAdmin, updateReportAdmin };
