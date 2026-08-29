const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema(
    {
        token: { type: String, required: true },
        deviceInfo: { type: String, default: 'unknown device' },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true }
    },
    { _id: false }
);

const UserSchema = new mongoose.Schema(
    {
        phoneNumber: {
            type: String,
            required: false,
            unique: true,
            sparse: true, // allows multiple docs with no phoneNumber
            trim: true
        },
        email: {
            type: String,
            required: false,
            unique: true,
            sparse: true, // allows multiple docs with no email
            trim: true,
            lowercase: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            select: false // never return password by default
        },
        avatar: {
            type: String,
            default: 'https://api.dicebear.com/7.x/initials/svg?seed=User'
        },
        about: {
            type: String,
            default: 'Hey there! I am using WhatsApp Clone.'
        },
        isOnline: {
            type: Boolean,
            default: false
        },
        lastSeen: {
            type: Date,
            default: Date.now
        },
        blockedUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        // Secure session management: one refresh token record per logged-in device.
        // Rotated on every /auth/refresh call, removed on logout, all removed on password change.
        refreshTokens: {
            type: [RefreshTokenSchema],
            select: false,
            default: []
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

UserSchema.index({ name: 'text', phoneNumber: 'text', email: 'text' });

// A user must have at least one of phoneNumber or email to log in with.
UserSchema.pre('validate', function (next) {
    if (!this.phoneNumber && !this.email) {
        return next(new Error('Either phoneNumber or email is required.'));
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);
