const express = require("express");

const router = express.Router();

const {
    createStatus,
    getStatuses,
    viewStatus,
    deleteStatus,
} = require("../controllers/statusController");

const { protect } = require("../middleware/auth");

router.post("/", protect, createStatus);

router.get("/", protect, getStatuses);

router.put(
    "/view/:id",
    protect,
    viewStatus
);

router.delete(
    "/:id",
    protect,
    deleteStatus
);

module.exports = router;