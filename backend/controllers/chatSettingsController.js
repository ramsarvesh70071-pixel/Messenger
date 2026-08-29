const ChatSettings = require('../models/ChatSettings');
const Message = require('../models/Message');
const Group = require('../models/Group');
const User = require('../models/User');
const { decryptText } = require('../utils/encryption');

async function getOrCreateSettings(userId, chatType, chatId) {
    let settings = await ChatSettings.findOne({ user: userId, chatType, chatId });
    if (!settings) {
        settings = await ChatSettings.create({ user: userId, chatType, chatId });
    }
    return settings;
}

// @desc    Archive or unarchive a chat (direct or group) for the logged-in user only
// @route   PUT /api/chats/:chatType/:chatId/archive
// @body    { archived: boolean }
// @access  Private
const setArchived = async (req, res, next) => {
    try {
        const { chatType, chatId } = req.params;
        const { archived } = req.body;

        const settings = await getOrCreateSettings(req.user._id, chatType, chatId);
        settings.isArchived = !!archived;
        await settings.save();

        res.status(200).json(settings);
    } catch (error) {
        next(error);
    }
};

// @desc    Mute or unmute a chat, optionally until a specific time
// @route   PUT /api/chats/:chatType/:chatId/mute
// @body    { muted: boolean, mutedUntil?: ISODate }
// @access  Private
const setMuted = async (req, res, next) => {
    try {
        const { chatType, chatId } = req.params;
        const { muted, mutedUntil } = req.body;

        const settings = await getOrCreateSettings(req.user._id, chatType, chatId);
        settings.isMuted = !!muted;
        settings.mutedUntil = muted && mutedUntil ? new Date(mutedUntil) : null;
        await settings.save();

        res.status(200).json(settings);
    } catch (error) {
        next(error);
    }
};

// @desc    Pin or unpin a chat to the top of the chat list (max 3 pinned, like WhatsApp)
// @route   PUT /api/chats/:chatType/:chatId/pin
// @body    { pinned: boolean }
// @access  Private
const setPinned = async (req, res, next) => {
    try {
        const { chatType, chatId } = req.params;
        const { pinned } = req.body;

        if (pinned) {
            const pinnedCount = await ChatSettings.countDocuments({ user: req.user._id, isPinned: true });
            if (pinnedCount >= 3) {
                return res.status(400).json({ error: 'You can only pin up to 3 chats. Unpin one first.' });
            }
        }

        const settings = await getOrCreateSettings(req.user._id, chatType, chatId);
        settings.isPinned = !!pinned;
        settings.pinnedAt = pinned ? new Date() : null;
        await settings.save();

        res.status(200).json(settings);
    } catch (error) {
        next(error);
    }
};

// @desc    Mark an entire chat as read (clears manual-unread flag and marks messages read)
// @route   PUT /api/chats/:chatType/:chatId/read
// @access  Private
const markRead = async (req, res, next) => {
    try {
        const { chatType, chatId } = req.params;

        const settings = await getOrCreateSettings(req.user._id, chatType, chatId);
        settings.manuallyMarkedUnread = false;
        settings.lastReadAt = new Date();
        await settings.save();

        if (chatType === 'direct') {
            await Message.updateMany(
                { sender: chatId, recipient: req.user._id, status: { $ne: 'read' } },
                { status: 'read', $addToSet: { readBy: req.user._id } }
            );
        } else {
            await Message.updateMany(
                { group: chatId, sender: { $ne: req.user._id } },
                { $addToSet: { readBy: req.user._id } }
            );
        }

        res.status(200).json({ message: 'Chat marked as read.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Manually mark a chat as unread (forces the unread badge back on)
// @route   PUT /api/chats/:chatType/:chatId/unread
// @access  Private
const markUnread = async (req, res, next) => {
    try {
        const { chatType, chatId } = req.params;
        const settings = await getOrCreateSettings(req.user._id, chatType, chatId);
        settings.manuallyMarkedUnread = true;
        await settings.save();
        res.status(200).json({ message: 'Chat marked as unread.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Export a chat's full message history as a downloadable plain-text transcript
// @route   GET /api/chats/:chatType/:chatId/export
// @access  Private
const exportChat = async (req, res, next) => {
    try {
        const { chatType, chatId } = req.params;
        const myId = req.user._id;

        let messages;
        let title;

        if (chatType === 'direct') {
            const partner = await User.findById(chatId);
            if (!partner) return res.status(404).json({ error: 'User not found.' });
            title = `Chat with ${partner.name}`;
            messages = await Message.find({
                $or: [
                    { sender: myId, recipient: chatId },
                    { sender: chatId, recipient: myId }
                ],
                deletedFor: { $ne: myId }
            })
                .sort({ createdAt: 1 })
                .populate('sender', 'name');
        } else {
            const group = await Group.findById(chatId);
            if (!group) return res.status(404).json({ error: 'Group not found.' });
            title = `Group: ${group.name}`;
            messages = await Message.find({ group: chatId, deletedFor: { $ne: myId } })
                .sort({ createdAt: 1 })
                .populate('sender', 'name');
        }

        const lines = [
            title,
            `Exported on ${new Date().toLocaleString()}`,
            '='.repeat(40),
            ...messages.map((m) => {
                const time = new Date(m.createdAt).toLocaleString();
                const text = m.isDeletedForEveryone ? '[message deleted]' : decryptText(m.text);
                return `[${time}] ${m.sender?.name || 'Unknown'}: ${text}`;
            })
        ];

        const transcript = lines.join('\n');
        const filename = `${chatType}-chat-${chatId}-export.txt`;

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(200).send(transcript);
    } catch (error) {
        next(error);
    }
};

// @desc    Get the list of archived chats
// @route   GET /api/chats/archived
// @access  Private
const getArchivedChatSettings = async (req, res, next) => {
    try {
        const settings = await ChatSettings.find({ user: req.user._id, isArchived: true });
        res.status(200).json(settings);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    setArchived,
    setMuted,
    setPinned,
    markRead,
    markUnread,
    exportChat,
    getArchivedChatSettings,
    getOrCreateSettings
};
