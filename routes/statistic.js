const Statistic = require("../controller/Statistic");
const express = require("express");
const router = express.Router();

router.get("/all", Statistic.statistic);
router.post("/orders", Statistic.orders);
router.post("/oneday", Statistic.oneday);

module.exports = router;