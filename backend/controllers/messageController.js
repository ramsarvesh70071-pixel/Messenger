const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const { encryptText, decryptText } = require('../utils/encryption');
const { getIO, getSocketIdsForUser, isUserOnline } = require('../socket/socketState');
const logger = require('../utils/logger');

function decryptMessage(messageDoc) {
    const obj = messageDoc.toObject ? messageDoc.toObject() : messageDoc;
    return { ...obj, text: decryptText(obj.text) };
}

// @desc    Send a message (1-to-1). REST fallback alongside the socket 'send_message' event.
// @route   POST /api/messages/send
// @access  Private
const sendMessage = async (req, res, next) => {
    try {
        const { recipient, text, replyTo } = req.body;
        const sender = req.user._id;

        const recipientUser = await User.findById(recipient);
        if (!recipientUser) {
            return res.status(404).json({ error: 'Recipient not found.' });
        }
        if (recipientUser.blockedUsers.includes(String(sender))) {
            return res.status(403).json({ error: 'You cannot message this user.' });
        }

        const newMessage = await Message.create({
            sender,
            recipient,
            text: encryptText(text),
            replyTo: replyTo || null,
            status: 'sent'
        });

        const populated = await Message.findById(newMessage._id)
            .populate('sender', 'name avatar phoneNumber')
            .populate('replyTo');

        const payload = decryptMessage(populated);

        const io = getIO();
        if (io) {
            io.to(`user:${recipient}`).emit('receive_message', payload);
        }

        res.status(201).json(payload);
    } catch (error) {
        next(error);
    }
};

// @desc    Get paginated conversation between logged-in user and another user
// @route   GET /api/messages/:userId?page=1&limit=30
// @access  Private
const getConversation = async (req, res, next) => {
    try {
        const myId = req.user._id;
        const { userId } = req.params;
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 30, 100);
        const skip = (page - 1) * limit;

        const filter = {
            $or: [
                { sender: myId, recipient: userId },
                { sender: userId, recipient: myId }
            ],
            deletedFor: { $ne: myId }
        };

        const [messages, total] = await Promise.all([
            Message.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('sender', 'name avatar phoneNumber')
                .populate('replyTo')
                .populate('reactions.user', 'name avatar'),
            Message.countDocuments(filter)
        ]);

        const decrypted = messages.reverse().map(decryptMessage);

        res.status(200).json({
            messages: decrypted,
            page,
            limit,
            totalMessages: total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Edit a message (only sender, within reasonable time, not group-restricted here)
// @route   PUT /api/messages/:messageId
// @access  Private
const editMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { text } = req.body;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: 'Message not found.' });

        if (String(message.sender) !== String(req.user._id)) {
            return res.status(403).json({ error: 'You can only edit your own messages.' });
        }
        if (message.isDeletedForEveryone) {
            return res.status(400).json({ error: 'Cannot edit a deleted message.' });
        }

        message.text = encryptText(text);
        message.isEdited = true;
        await message.save();

        const payload = decryptMessage(message);

        const io = getIO();
        if (io) {
            if (message.recipient) io.to(`user:${message.recipient}`).emit('message_edited', payload);
            if (message.group) io.to(`group:${message.group}`).emit('message_edited', payload);
        }

        res.status(200).json(payload);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a message - "for me" (default) or "for everyone" (?mode=everyone, sender only)
// @route   DELETE /api/messages/:messageId?mode=me|everyone
// @access  Private
const deleteMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const mode = req.query.mode === 'everyone' ? 'everyone' : 'me';

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: 'Message not found.' });

        if (mode === 'everyone') {
            if (String(message.sender) !== String(req.user._id)) {
                return res.status(403).json({ error: 'Only the sender can delete a message for everyone.' });
            }
            message.isDeletedForEveryone = true;
            message.text = encryptText('This message was deleted.');
            await message.save();

            const io = getIO();
            if (io) {
                if (message.recipient) io.to(`user:${message.recipient}`).emit('message_deleted', { messageId, mode });
                if (message.group) io.to(`group:${message.group}`).emit('message_deleted', { messageId, mode });
            }
        } else {
            await Message.findByIdAndUpdate(messageId, { $addToSet: { deletedFor: req.user._id } });
        }

        res.status(200).json({ message: `Message deleted (${mode}).` });
    } catch (error) {
        next(error);
    }
};

// @desc    React to a message with an emoji (toggles/replaces the user's reaction)
// @route   POST /api/messages/:messageId/react
// @access  Private
const reactToMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;

        await Message.findByIdAndUpdate(messageId, { $pull: { reactions: { user: req.user._id } } });
        const updated = await Message.findByIdAndUpdate(
            messageId,
            { $push: { reactions: { user: req.user._id, emoji } } },
            { new: true }
        ).populate('reactions.user', 'name avatar');

        const io = getIO();
        if (io) {
            const eventPayload = { messageId, reactions: updated.reactions };
            if (updated.recipient) io.to(`user:${updated.recipient}`).emit('reaction_update', eventPayload);
            if (updated.group) io.to(`group:${updated.group}`).emit('reaction_update', eventPayload);
        }

        res.status(200).json(updated.reactions);
    } catch (error) {
        next(error);
    }
};

// @desc    Search messages by text content within a conversation
// @route   GET /api/messages/:userId/search?q=keyword
// @access  Private
const searchMessages = async (req, res, next) => {
    try {
        const myId = req.user._id;
        const { userId } = req.params;
        const { q } = req.query;

        if (!q) return res.status(400).json({ error: 'Query parameter "q" is required.' });

        // Text is encrypted at rest, so we fetch the conversation and filter after decrypting.
        const messages = await Message.find({
            $or: [
                { sender: myId, recipient: userId },
                { sender: userId, recipient: myId }
            ],
            deletedFor: { $ne: myId }
        })
            .sort({ createdAt: -1 })
            .limit(500)
            .populate('sender', 'name avatar');

        const matches = messages
            .map(decryptMessage)
            .filter((m) => m.text.toLowerCase().includes(q.toLowerCase()));

        res.status(200).json(matches);
    } catch (error) {
        next(error);
    }
};

// @desc    Clear an entire conversation for the logged-in user only
// @route   DELETE /api/messages/conversation/:userId
// @access  Private
const clearConversation = async (req, res, next) => {
    try {
        const myId = req.user._id;
        const { userId } = req.params;

        await Message.updateMany(
            {
                $or: [
                    { sender: myId, recipient: userId },
                    { sender: userId, recipient: myId }
                ]
            },
            { $addToSet: { deletedFor: myId } }
        );

        res.status(200).json({ message: 'Conversation cleared.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Forward an existing message to another user or group
// @route   POST /api/messages/:messageId/forward
// @body    { recipient?, group? }
// @access  Private
const forwardMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { recipient, group } = req.body;

        if (!recipient && !group) {
            return res.status(400).json({ error: 'Provide a recipient or group to forward to.' });
        }

        const original = await Message.findById(messageId);
        if (!original || original.isDeletedForEveryone) {
            return res.status(404).json({ error: 'Message not found or was deleted.' });
        }

        if (recipient) {
            const recipientUser = await User.findById(recipient);
            if (!recipientUser) return res.status(404).json({ error: 'Recipient not found.' });
            if (recipientUser.blockedUsers.includes(String(req.user._id))) {
                return res.status(403).json({ error: 'You cannot message this user.' });
            }
        }

        const forwarded = await Message.create({
            sender: req.user._id,
            recipient: recipient || null,
            group: group || null,
            text: original.text, // already encrypted - copied as-is
            status: 'sent',
            isForwarded: true,
            forwardedFrom: original._id
        });

        const populated = await Message.findById(forwarded._id)
            .populate('sender', 'name avatar phoneNumber')
            .populate('forwardedFrom');

        const payload = decryptMessage(populated);
        if (payload.forwardedFrom) {
            payload.forwardedFrom = { ...payload.forwardedFrom, text: decryptText(payload.forwardedFrom.text) };
        }

        const io = getIO();
        if (io) {
            if (recipient) io.to(`user:${recipient}`).emit('receive_message', payload);
            if (group) io.to(`group:${group}`).emit('receive_message', payload);
        }

        res.status(201).json(payload);
    } catch (error) {
        next(error);
    }
};

// @desc    Star or unstar a message for the logged-in user (personal, doesn't notify anyone)
// @route   POST /api/messages/:messageId/star
// @access  Private
const toggleStarMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: 'Message not found.' });

        const alreadyStarred = message.starredBy.some((id) => String(id) === String(req.user._id));
        if (alreadyStarred) {
            message.starredBy = message.starredBy.filter((id) => String(id) !== String(req.user._id));
        } else {
            message.starredBy.push(req.user._id);
        }
        await message.save();

        res.status(200).json({ starred: !alreadyStarred });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all messages the logged-in user has starred, across every conversation
// @route   GET /api/messages/starred
// @access  Private
const getStarredMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({ starredBy: req.user._id })
            .sort({ createdAt: -1 })
            .populate('sender', 'name avatar')
            .populate('recipient', 'name avatar')
            .populate('group', 'name avatar');

        res.status(200).json(messages.map(decryptMessage));
    } catch (error) {
        next(error);
    }
};

// @desc    Pin or unpin a message inside its chat (visible to everyone in that chat)
// @route   POST /api/messages/:messageId/pin
// @body    { pinned: boolean }
// @access  Private
const togglePinMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { pinned } = req.body;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ error: 'Message not found.' });

        message.isPinned = !!pinned;
        message.pinnedAt = pinned ? new Date() : null;
        message.pinnedBy = pinned ? req.user._id : null;
        await message.save();

        const payload = decryptMessage(message);

        const io = getIO();
        if (io) {
            if (message.recipient) io.to(`user:${message.recipient}`).emit('message_pin_update', payload);
            if (message.group) io.to(`group:${message.group}`).emit('message_pin_update', payload);
        }

        res.status(200).json(payload);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all pinned messages for a direct chat or a group
// @route   GET /api/messages/:chatType/:chatId/pinned
// @access  Private
const getPinnedMessages = async (req, res, next) => {
    try {
        const { chatType, chatId } = req.params;
        const myId = req.user._id;

        const filter =
            chatType === 'group'
                ? { group: chatId, isPinned: true }
                : {
                      isPinned: true,
                      $or: [
                          { sender: myId, recipient: chatId },
                          { sender: chatId, recipient: myId }
                      ]
                  };

        const messages = await Message.find(filter)
            .sort({ pinnedAt: -1 })
            .populate('sender', 'name avatar')
            .populate('pinnedBy', 'name');

        res.status(200).json(messages.map(decryptMessage));
    } catch (error) {
        next(error);
    }
};

module.exports = {
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
};
