# Pulse — React Native (Expo) mobile app

Aapke `pulse-fullstack` web app (React + Node/Socket.io backend) ka **same-to-same React Native version** — same
backend, same API routes, same socket events, same purple/pink theme. Focus feature: **Chat screen** mein
messages left/right bubbles mein aate hain (sender = right, receiver = left) aur **WhatsApp jaisa swipe-to-see-time**
gesture — poori chat screen ko left swipe karo, sabhi bubbles thoda left slide honge aur unke peeche timestamp
reveal hoga (finger chhodte hi bubbles wapas snap ho jaate hain).

## Kya banaya gaya hai

- Login / Register screens (same `phoneNumber` + `password` auth as backend)
- Chat list screen (direct chats + groups, unread badge, last message preview, new-chat search)
- Chat screen — WhatsApp-style bubble layout + swipe gesture (`src/components/MessageBubble.jsx` +
  `src/screens/ChatScreen.jsx`)
- Realtime messaging, typing indicator, online/offline presence, read receipts — via `socket.io-client`
  (same events as `backend/socket/socket.js`: `send_message`, `receive_message`, `typing`, `message_read`, etc.)
- Same dark theme colors as the web app (`src/theme/colors.js` ported from `frontend/src/styles/globals.css`)

Backend **bilkul change nahi karna** — yeh app aapke existing `pulse-fullstack/backend` ko hi hit karta hai.

## Setup

### 1. Backend chalao (already aapke pass hai)

```bash
cd pulse-fullstack/backend
npm install
cp .env.example .env   # MONGO_URI, JWT_SECRET, ENCRYPTION_KEY set karo
npm run dev             # default: http://localhost:5000
```

### 2. Mobile app dependencies install karo

```bash
cd pulse-mobile
npm install
```

### 3. Backend URL set karo — **zaroori step**

`src/api/config.js` kholo aur apna backend address daalo:

```js
export const API_URL = 'http://192.168.1.5:5000'; // apna LAN IP daalo
```

- **Real phone pe Expo Go se test** kar rahe ho → apne computer ka LAN IP daalo (`ipconfig` / `ifconfig` se milega),
  phone aur computer same WiFi pe hone chahiye.
- **Android emulator** → `http://10.0.2.2:5000`
- **iOS simulator** → `http://localhost:5000` chalega

### 4. App run karo

```bash
npx expo start
```

QR code scan karo Expo Go app se (Android/iOS), ya `a` dabao emulator ke liye, ya `i` iOS simulator ke liye.

> Pehli baar `expo start` chalane par kuch native modules (`react-native-reanimated`,
> `react-native-gesture-handler`, `expo-linear-gradient`) auto-link ho jaate hain — Expo managed workflow hai to
> extra native setup nahi chahiye.

## Swipe-to-see-time gesture kaise kaam karta hai

`ChatScreen.jsx` mein poori message list ek `Gesture.Pan()` se wrapped hai. Jab aap left swipe karte ho:

1. Ek shared `swipeX` value (Reanimated) -60 se 0 ke beech move hoti hai.
2. Har `MessageBubble` apne content ko usi value se `translateX` karta hai — is liye saare bubbles ek saath slide
   hote hain, bilkul WhatsApp jaisa.
3. Bubble ke peeche (right side) ek timestamp label hai jiska opacity swipe distance ke hisaab se fade-in hota hai.
4. Finger uthate hi `withTiming` se sab kuch smoothly 0 pe wapas snap ho jaata hai.

Yeh logic `src/components/MessageBubble.jsx` (rendering) aur `src/screens/ChatScreen.jsx` (gesture) mein hai.

## Project structure

```
pulse-mobile/
  App.js                     # navigation + providers root
  src/
    api/                     # axios instance, socket.io client, endpoint functions (same routes as web)
    context/                 # AuthContext, ChatContext, SocketContext — same logic as web app's contexts
    components/
      MessageBubble.jsx       # ⭐ left/right bubbles + swipe-to-reveal-time
      Composer.jsx             # message input bar
      ChatListItem.jsx
      Avatar.jsx / StatusTicks.jsx / TypingDots.jsx / DayDivider.jsx
    screens/
      LoginScreen.jsx / RegisterScreen.jsx
      ChatListScreen.jsx       # chat list + new chat search modal
      ChatScreen.jsx            # ⭐ chat window with gesture-wrapped message list
    theme/colors.js            # same purple/pink/teal palette as web app
    utils/format.js            # time/day formatting — ported as-is
```

## Aage kya add kar sakte ho (abhi web app mein hai, isme trimmed hai for speed)

- Message reactions, edit/delete UI, reply-swipe-to-reply gesture, group info modal, block/unblock, message
  search, profile edit screen — inka backend already support karta hai (`src/api/endpoints.js` mein saare
  functions already hain ya easily add ho sakte hain), bas UI screens jodni hongi. Bolo to inhe bhi add kar
  deta hoon.
