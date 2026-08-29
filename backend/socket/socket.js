const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Group = require('../models/Group');
const { encryptText, decryptText } = require('../utils/encryption');
const logger = require('../utils/logger');
const {
    setIO,
    addUserSocket,
    removeUserSocket,
    findUserIdBySocketId,
    getSocketIdsForUser,
    isUserOnline
} = require('./socketState');

function decryptMessage(messageDoc) {
    const obj = messageDoc.toObject ? messageDoc.toObject() : messageDoc;
    return { ...obj, text: decryptText(obj.text) };
}

function initSocket(io) {
    setIO(io);

    // Socket authentication middleware - expects a JWT in the handshake auth payload
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token) {
                return next(new Error('Authentication error: token missing'));
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = String(decoded.id);
            next();
        } catch (err) {
            next(new Error('Authentication error: invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.userId;
        logger.info(`Socket connected: user=${userId} socket=${socket.id}`);

        // Register this device/tab under the user (multi-device support)
        addUserSocket(userId, socket.id);

        // Join a personal room for easy targeted emits
        socket.join(`user:${userId}`);

        // Mark user online + broadcast presence, update lastSeen
        User.findByIdAndUpdate(userId, { isOnline: true }).catch((e) =>
            logger.error(`Presence update failed: ${e.message}`)
        );
        io.emit('user_status_change', { userId, isOnline: true });

        // ---- Join all of the user's groups so group messages reach them ----
        Group.find({ members: userId })
            .select('_id')
            .then((groups) => {
                groups.forEach((g) => socket.join(`group:${g._id}`));
            })
            .catch((e) => logger.error(`Group room join failed: ${e.message}`));

        // ---- SEND MESSAGE (1-to-1 or group) ----
        socket.on('send_message', async (data) => {
            try {
                const { recipient, group, text, replyTo } = data;
                if (!text || (!recipient && !group)) return;

                if (recipient) {
                    const recipientUser = await User.findById(recipient);
                    if (recipientUser && recipientUser.blockedUsers.includes(userId)) {
                        socket.emit('message_error', { error: 'You cannot message this user.' });
                        return;
                    }
                }

                const newMessage = await Message.create({
                    sender: userId,
                    recipient: recipient || null,
                    group: group || null,
                    text: encryptText(text),
                    replyTo: replyTo || null,
                    status: 'sent'
                });

                const populated = await Message.findById(newMessage._id)
                    .populate('sender', 'name avatar phoneNumber')
                    .populate('replyTo');

                const payload = decryptMessage(populated);

                if (recipient) {
                    io.to(`user:${recipient}`).emit('receive_message', payload);
                    // mark delivered immediately if recipient is online
                    if (isUserOnline(recipient)) {
                        newMessage.status = 'delivered';
                        newMessage.deliveredTo.push(recipient);
                        await newMessage.save();
                        io.to(`user:${userId}`).emit('message_status_update', {
                            messageId: newMessage._id,
                            status: 'delivered'
                        });
                    }
                } else if (group) {
                    socket.to(`group:${group}`).emit('receive_message', payload);
                }

                socket.emit('message_sent', payload);
            } catch (error) {
                logger.error(`send_message error: ${error.message}`);
                socket.emit('message_error', { error: 'Failed to send message.' });
            }
        });

        // ---- TYPING INDICATORS ----
        socket.on('typing', ({ recipient, group }) => {
            if (recipient) {
                io.to(`user:${recipient}`).emit('typing', { userId, group: null });
            } else if (group) {
                socket.to(`group:${group}`).emit('typing', { userId, group });
            }
        });

        socket.on('stop_typing', ({ recipient, group }) => {
            if (recipient) {
                io.to(`user:${recipient}`).emit('stop_typing', { userId, group: null });
            } else if (group) {
                socket.to(`group:${group}`).emit('stop_typing', { userId, group });
            }
        });

        // ---- READ RECEIPTS ----
        socket.on('message_read', async ({ messageId, senderId }) => {
            try {
                await Message.findByIdAndUpdate(messageId, {
                    status: 'read',
                    $addToSet: { readBy: userId }
                });
                if (senderId) {
                    io.to(`user:${senderId}`).emit('message_status_update', {
                        messageId,
                        status: 'read',
                        readBy: userId
                    });
                }
            } catch (error) {
                logger.error(`message_read error: ${error.message}`);
            }
        });

        // ---- DELIVERED RECEIPT (explicit ack from client) ----
        socket.on('message_delivered', async ({ messageId, senderId }) => {
            try {
                await Message.findByIdAndUpdate(messageId, {
                    status: 'delivered',
                    $addToSet: { deliveredTo: userId }
                });
                if (senderId) {
                    io.to(`user:${senderId}`).emit('message_status_update', {
                        messageId,
                        status: 'delivered'
                    });
                }
            } catch (error) {
                logger.error(`message_delivered error: ${error.message}`);
            }
        });

        // ---- REACTIONS (real-time push; REST endpoint also available) ----
        socket.on('react_to_message', async ({ messageId, emoji, recipient, group }) => {
            try {
                await Message.findByIdAndUpdate(messageId, {
                    $pull: { reactions: { user: userId } }
                });
                const updated = await Message.findByIdAndUpdate(
                    messageId,
                    { $push: { reactions: { user: userId, emoji } } },
                    { new: true }
                );
                const eventPayload = { messageId, reactions: updated.reactions };
                if (recipient) io.to(`user:${recipient}`).emit('reaction_update', eventPayload);
                if (group) io.to(`group:${group}`).emit('reaction_update', eventPayload);
                socket.emit('reaction_update', eventPayload);
            } catch (error) {
                logger.error(`react_to_message error: ${error.message}`);
            }
        });

        // ---- JOIN A GROUP ROOM DYNAMICALLY (after being added to a new group) ----
        socket.on('join_group', (groupId) => {
            socket.join(`group:${groupId}`);
        });

        socket.on('leave_group', (groupId) => {
            socket.leave(`group:${groupId}`);
        });

        // ---- DISCONNECT ----
        socket.on('disconnect', async () => {
            removeUserSocket(userId, socket.id);
            logger.info(`Socket disconnected: user=${userId} socket=${socket.id}`);

            // Only mark offline if user has NO other active devices/tabs connected
            if (!isUserOnline(userId)) {
                try {
                    await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
                    io.emit('user_status_change', { userId, isOnline: false, lastSeen: new Date() });
                } catch (error) {
                    logger.error(`Disconnect presence update failed: ${error.message}`);
                }
            }
        });
    });
}

module.exports = initSocket;
