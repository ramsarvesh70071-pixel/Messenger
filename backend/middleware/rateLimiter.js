const rateLimit = require('express-rate-limit');

// General API limiter - protects the whole API from abuse/spam
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // limit each IP to 300 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' }
});

// Stricter limiter for auth routes to prevent brute-force login/register attempts
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many auth attempts. Please try again in 15 minutes.' }
});

// Limiter specifically for sending messages to prevent spam
const messageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 messages per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'You are sending messages too fast. Please slow down.' }
});

module.exports = { generalLimiter, authLimiter, messageLimiter };
