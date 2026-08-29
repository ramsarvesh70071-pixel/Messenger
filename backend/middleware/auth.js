const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'Not authorized. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Reject refresh tokens presented as access tokens (they're signed with a different
        // secret anyway, but this guards against JWT_SECRET === JWT_REFRESH_SECRET misconfig)
        if (decoded.type && decoded.type !== 'access') {
            return res.status(401).json({ error: 'Not authorized. Wrong token type.' });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.isDeleted) {
            return res.status(401).json({ error: 'Not authorized. User no longer exists.' });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Not authorized. Invalid or expired token.' });
    }
};

module.exports = { protect };
