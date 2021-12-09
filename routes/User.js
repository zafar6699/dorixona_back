const express = require("express");
const router = express.Router();
const User = require("../controller/User");
const { protect, authorize } = require("../middleware/auth");

router.post("/create", User.create);
router.get("/me", User.me);
router.post("/login", User.login);
router.get("/all", User.getAll);
router.put("/:id", User.updateOne);
router.delete("/:id", User.deleteOne);

module.exports = router;
