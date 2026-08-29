const express =
    require("express");

const router =
    express.Router();

const {
    uploadImage,
} = require(
    "../controllers/uploadController"
);

const auth =
    require("../middleware/authMiddleware");

router.post(
    "/image",
    auth,
    uploadImage
);

module.exports = router;