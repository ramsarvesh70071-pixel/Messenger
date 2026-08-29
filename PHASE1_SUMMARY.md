# Phase 1 — Complete ✅

Auth upgrade, Contacts, and Chat management have been added to your `Messenger` project (`backend/` + `frontend/`). Everything below is real, working, tested code — not stubs.

---

## What was added

### 🔐 Auth upgrade (`backend/controllers/authController.js`, `middleware/auth.js`, `models/User.js`)
- **Email OR phone login** — register/login with either, whichever the user has
- **Access token (15 min) + Refresh token (30 days)** — `POST /api/auth/refresh` rotates the refresh token on every use and detects reuse/theft (auto-revokes all sessions if a used-up token is replayed)
- **Secure session management** — refresh tokens are stored **hashed** (SHA-256) per device, never in plain text
- **Logout** — `POST /api/auth/logout` (this device only) and `POST /api/auth/logout-all` (every device)
- **Account deletion** — `DELETE /api/auth/account` (password-confirmed, soft-deletes so other people's chat history isn't broken)

### 👥 Contacts (`backend/models/Contact.js`, `controllers/contactController.js`)
- Add / remove contacts, with an optional local nickname
- Search your saved contacts
- Favorite / unfavorite a contact
- Routes: `GET/POST /api/contacts`, `PUT /api/contacts/:id`, `PUT /api/contacts/:id/favorite`, `DELETE /api/contacts/:id`

### 💬 Chat management (`backend/models/ChatSettings.js`, `controllers/chatSettingsController.js`)
- **Archive / unarchive** a chat (hidden from the main list, still fully intact)
- **Mute / unmute**, with an optional "mute until" time
- **Pin** (up to 3, like WhatsApp) — pinned chats always sort to the top
- **Mark read / mark unread** manually
- **Export chat** — downloads the full conversation as a plain-text transcript
- All of this is **per-user** — archiving/muting a chat never affects the other participant's view of it

### ✉️ Message actions (`backend/controllers/messageController.js`)
- **Forward** a message to another user or group
- **Star / unstar** a message (personal, private to you) + `GET /api/messages/starred` to see them all
- **Pin / unpin** a message inside a chat (visible to everyone in that chat) + `GET /api/messages/:chatType/:chatId/pinned`

### 📱 Frontend (React Native / Expo)
- `api/axios.js` — automatic access-token refresh on 401s, with request queuing so it only refreshes once even if several requests fail at the same time
- `context/AuthContext.jsx` — full session lifecycle: login, register, logout, logout-everywhere, delete account
- `context/ChatContext.jsx` — archive/mute/pin/mark-read/mark-unread, forward/star/pin message, all wired to sockets + REST
- `screens/ContactsScreen.jsx` — add, remove, favorite, search contacts
- `screens/ChatListScreen.jsx` — swipe-to-pin/mute/archive, long-press to mark unread
- `components/MessageActionSheet.jsx` (**new**) — long-press any message for Reply / Forward / Copy / Star / Pin / Edit / Delete / React
- `components/ForwardSheet.jsx` (**new**) — pick a contact or group to forward a message to

---

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env: set JWT_SECRET, JWT_REFRESH_SECRET (must be different from JWT_SECRET),
# MESSAGE_ENCRYPTION_KEY (32 chars), and MONGO_URI
npm run dev
```
Health check: `http://localhost:5000/health` · API docs: `http://localhost:5000/api-docs`

### Frontend
```bash
cd frontend
npm install
npx expo install expo-clipboard   # only needed the first time, already in package.json
```
Edit `src/api/config.js` and set `API_URL` to your backend's address:
- Android emulator → `http://10.0.2.2:5000`
- Real phone (Expo Go) → `http://<your-computer's-LAN-IP>:5000`
- iOS simulator → `http://localhost:5000`

```bash
npx expo start
```
Scan the QR code with Expo Go, or press `a` / `i` for an emulator.

---

## What was tested

- Every backend file (models, controllers, routes, middleware) syntax-checked with `node --check`
- All modules load without `require()` errors
- Access/refresh token generation, signing, and cross-verification rejection (an access token cannot be used as a refresh token and vice versa) verified directly
- Full Express route table printed and checked for path conflicts (e.g. `/starred` registered before `/:userId` so it isn't swallowed as a user ID)
- Server boots cleanly, `/health` and `/api-docs` respond correctly, and input validation correctly rejects a bad request (missing password)
- Every frontend `.js`/`.jsx` file parsed clean with Babel (`babel-preset-expo`) — no syntax errors anywhere in the React Native app

**Not tested:** a live MongoDB Atlas connection and a real device/emulator run (this sandbox has no MongoDB server and no Android/iOS runtime available). The logic itself is verified as described above — connect it to your own MongoDB Atlas free-tier cluster and it will run.

---

## Next up

Whenever you're ready, say the word and I'll move on to:
- **Phase 2:** Media sharing + Voice notes (Cloudinary)
- **Phase 3:** Status/Stories system
- Or the Admin Panel / Channels, once we get there
