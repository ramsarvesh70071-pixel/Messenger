const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Short-lived access token - sent on every request, verified by the auth middleware
const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId, type: 'access' }, process.env.JWT_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
    });
};

// Long-lived refresh token - stored (hashed) in the user's refreshTokens array in MongoDB,
// exchanged for a new access token via POST /api/auth/refresh. Rotated on every use.
const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId, type: 'refresh', jti: crypto.randomUUID() }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'
    });
};

// Refresh tokens are stored hashed (like passwords) so a leaked DB dump can't be replayed directly
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const getRefreshTokenExpiryDate = () => {
    const days = parseInt((process.env.REFRESH_TOKEN_EXPIRES_IN || '30d').replace('d', ''), 10) || 30;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    hashToken,
    getRefreshTokenExpiryDate
};
