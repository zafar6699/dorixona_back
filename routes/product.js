const express = require("express");
const router = express.Router();
const Product = require("../controller/Product");
const { protect, authorize } = require("../middleware/auth");

router.post("/create", Product.create);
router.post("/get/products", Product.getAll);
router.get("/one/:id", Product.getOne);
router.get("/search", Product.search);
router.get("/kassa/one/:id", Product.getOneKassa);
router.put("/update/:id", Product.updateProduct);
router.delete("/:id", Product.rm);

router.post("/prixod/create/:id", Product.createPrixod);
router.get("/prixod/code/:code", Product.getByCode);
router.get("/prixod/get/all", Product.getAllPrixods);
router.get("/prixod/one/:id", Product.getPrixods);
router.put("/prixod/update/:id", Product.editPrixod);

module.exports = router;