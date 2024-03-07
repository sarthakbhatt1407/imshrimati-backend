const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
const fileUpload = require("../middleware/fileUpload");

router.post(
  "/create-new-product",
  fileUpload.array("image"),
  productController.createNewProduct
);
router.post(
  "/upload",
  fileUpload.array("image"),
  productController.uploadImages
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
router.post("/category", productController.getProductByCategory);

module.exports = router;
