const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { messageLimiter } = require('../middleware/rateLimiter');
const {
    sendMessage,
    getConversation,
    editMessage,
    deleteMessage,
    reactToMessage,
    searchMessages,
    clearConversation,
    forwardMessage,
    toggleStarMessage,
    getStarredMessages,
    togglePinMessage,
    getPinnedMessages
} = require('../controllers/messageController');

const router = express.Router();

router.use(protect);

router.post(
    '/send',
    messageLimiter,
    [
        body('recipient').notEmpty().withMessage('recipient is required'),
        body('text').trim().notEmpty().withMessage('text is required')
    ],
    validate,
    sendMessage
);

// NOTE: literal routes like /starred and /conversation/:id must be registered
// BEFORE the generic /:userId route, otherwise Express would treat "starred"
// as if it were a userId.
router.get('/starred', getStarredMessages);
router.delete('/conversation/:userId', clearConversation);
router.get('/:chatType/:chatId/pinned', getPinnedMessages);

router.get('/:userId/search', searchMessages);
router.get('/:userId', getConversation);

router.put(
    '/:messageId',
    [body('text').trim().notEmpty().withMessage('text is required')],
    validate,
    editMessage
);
router.delete('/:messageId', deleteMessage);
router.post(
    '/:messageId/react',
    [body('emoji').trim().notEmpty().withMessage('emoji is required')],
    validate,
    reactToMessage
);
router.post(
    '/:messageId/forward',
    messageLimiter,
    [body('recipient').optional(), body('group').optional()],
    validate,
    forwardMessage
);
router.post('/:messageId/star', toggleStarMessage);
router.post(
    '/:messageId/pin',
    [body('pinned').isBoolean().withMessage('pinned must be true/false')],
    validate,
    togglePinMessage
);

module.exports = router;
