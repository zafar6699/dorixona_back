const express = require("express");
const router = express.Router();
const Dashboard = require("../controller/Dashboard");
const { protect, authorize } = require("../middleware/auth");

router.get("/all", Dashboard.dashboard);

module.exports = router;
