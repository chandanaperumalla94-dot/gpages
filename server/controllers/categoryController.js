const Category = require('../models/Category');
const { AppError } = require('../middleware/errorHandler');

/** GET /api/categories — public, dynamically loaded (never hard-coded in the frontend) */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ status: 'active' }).populate('parent', 'name slug').sort('order name');
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const getCategoryBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, status: 'active' });
    if (!category) return next(new AppError('Category not found.', 404));
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// --- Admin CRUD ---

const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return next(new AppError('Category not found.', 404));
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return next(new AppError('Category not found.', 404));
    res.status(200).json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};
