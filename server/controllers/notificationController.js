const Notification = require('../models/Notification');
const { AppError } = require('../middleware/errorHandler');

/** GET /api/notifications — the current user's notifications, newest first. */
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
    res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/notifications/:id/read */
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return next(new AppError('Notification not found.', 404));
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

/** PUT /api/notifications/read-all */
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
