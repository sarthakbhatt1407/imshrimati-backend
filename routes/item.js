const express = require("express");
const router = express.Router();
const itemController = require("../controller/itemController");
const fileUpload = require("../middleware/fileUpload");

router.post(
  "/create-new-item",
  fileUpload.array("image"),
  itemController.createNewProduct
);
router.get("/all-items", itemController.getAllProducts);
router.delete("/delete-item", itemController.deleteItemById);

module.exports = router;
