const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        contact: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        nickname: {
            type: String,
            trim: true,
            default: null
        },
        isFavorite: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

// A user can only save another user as a contact once
ContactSchema.index({ owner: 1, contact: 1 }, { unique: true });

module.exports = mongoose.model('Contact', ContactSchema);
