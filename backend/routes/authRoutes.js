const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { register, login, refresh, logout, logoutAll, deleteAccount } = require('../controllers/authController');

const router = express.Router();

router.post(
    '/register',
    authLimiter,
    [
        body('email').optional().isEmail().withMessage('Must be a valid email').normalizeEmail(),
        body('phoneNumber')
            .optional()
            .isLength({ min: 7, max: 15 }).withMessage('Phone number must be between 7 and 15 digits'),
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('password')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    ],
    validate,
    register
);

router.post(
    '/login',
    authLimiter,
    [
        body('email').optional().isEmail().withMessage('Must be a valid email'),
        body('phoneNumber').optional().isString(),
        body('password').notEmpty().withMessage('Password is required')
    ],
    validate,
    login
);

router.post(
    '/refresh',
    [body('refreshToken').notEmpty().withMessage('refreshToken is required')],
    validate,
    refresh
);

router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);

router.delete(
    '/account',
    protect,
    [body('password').notEmpty().withMessage('password is required to confirm deletion')],
    validate,
    deleteAccount
);

module.exports = router;
