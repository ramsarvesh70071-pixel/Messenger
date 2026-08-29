const Group = require('../models/Group');
const Message = require('../models/Message');
const { encryptText, decryptText } = require('../utils/encryption');
const { getIO } = require('../socket/socketState');

function decryptMessage(messageDoc) {
    const obj = messageDoc.toObject ? messageDoc.toObject() : messageDoc;
    return { ...obj, text: decryptText(obj.text) };
}

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res, next) => {
    try {
        const { name, members, avatar, description } = req.body;

        const allMembers = Array.from(new Set([...(members || []), String(req.user._id)]));

        const group = await Group.create({
            name,
            avatar,
            description,
            createdBy: req.user._id,
            admins: [req.user._id],
            members: allMembers
        });

        const populated = await Group.findById(group._id)
            .populate('members', 'name avatar phoneNumber')
            .populate('admins', 'name avatar');

        const io = getIO();
        if (io) {
            allMembers.forEach((memberId) => io.to(`user:${memberId}`).emit('added_to_group', populated));
        }

        res.status(201).json(populated);
    } catch (error) {
        next(error);
    }
};

// @desc    Get group details
// @route   GET /api/groups/:groupId
// @access  Private
const getGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.groupId)
            .populate('members', 'name avatar phoneNumber isOnline lastSeen')
            .populate('admins', 'name avatar');

        if (!group) return res.status(404).json({ error: 'Group not found.' });
        if (!group.members.some((m) => String(m._id) === String(req.user._id))) {
            return res.status(403).json({ error: 'You are not a member of this group.' });
        }

        res.status(200).json(group);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all groups the logged-in user belongs to
// @route   GET /api/groups
// @access  Private
const getMyGroups = async (req, res, next) => {
    try {
        const groups = await Group.find({ members: req.user._id })
            .populate('members', 'name avatar')
            .sort({ updatedAt: -1 });
        res.status(200).json(groups);
    } catch (error) {
        next(error);
    }
};

// @desc    Add or remove members (admin only)
// @route   PUT /api/groups/:groupId/members
// @body    { action: 'add' | 'remove', userIds: [] }
// @access  Private
const updateMembers = async (req, res, next) => {
    try {
        const { action, userIds } = req.body;
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ error: 'Group not found.' });

        if (!group.admins.some((a) => String(a) === String(req.user._id))) {
            return res.status(403).json({ error: 'Only group admins can manage members.' });
        }

        if (action === 'add') {
            userIds.forEach((id) => {
                if (!group.members.some((m) => String(m) === String(id))) group.members.push(id);
            });
        } else if (action === 'remove') {
            group.members = group.members.filter((m) => !userIds.includes(String(m)));
            group.admins = group.admins.filter((a) => !userIds.includes(String(a)));
        } else {
            return res.status(400).json({ error: 'action must be "add" or "remove".' });
        }

        await group.save();
        const populated = await Group.findById(group._id).populate('members', 'name avatar phoneNumber');

        const io = getIO();
        if (io) io.to(`group:${group._id}`).emit('group_updated', populated);

        res.status(200).json(populated);
    } catch (error) {
        next(error);
    }
};

// @desc    Send a message to a group
// @route   POST /api/groups/:groupId/messages
// @access  Private
const sendGroupMessage = async (req, res, next) => {
    try {
        const { text, replyTo } = req.body;
        const { groupId } = req.params;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: 'Group not found.' });
        if (!group.members.some((m) => String(m) === String(req.user._id))) {
            return res.status(403).json({ error: 'You are not a member of this group.' });
        }

        const newMessage = await Message.create({
            sender: req.user._id,
            group: groupId,
            text: encryptText(text),
            replyTo: replyTo || null,
            status: 'sent'
        });

        const populated = await Message.findById(newMessage._id)
            .populate('sender', 'name avatar phoneNumber')
            .populate('replyTo');

        const payload = decryptMessage(populated);

        const io = getIO();
        if (io) io.to(`group:${groupId}`).emit('receive_message', payload);

        res.status(201).json(payload);
    } catch (error) {
        next(error);
    }
};

// @desc    Get paginated group messages
// @route   GET /api/groups/:groupId/messages?page=1&limit=30
// @access  Private
const getGroupMessages = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 30, 100);
        const skip = (page - 1) * limit;

        const group = await Group.findById(groupId);
        if (!group) return res.status(404).json({ error: 'Group not found.' });
        if (!group.members.some((m) => String(m) === String(req.user._id))) {
            return res.status(403).json({ error: 'You are not a member of this group.' });
        }

        const filter = { group: groupId, deletedFor: { $ne: req.user._id } };
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

        res.status(200).json({
            messages: messages.reverse().map(decryptMessage),
            page,
            limit,
            totalMessages: total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Leave a group
// @route   DELETE /api/groups/:groupId/leave
// @access  Private
const leaveGroup = async (req, res, next) => {
    try {
        const group = await Group.findById(req.params.groupId);
        if (!group) return res.status(404).json({ error: 'Group not found.' });

        group.members = group.members.filter((m) => String(m) !== String(req.user._id));
        group.admins = group.admins.filter((a) => String(a) !== String(req.user._id));
        await group.save();

        const io = getIO();
        if (io) io.to(`group:${group._id}`).emit('group_updated', group);

        res.status(200).json({ message: 'You have left the group.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createGroup,
    getGroup,
    getMyGroups,
    updateMembers,
    sendGroupMessage,
    getGroupMessages,
    leaveGroup
};
