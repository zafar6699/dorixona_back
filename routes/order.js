const express = require("express");
const router = express.Router();
const Order = require("../controller/Order");
const { protect, authorize } = require("../middleware/auth");

router.post("/create", Order.create);
router.get("/all", Order.getAll);
router.post("/filter", Order.filter);
module.exports = router;