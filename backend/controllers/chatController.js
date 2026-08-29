const mongoose = require('mongoose');
const Message = require('../models/Message');
const Group = require('../models/Group');
const ChatSettings = require('../models/ChatSettings');
const { decryptText } = require('../utils/encryption');

// @desc    Get the combined chat list (1-to-1 + groups) sorted pinned-first, then by recent
//          activity. Archived chats are hidden unless ?includeArchived=true is passed.
// @route   GET /api/chats?includeArchived=false
// @access  Private
const getChatList = async (req, res, next) => {
    try {
        const myId = new mongoose.Types.ObjectId(req.user._id);
        const includeArchived = req.query.includeArchived === 'true';

        // ---- 1-to-1 conversations ----
        const directChats = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: myId }, { recipient: myId }],
                    group: null,
                    deletedFor: { $ne: myId }
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [{ $eq: ['$sender', myId] }, '$recipient', '$sender']
                    },
                    lastMessage: { $first: '$$ROOT' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'partner'
                }
            },
            { $unwind: '$partner' }
        ]);

        // Unread counts per partner (messages sent TO me, not yet read, not deleted for me)
        const unreadAgg = await Message.aggregate([
            {
                $match: {
                    recipient: myId,
                    status: { $ne: 'read' },
                    deletedFor: { $ne: myId }
                }
            },
            { $group: { _id: '$sender', count: { $sum: 1 } } }
        ]);
        const unreadMap = new Map(unreadAgg.map((u) => [String(u._id), u.count]));

        // ---- Per-user chat settings (archive/mute/pin/manual-unread) ----
        const allSettings = await ChatSettings.find({ user: myId });
        const settingsMap = new Map(allSettings.map((s) => [`${s.chatType}:${s.chatId}`, s]));

        const directChatList = directChats.map((chat) => {
            const settings = settingsMap.get(`direct:${chat.partner._id}`);
            return {
                type: 'direct',
                chatId: chat.partner._id,
                name: chat.partner.name,
                avatar: chat.partner.avatar,
                isOnline: chat.partner.isOnline,
                lastSeen: chat.partner.lastSeen,
                lastMessage: {
                    text: decryptText(chat.lastMessage.text),
                    sender: chat.lastMessage.sender,
                    status: chat.lastMessage.status,
                    createdAt: chat.lastMessage.createdAt
                },
                unreadCount:
                    settings?.manuallyMarkedUnread && !(unreadMap.get(String(chat.partner._id)) > 0)
                        ? 1
                        : unreadMap.get(String(chat.partner._id)) || 0,
                isArchived: settings?.isArchived || false,
                isMuted: settings?.isMuted || false,
                isPinned: settings?.isPinned || false,
                pinnedAt: settings?.pinnedAt || null,
                updatedAt: chat.lastMessage.createdAt
            };
        });

        // ---- Group conversations ----
        const groups = await Group.find({ members: myId });
        const groupChatList = await Promise.all(
            groups.map(async (group) => {
                const lastMsg = await Message.findOne({ group: group._id })
                    .sort({ createdAt: -1 })
                    .populate('sender', 'name');

                const unreadCount = await Message.countDocuments({
                    group: group._id,
                    readBy: { $ne: myId },
                    sender: { $ne: myId }
                });

                const settings = settingsMap.get(`group:${group._id}`);

                return {
                    type: 'group',
                    chatId: group._id,
                    name: group.name,
                    avatar: group.avatar,
                    memberCount: group.members.length,
                    lastMessage: lastMsg
                        ? {
                              text: decryptText(lastMsg.text),
                              sender: lastMsg.sender,
                              status: lastMsg.status,
                              createdAt: lastMsg.createdAt
                          }
                        : null,
                    unreadCount: settings?.manuallyMarkedUnread && unreadCount === 0 ? 1 : unreadCount,
                    isArchived: settings?.isArchived || false,
                    isMuted: settings?.isMuted || false,
                    isPinned: settings?.isPinned || false,
                    pinnedAt: settings?.pinnedAt || null,
                    updatedAt: lastMsg ? lastMsg.createdAt : group.updatedAt
                };
            })
        );

        let combined = [...directChatList, ...groupChatList];

        if (!includeArchived) {
            combined = combined.filter((c) => !c.isArchived);
        }

        // Pinned chats first (most recently pinned first within that group), then by activity
        combined.sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            if (a.isPinned && b.isPinned) return new Date(b.pinnedAt) - new Date(a.pinnedAt);
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

        res.status(200).json(combined);
    } catch (error) {
        next(error);
    }
};

module.exports = { getChatList };
