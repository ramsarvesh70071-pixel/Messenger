const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
    getMe,
    updateMe,
    getUsers,
    blockUser,
    unblockUser,
    getBlockedUsers
} = require('../controllers/userController');

const router = express.Router();

router.use(protect); // every route below requires a valid JWT

router.get('/me', getMe);
router.put(
    '/me',
    [
        body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
        body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
        body('about').optional().isLength({ max: 200 }).withMessage('About must be under 200 characters')
    ],
    validate,
    updateMe
);

router.get('/', getUsers);
router.get('/blocked', getBlockedUsers);
router.post('/block/:userId', blockUser);
router.post('/unblock/:userId', unblockUser);

module.exports = router;
