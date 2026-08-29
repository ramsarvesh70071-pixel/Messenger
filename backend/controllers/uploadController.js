const cloudinary =
    require("../config/cloudinary");

exports.uploadImage =
    async (req, res) => {
        try {
            const result =
                await cloudinary.uploader.upload(
                    req.body.image,
                    {
                        folder:
                            "whatsapp-clone/status",
                    }
                );

            res.json({
                url: result.secure_url,
            });
        } catch (error) {
            res.status(500).json({
                message: error.message,
            });
        }
    };