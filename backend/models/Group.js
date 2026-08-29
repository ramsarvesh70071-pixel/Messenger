const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        avatar: {
            type: String,
            default: 'https://api.dicebear.com/7.x/shapes/svg?seed=Group'
        },
        description: {
            type: String,
            default: ''
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        admins: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Group', GroupSchema);
