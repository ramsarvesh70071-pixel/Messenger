const logger = require('../utils/logger');

// Handles routes that don't exist
const notFound = (req, res, next) => {
    res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
};

// Centralized error handler - catches errors passed via next(err) and thrown in async routes
const errorHandler = (err, req, res, next) => {
    logger.error(err.stack || err.message);

    let statusCode = err.statusCode && err.statusCode !== 200 ? err.statusCode : 500;
    let message = err.message || 'Internal Server Error';

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid resource id: ${err.value}`;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0];
        message = `Duplicate value for field: ${field}`;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((val) => val.message).join(', ');
    }

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = { notFound, errorHandler };
