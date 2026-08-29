const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: ["text", "image", "video"],
            default: "text",
        },

        content: {
            type: String,
            default: "",
        },
        
        mediaUrl: {
            type: String,
            default: "",
          },

        viewers: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },

                viewedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Status", statusSchema);