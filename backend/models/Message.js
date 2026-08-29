const mongoose = require('mongoose');

const ReactionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        emoji: { type: String, required: true }
    },
    { _id: false }
);

const MessageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        // For 1-to-1 chats
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        // For group chats
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            default: null
        },
        text: {
            type: String,
            required: true
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            default: null
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'read'],
            default: 'sent'
        },
        deliveredTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        reactions: [ReactionSchema],
        isEdited: {
            type: Boolean,
            default: false
        },
        isDeletedForEveryone: {
            type: Boolean,
            default: false
        },
        deletedFor: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        // Starring is personal - each user has their own starred list, doesn't affect anyone else
        starredBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        // Pinning a message inside a chat is visible to everyone in that chat
        isPinned: {
            type: Boolean,
            default: false
        },
        pinnedAt: {
            type: Date,
            default: null
        },
        pinnedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        // Forwarding keeps a reference to the original message for provenance
        isForwarded: {
            type: Boolean,
            default: false
        },
        forwardedFrom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            default: null
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

MessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
MessageSchema.index({ group: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
