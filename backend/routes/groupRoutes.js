const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { messageLimiter } = require('../middleware/rateLimiter');
const {
    createGroup,
    getGroup,
    getMyGroups,
    updateMembers,
    sendGroupMessage,
    getGroupMessages,
    leaveGroup
} = require('../controllers/groupController');

const router = express.Router();

router.use(protect);

router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Group name is required'),
        body('members').isArray({ min: 1 }).withMessage('members must be a non-empty array of user IDs')
    ],
    validate,
    createGroup
);

router.get('/', getMyGroups);
router.get('/:groupId', getGroup);
router.put(
    '/:groupId/members',
    [
        body('action').isIn(['add', 'remove']).withMessage('action must be "add" or "remove"'),
        body('userIds').isArray({ min: 1 }).withMessage('userIds must be a non-empty array')
    ],
    validate,
    updateMembers
);
router.delete('/:groupId/leave', leaveGroup);

router.post(
    '/:groupId/messages',
    messageLimiter,
    [body('text').trim().notEmpty().withMessage('text is required')],
    validate,
    sendGroupMessage
);
router.get('/:groupId/messages', getGroupMessages);

module.exports = router;
