const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");
const fileUpload = require("../middleware/fileUpload");

router.post(
  "/add-category",
  fileUpload.single("image"),
  categoryController.addNewCategory
);
router.get("/all-category", categoryController.getAllCategory);

module.exports = router;
