# WhatsApp Clone Backend (Complete Edition)

A full-featured, production-structured WhatsApp-style chat backend built with **Node.js, Express, MongoDB (Mongoose), and Socket.io**. This is the fully upgraded version of the original basic backend — every feature below was built purely in code, using only free/open-source npm packages, so it costs nothing to run locally.

---

## 1. What's Included (Features)

### Authentication & Security
- Register/Login with **phone number + password**
- Passwords hashed with **bcrypt** (never stored in plain text)
- **JWT-based authentication** on every protected route
- **Rate limiting** — separate stricter limits for auth routes and message sending, general limiter on the whole API
- **Input validation** on every endpoint (`express-validator`)
- **Centralized error handling** (no leaking stack traces in production)
- **AES-256 encryption of message text at rest** in the database (see [Encryption Notes](#7-encryption-notes--important-caveat))

### Messaging
- 1-to-1 real-time messaging via **Socket.io**
- **Group chats** — create groups, add/remove members, admins, group messaging
- **Message delivered & read receipts** (real, working status updates — not just a schema field)
- **Typing indicators** (1-to-1 and group)
- **Message reactions** (emoji, one reaction per user per message)
- **Reply/quote a message**
- **Edit sent messages**
- **Delete message** — "for me" or "for everyone" (sender only)
- **Clear entire conversation** (for yourself only)
- **Search messages** inside a conversation
- **Pagination** on all message-fetching endpoints (`?page=&limit=`)

### Presence & Profile
- **Online/offline status**, broadcast in real time
- **Last seen** timestamp
- **Multi-device support** — a user can be logged in on several devices/tabs at once; "online" only turns off when ALL devices disconnect
- **Profile update** (name, avatar, about/bio)
- **Block / Unblock users** — blocked users cannot message you

### Chat List
- Combined **chat list** endpoint: direct chats + groups together, sorted by most recent activity, each with a decrypted last-message preview and unread count

### Developer Experience
- **Winston** logging (console + file logs under `/logs`)
- **Morgan** HTTP request logging
- **Swagger/OpenAPI docs** served at `/api-docs`
- Clean **MVC folder structure** (config / models / controllers / routes / middleware / socket / utils)
- `.env.example` provided, secrets are NOT committed

---

## 2. What's Still NOT Included (and why)

These were left out because they genuinely need an external paid service or infrastructure beyond pure backend code — see the earlier discussion for details:

| Feature | Why it's not here |
|---|---|
| Real SMS OTP login | Needs a paid SMS gateway (Twilio/MSG91) |
| Push notifications (iOS) | Needs a paid Apple Developer account ($99/yr) |
| Media file storage at scale | Needs cloud storage (S3/Cloudinary) beyond free tier for production scale |
| True end-to-end encryption (like Signal Protocol) | Requires client-side key management or per-device key exchange — not a backend-only concern |

Push notifications for **Android via Firebase (FCM)** and small-scale media storage are actually free and could be added next — just ask if you want those wired in.

---

## 3. Project Structure

```
whatsapp-backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # register, login
│   ├── userController.js      # profile, search, block/unblock
│   ├── messageController.js   # send, fetch, edit, delete, react, search
│   ├── groupController.js     # group CRUD + group messaging
│   └── chatController.js      # combined chat list w/ unread counts
├── docs/
│   └── swagger.json           # OpenAPI spec (served at /api-docs)
├── middleware/
│   ├── auth.js                # JWT protect middleware
│   ├── errorHandler.js        # centralized error handling
│   ├── rateLimiter.js         # general / auth / message limiters
│   └── validate.js            # express-validator result handler
├── models/
│   ├── User.js
│   ├── Message.js
│   └── Group.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── messageRoutes.js
│   ├── groupRoutes.js
│   └── chatRoutes.js
├── socket/
│   ├── socket.js               # all Socket.io event handlers
│   └── socketState.js          # shared active-user/device map + io instance
├── utils/
│   ├── logger.js               # winston logger
│   ├── encryption.js           # AES-256 encrypt/decrypt helpers
│   └── generateToken.js        # JWT signing helper
├── .env.example
├── .gitignore
├── package.json
├── server.js                    # entry point — wires everything together
└── README.md
```

---

## 4. Setup Instructions

### Prerequisites
- **Node.js** v18+ installed
- **MongoDB** running locally (or a free MongoDB Atlas cluster)

### Steps

```bash
# 1. Extract the zip and move into the project folder
cd whatsapp-backend

# 2. Install dependencies
npm install

# 3. Create your .env file from the example
cp .env.example .env

# 4. Edit .env and set your own values:
#    - JWT_SECRET            → any long random string
#    - MESSAGE_ENCRYPTION_KEY → any 32-character string
#    - MONGO_URI             → defaults to local MongoDB if unset

# 5. Start MongoDB locally (if not already running)
mongod

# 6. Run the server
npm run dev      # with nodemon (auto-restart on changes)
# or
npm start         # plain node
```

The server starts on `http://localhost:5000` by default.
- Health check: `GET http://localhost:5000/health`
- Swagger API docs: `http://localhost:5000/api-docs`

---

## 5. REST API Reference

All routes are prefixed with `/api`. Protected routes require:
```
Authorization: Bearer <your_jwt_token>
```

### Auth
| Method | Route | Body | Description |
|---|---|---|---|
| POST | `/auth/register` | `{ phoneNumber, name, password }` | Create account, returns `{ token, user }` |
| POST | `/auth/login` | `{ phoneNumber, password }` | Login, returns `{ token, user }` |

### Users
| Method | Route | Description |
|---|---|---|
| GET | `/users/me` | Get my profile |
| PUT | `/users/me` | Update `{ name, avatar, about }` |
| GET | `/users?search=` | List/search contacts (excludes self & blocked) |
| GET | `/users/blocked` | List blocked users |
| POST | `/users/block/:userId` | Block a user |
| POST | `/users/unblock/:userId` | Unblock a user |

### Chats
| Method | Route | Description |
|---|---|---|
| GET | `/chats` | Combined chat list (direct + group), last message + unread count |

### Messages (1-to-1)
| Method | Route | Description |
|---|---|---|
| POST | `/messages/send` | `{ recipient, text, replyTo? }` — REST fallback for sending |
| GET | `/messages/:userId?page=1&limit=30` | Paginated conversation history |
| GET | `/messages/:userId/search?q=keyword` | Search within a conversation |
| PUT | `/messages/:messageId` | `{ text }` — edit your own message |
| DELETE | `/messages/:messageId?mode=me\|everyone` | Delete a message |
| POST | `/messages/:messageId/react` | `{ emoji }` — react to a message |
| DELETE | `/messages/conversation/:userId` | Clear the whole conversation (for you only) |

### Groups
| Method | Route | Description |
|---|---|---|
| POST | `/groups` | `{ name, members: [userIds], avatar?, description? }` |
| GET | `/groups` | List my groups |
| GET | `/groups/:groupId` | Group details |
| PUT | `/groups/:groupId/members` | `{ action: "add"\|"remove", userIds: [] }` (admin only) |
| DELETE | `/groups/:groupId/leave` | Leave a group |
| POST | `/groups/:groupId/messages` | `{ text, replyTo? }` — send group message |
| GET | `/groups/:groupId/messages?page=&limit=` | Paginated group messages |

---

## 6. Socket.io Events

Connect with a JWT in the handshake:
```js
const socket = io("http://localhost:5000", {
  auth: { token: "<your_jwt_token>" }
});
```

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `send_message` | `{ recipient? , group?, text, replyTo? }` | Send a message (1-to-1 or group) |
| `typing` | `{ recipient? , group? }` | Notify you're typing |
| `stop_typing` | `{ recipient? , group? }` | Notify you stopped typing |
| `message_delivered` | `{ messageId, senderId }` | Ack that a message was delivered to you |
| `message_read` | `{ messageId, senderId }` | Mark a message as read |
| `react_to_message` | `{ messageId, emoji, recipient?, group? }` | React in real time |
| `join_group` / `leave_group` | `groupId` | Manually join/leave a group's socket room |

### Server → Client
| Event | Description |
|---|---|
| `receive_message` | New incoming message (decrypted) |
| `message_sent` | Ack to sender that their message was saved |
| `message_status_update` | `{ messageId, status }` — delivered/read update |
| `message_edited` | A message was edited |
| `message_deleted` | A message was deleted |
| `reaction_update` | `{ messageId, reactions }` |
| `typing` / `stop_typing` | Peer typing status |
| `user_status_change` | `{ userId, isOnline, lastSeen? }` — presence update |
| `added_to_group` / `group_updated` | Group membership changes |
| `message_error` | Something went wrong sending a message |

---

## 7. Encryption Notes — Important Caveat

Message `text` is encrypted with **AES-256** before being saved to MongoDB, and decrypted only when returned to an authorized user through the API/socket layer. This protects your data **at rest** — e.g. if your database is ever leaked, dumped, or accessed without authorization, the raw message text is unreadable.

**This is not the same as WhatsApp's real End-to-End Encryption (E2EE).** In true E2EE (Signal Protocol), only the sender and recipient devices hold the decryption keys — the server never sees plaintext, even in memory. Here, the backend server does hold the encryption key and can technically decrypt messages, because that's required for features like search, and because true E2EE needs client-side key management that lives in your frontend/mobile app, not the backend alone. If you need real E2EE later, that's a frontend + backend collaboration (each user generates a keypair on their device, public keys are exchanged via the server, and only ciphertext ever touches the database) — happy to help design that when you're ready to build the client app.

---

## 8. Testing the API Quickly (curl examples)

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"919999999999","name":"Priya","password":"secret123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"919999999999","password":"secret123"}'

# Get my profile (replace TOKEN)
curl http://localhost:5000/api/users/me -H "Authorization: Bearer TOKEN"

# Send a message
curl -X POST http://localhost:5000/api/messages/send \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"recipient":"RECIPIENT_USER_ID","text":"Hey there!"}'
```

A **Postman collection** can be generated from `/api-docs` (Swagger) — import the OpenAPI spec at `docs/swagger.json` directly into Postman if you prefer a GUI.

---

## 9. Next Steps / Roadmap (if you want to keep building)

1. **Media messages** (images/audio/video/docs) — needs file upload handling + storage (local disk works free for small scale)
2. **Push notifications via Firebase (Android — free)**
3. **Voice/video calling** — would need WebRTC signaling (can be added in Socket.io) + a TURN server (free tier available, e.g. coturn self-hosted or a free tier from a provider)
4. **Admin dashboard** for moderation
5. **True end-to-end encryption** with client-side key management

---

## 10. Tech Stack Summary

| Layer | Technology |
|---|---|
| Server | Node.js + Express |
| Database | MongoDB + Mongoose |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |
| Validation | express-validator |
| Rate limiting | express-rate-limit |
| Logging | winston + morgan |
| Docs | swagger-ui-express |
| Encryption | Node's built-in `crypto` (AES-256-CBC) |

---

Built as a complete, ready-to-run upgrade of the original basic backend — every feature listed in Section 1 is real, working code, not a stub.
