const bcrypt = require('bcryptjs');
const User = require('../models/User');
const {
    generateAccessToken,
    generateRefreshToken,
    hashToken,
    getRefreshTokenExpiryDate
} = require('../utils/generateToken');
const logger = require('../utils/logger');

function sanitizeUser(user) {
    return {
        id: user._id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        about: user.about
    };
}

// Issues a fresh access+refresh pair, stores the refresh token (hashed) against the user,
// and prunes any of that user's refresh tokens that have already expired.
async function issueTokenPair(user, deviceInfo) {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const withTokens = await User.findById(user._id).select('+refreshTokens');
    withTokens.refreshTokens = (withTokens.refreshTokens || []).filter((rt) => rt.expiresAt > new Date());
    withTokens.refreshTokens.push({
        token: hashToken(refreshToken),
        deviceInfo: deviceInfo || 'unknown device',
        expiresAt: getRefreshTokenExpiryDate()
    });
    await withTokens.save();

    return { accessToken, refreshToken };
}

// @desc    Register a new user (email and/or phone number, at least one required)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { phoneNumber, email, name, password } = req.body;

        if (!phoneNumber && !email) {
            return res.status(400).json({ error: 'Either phoneNumber or email is required.' });
        }

        const orConditions = [];
        if (phoneNumber) orConditions.push({ phoneNumber });
        if (email) orConditions.push({ email: email.toLowerCase() });

        const existingUser = await User.findOne({ $or: orConditions });
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this phone number or email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            phoneNumber: phoneNumber || undefined,
            email: email ? email.toLowerCase() : undefined,
            name,
            password: hashedPassword
        });

        const { accessToken, refreshToken } = await issueTokenPair(user, req.headers['user-agent']);

        logger.info(`New user registered: ${email || phoneNumber}`);

        res.status(201).json({ accessToken, refreshToken, user: sanitizeUser(user) });
    } catch (error) {
        next(error);
    }
};

// @desc    Login with either phoneNumber or email + password
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { phoneNumber, email, password } = req.body;

        if (!phoneNumber && !email) {
            return res.status(400).json({ error: 'Provide a phoneNumber or email to log in.' });
        }

        const query = email ? { email: email.toLowerCase() } : { phoneNumber };
        const user = await User.findOne(query).select('+password');

        if (!user || user.isDeleted) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const { accessToken, refreshToken } = await issueTokenPair(user, req.headers['user-agent']);

        res.status(200).json({ accessToken, refreshToken, user: sanitizeUser(user) });
    } catch (error) {
        next(error);
    }
};

// @desc    Exchange a valid refresh token for a new access token (rotates the refresh token too)
// @route   POST /api/auth/refresh
// @access  Public (requires a valid refreshToken in the body)
const refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ error: 'refreshToken is required.' });
        }

        const jwt = require('jsonwebtoken');
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            return res.status(401).json({ error: 'Refresh token is invalid or expired. Please log in again.' });
        }

        const user = await User.findById(decoded.id).select('+refreshTokens');
        if (!user || user.isDeleted) {
            return res.status(401).json({ error: 'User no longer exists.' });
        }

        const hashed = hashToken(refreshToken);
        const stored = user.refreshTokens.find((rt) => rt.token === hashed);
        if (!stored || stored.expiresAt < new Date()) {
            // Possible token reuse/theft - wipe all sessions for safety
            user.refreshTokens = [];
            await user.save();
            return res.status(401).json({ error: 'Session no longer valid. Please log in again.' });
        }

        // Rotate: remove the used refresh token, issue a brand new pair
        user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== hashed);
        await user.save();

        const { accessToken, refreshToken: newRefreshToken } = await issueTokenPair(user, stored.deviceInfo);

        res.status(200).json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout the current device only (invalidate just this refresh token)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            const hashed = hashToken(refreshToken);
            await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: { token: hashed } } });
        }
        res.status(200).json({ message: 'Logged out.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout of every device (invalidate all refresh tokens for this account)
// @route   POST /api/auth/logout-all
// @access  Private
const logoutAll = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { $set: { refreshTokens: [] } });
        res.status(200).json({ message: 'Logged out of all devices.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Permanently delete the logged-in user's account (requires password confirmation)
// @route   DELETE /api/auth/account
// @access  Private
const deleteAccount = async (req, res, next) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await bcrypt.compare(password || '', user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password. Account was not deleted.' });
        }

        // Soft delete: keeps message history intact for other users' conversations,
        // but the account can no longer log in, be found in search, or be messaged.
        user.isDeleted = true;
        user.refreshTokens = [];
        user.name = 'Deleted User';
        user.avatar = 'https://api.dicebear.com/7.x/initials/svg?seed=Deleted';
        user.about = 'This account has been deleted.';
        user.phoneNumber = undefined;
        user.email = undefined;
        await user.save();

        res.status(200).json({ message: 'Account deleted.' });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, refresh, logout, logoutAll, deleteAccount };
