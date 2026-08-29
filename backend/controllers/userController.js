const User = require('../models/User');

// @desc    Get current logged-in user's profile
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        next(error);
    }
};

// @desc    Update current user's profile (name, avatar, about)
// @route   PUT /api/users/me
// @access  Private
const updateMe = async (req, res, next) => {
    try {
        const { name, avatar, about } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (avatar !== undefined) updates.avatar = avatar;
        if (about !== undefined) updates.about = about;

        const user = await User.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true
        });

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users (contact list), supports ?search= query, excludes self & blocked
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res, next) => {
    try {
        const { search } = req.query;
        const query = {
            _id: { $ne: req.user._id, $nin: req.user.blockedUsers },
            isDeleted: { $ne: true }
        };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('name phoneNumber email avatar about isOnline lastSeen');
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Block a user
// @route   POST /api/users/block/:userId
// @access  Private
const blockUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (userId === String(req.user._id)) {
            return res.status(400).json({ error: 'You cannot block yourself.' });
        }

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        await User.findByIdAndUpdate(req.user._id, { $addToSet: { blockedUsers: userId } });
        res.status(200).json({ message: `${targetUser.name} has been blocked.` });
    } catch (error) {
        next(error);
    }
};

// @desc    Unblock a user
// @route   POST /api/users/unblock/:userId
// @access  Private
const unblockUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        await User.findByIdAndUpdate(req.user._id, { $pull: { blockedUsers: userId } });
        res.status(200).json({ message: 'User has been unblocked.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get list of blocked users
// @route   GET /api/users/blocked
// @access  Private
const getBlockedUsers = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('blockedUsers', 'name phoneNumber avatar');
        res.status(200).json(user.blockedUsers);
    } catch (error) {
        next(error);
    }
};

module.exports = { getMe, updateMe, getUsers, blockUser, unblockUser, getBlockedUsers };
