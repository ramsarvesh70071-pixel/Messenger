const Status = require("../models/Status");

exports.createStatus = async (req, res) => {
    try {
        const { content, type, mediaUrl } = req.body;

        const status = await Status.create({
            user: req.user.id,
            content,
            type,
            mediaUrl,
            expiresAt: new Date(
                Date.now() + 24 * 60 * 60 * 1000
            ),
          });

        res.status(201).json(status);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

exports.getStatuses = async (req, res) => {
    try {
        const statuses = await Status.find({
            expiresAt: {
                $gt: new Date(),
            },
        })
            .populate("user", "name avatar")
            .sort("-createdAt");

        res.json(statuses);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

exports.viewStatus = async (req, res) => {
    try {
        const status = await Status.findById(
            req.params.id
        );

        if (!status) {
            return res.status(404).json({
                message: "Status not found",
            });
        }

        const alreadyViewed =
            status.viewers.find(
                (v) =>
                    v.user.toString() === req.user.id
            );

        if (!alreadyViewed) {
            status.viewers.push({
                user: req.user.id,
            });

            await status.save();
        }

        res.json({
            success: true,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

exports.deleteStatus = async (req, res) => {
    try {
        const status = await Status.findById(
            req.params.id
        );

        if (!status) {
            return res.status(404).json({
                message: "Status not found",
            });
        }

        if (
            status.user.toString() !== req.user.id
        ) {
            return res.status(403).json({
                message: "Not authorized",
            });
        }

        await status.deleteOne();

        res.json({
            success: true,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};