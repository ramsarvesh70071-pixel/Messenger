const mongoose = require('mongoose');

// One document per (user, chat) pair, where "chat" is either another user (direct)
// or a group. This drives archive/mute/pin/manual-unread state shown in the chat list,
// WITHOUT affecting the other participant's view of the same conversation.
const ChatSettingsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        chatType: {
            type: String,
            enum: ['direct', 'group'],
            required: true
        },
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        isArchived: {
            type: Boolean,
            default: false
        },
        isMuted: {
            type: Boolean,
            default: false
        },
        mutedUntil: {
            type: Date,
            default: null // null + isMuted true == muted forever
        },
        isPinned: {
            type: Boolean,
            default: false
        },
        pinnedAt: {
            type: Date,
            default: null
        },
        // When true, forces the chat to show as unread even if every message has been read.
        // Cleared automatically the next time the user opens/reads the chat.
        manuallyMarkedUnread: {
            type: Boolean,
            default: false
        },
        lastReadAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

ChatSettingsSchema.index({ user: 1, chatType: 1, chatId: 1 }, { unique: true });

module.exports = mongoose.model('ChatSettings', ChatSettingsSchema);
