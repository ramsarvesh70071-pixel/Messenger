// Shared state between socket.js and REST controllers.
// activeUsers maps userId -> Set of socketIds, supporting MULTI-DEVICE login
// (a single user can be connected from multiple devices/tabs at once).
const activeUsers = new Map();

let ioInstance = null;

function setIO(io) {
    ioInstance = io;
}

function getIO() {
    return ioInstance;
}

function addUserSocket(userId, socketId) {
    const key = String(userId);
    if (!activeUsers.has(key)) {
        activeUsers.set(key, new Set());
    }
    activeUsers.get(key).add(socketId);
}

function removeUserSocket(userId, socketId) {
    const key = String(userId);
    if (activeUsers.has(key)) {
        activeUsers.get(key).delete(socketId);
        if (activeUsers.get(key).size === 0) {
            activeUsers.delete(key);
        }
    }
}

function findUserIdBySocketId(socketId) {
    for (const [userId, socketSet] of activeUsers.entries()) {
        if (socketSet.has(socketId)) return userId;
    }
    return null;
}

function isUserOnline(userId) {
    return activeUsers.has(String(userId));
}

function getSocketIdsForUser(userId) {
    const set = activeUsers.get(String(userId));
    return set ? Array.from(set) : [];
}

module.exports = {
    activeUsers,
    setIO,
    getIO,
    addUserSocket,
    removeUserSocket,
    findUserIdBySocketId,
    isUserOnline,
    getSocketIdsForUser
};
