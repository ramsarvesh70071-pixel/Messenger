const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { getChatList } = require('../controllers/chatController');
const {
    setArchived,
    setMuted,
    setPinned,
    markRead,
    markUnread,
    exportChat,
    getArchivedChatSettings
} = require('../controllers/chatSettingsController');

const router = express.Router();

router.use(protect);

const chatTypeParam = param('chatType').isIn(['direct', 'group']).withMessage('chatType must be "direct" or "group"');

router.get('/', getChatList);
router.get('/archived', getArchivedChatSettings);

router.put(
    '/:chatType/:chatId/archive',
    [chatTypeParam, body('archived').isBoolean().withMessage('archived must be true/false')],
    validate,
    setArchived
);
router.put(
    '/:chatType/:chatId/mute',
    [chatTypeParam, body('muted').isBoolean().withMessage('muted must be true/false')],
    validate,
    setMuted
);
router.put(
    '/:chatType/:chatId/pin',
    [chatTypeParam, body('pinned').isBoolean().withMessage('pinned must be true/false')],
    validate,
    setPinned
);
router.put('/:chatType/:chatId/read', [chatTypeParam], validate, markRead);
router.put('/:chatType/:chatId/unread', [chatTypeParam], validate, markUnread);
router.get('/:chatType/:chatId/export', [chatTypeParam], validate, exportChat);

module.exports = router;
