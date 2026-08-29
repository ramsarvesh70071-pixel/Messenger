require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const swaggerDocument = require('./docs/swagger.json');
const initSocket = require('./socket/socket');
const { generalLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const groupRoutes = require('./routes/groupRoutes');
const chatRoutes = require('./routes/chatRoutes');
const contactRoutes = require('./routes/contactRoutes');
const statusRoutes = require('./routes/statusRoutes');
// const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Database Connection ----
connectDB();

// ---- Core Middlewares ----
const corsOrigin = process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*'
    ? process.env.CORS_ORIGIN.split(',')
    : '*';

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.info(msg.trim()) }
}));
app.use(generalLimiter);

// ---- API Docs ----
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ---- Health Check ----
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---- Routes Setup ----
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/status', statusRoutes);
// app.use('/api/upload', uploadRoutes);

// ---- Error Handling (Must be after routes) ----
app.use(notFound);
app.use(errorHandler);

// ---- HTTP + Socket.io Server ----
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: corsOrigin, methods: ['GET', 'POST'] }
});

initSocket(io);

server.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`API docs available at http://localhost:${PORT}/api-docs`);
});

// ---- Graceful Error Handling ----
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
});
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
});

module.exports = app;