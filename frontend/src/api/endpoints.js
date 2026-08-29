import api from './axios';

// ---- Auth ----
export const registerUser = (data) => api.post('/auth/register', data).then((r) => r.data);
export const loginUser = (data) => api.post('/auth/login', data).then((r) => r.data);
export const refreshSession = (refreshToken) =>
  api.post('/auth/refresh', { refreshToken }).then((r) => r.data);
export const logoutUser = (refreshToken) => api.post('/auth/logout', { refreshToken }).then((r) => r.data);
export const logoutAllDevices = () => api.post('/auth/logout-all').then((r) => r.data);
export const deleteAccount = (password) =>
  api.delete('/auth/account', { data: { password } }).then((r) => r.data);

// ---- Users ----
export const getMe = () => api.get('/users/me').then((r) => r.data);
export const updateMe = (data) => api.put('/users/me', data).then((r) => r.data);
export const getUsers = (search = '') =>
  api.get('/users', { params: search ? { search } : {} }).then((r) => r.data);
export const blockUser = (userId) => api.post(`/users/block/${userId}`).then((r) => r.data);
export const unblockUser = (userId) => api.post(`/users/unblock/${userId}`).then((r) => r.data);
export const getBlockedUsers = () => api.get('/users/blocked').then((r) => r.data);

// ---- Contacts ----
export const addContact = (contactId, nickname) =>
  api.post('/contacts', { contactId, nickname }).then((r) => r.data);
export const removeContact = (contactId) => api.delete(`/contacts/${contactId}`).then((r) => r.data);
export const getContacts = (search = '', favoritesOnly = false) =>
  api
    .get('/contacts', { params: { ...(search ? { search } : {}), ...(favoritesOnly ? { favoritesOnly: true } : {}) } })
    .then((r) => r.data);
export const toggleFavoriteContact = (contactId) =>
  api.put(`/contacts/${contactId}/favorite`).then((r) => r.data);
export const updateContactNickname = (contactId, nickname) =>
  api.put(`/contacts/${contactId}`, { nickname }).then((r) => r.data);

// ---- Chats (list + per-chat settings) ----
export const getChatList = (includeArchived = false) =>
  api.get('/chats', { params: includeArchived ? { includeArchived: true } : {} }).then((r) => r.data);
export const getArchivedChats = () => api.get('/chats/archived').then((r) => r.data);
export const setChatArchived = (chatType, chatId, archived) =>
  api.put(`/chats/${chatType}/${chatId}/archive`, { archived }).then((r) => r.data);
export const setChatMuted = (chatType, chatId, muted, mutedUntil) =>
  api.put(`/chats/${chatType}/${chatId}/mute`, { muted, mutedUntil }).then((r) => r.data);
export const setChatPinned = (chatType, chatId, pinned) =>
  api.put(`/chats/${chatType}/${chatId}/pin`, { pinned }).then((r) => r.data);
export const markChatRead = (chatType, chatId) =>
  api.put(`/chats/${chatType}/${chatId}/read`).then((r) => r.data);
export const markChatUnread = (chatType, chatId) =>
  api.put(`/chats/${chatType}/${chatId}/unread`).then((r) => r.data);
export const exportChatUrl = (chatType, chatId) =>
  `${api.defaults.baseURL}/chats/${chatType}/${chatId}/export`;

// ---- Direct messages ----
export const sendMessageRest = (data) => api.post('/messages/send', data).then((r) => r.data);
export const getConversation = (userId, page = 1, limit = 30) =>
  api.get(`/messages/${userId}`, { params: { page, limit } }).then((r) => r.data);
export const searchMessages = (userId, q) =>
  api.get(`/messages/${userId}/search`, { params: { q } }).then((r) => r.data);
export const editMessage = (messageId, text) =>
  api.put(`/messages/${messageId}`, { text }).then((r) => r.data);
export const deleteMessage = (messageId, mode = 'me') =>
  api.delete(`/messages/${messageId}`, { params: { mode } }).then((r) => r.data);
export const reactToMessage = (messageId, emoji) =>
  api.post(`/messages/${messageId}/react`, { emoji }).then((r) => r.data);
export const clearConversation = (userId) =>
  api.delete(`/messages/conversation/${userId}`).then((r) => r.data);

// ---- Message actions: forward, star, pin ----
export const forwardMessage = (messageId, { recipient, group }) =>
  api.post(`/messages/${messageId}/forward`, { recipient, group }).then((r) => r.data);
export const toggleStarMessage = (messageId) =>
  api.post(`/messages/${messageId}/star`).then((r) => r.data);
export const getStarredMessages = () => api.get('/messages/starred').then((r) => r.data);
export const togglePinMessage = (messageId, pinned) =>
  api.post(`/messages/${messageId}/pin`, { pinned }).then((r) => r.data);
export const getPinnedMessages = (chatType, chatId) =>
  api.get(`/messages/${chatType}/${chatId}/pinned`).then((r) => r.data);

// ---- Groups ----
export const createGroup = (data) => api.post('/groups', data).then((r) => r.data);
export const getMyGroups = () => api.get('/groups').then((r) => r.data);
export const getGroup = (groupId) => api.get(`/groups/${groupId}`).then((r) => r.data);
export const getGroupMessages = (groupId, page = 1, limit = 30) =>
  api.get(`/groups/${groupId}/messages`, { params: { page, limit } }).then((r) => r.data);
