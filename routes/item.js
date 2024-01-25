const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
const fileUpload = require("../middleware/fileUpload");

router.post(
  "/create-new-product",
  fileUpload.array("image"),
  productController.createNewProduct
);
router.get("/all-items", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.delete("/delete-item", productController.deleteProductById);
router.patch(
  "/edit-item",
  fileUpload.array("image"),
  productController.editItemByItemId
);
router.patch("/reviews", productController.productReviewHandler);
router.post("/stock", productController.stockVerifier);

module.exports = router;
