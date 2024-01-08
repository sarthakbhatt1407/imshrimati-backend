const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");

router.post("/new-order", orderController.createNewOrder);
router.post("/order-by-userid", orderController.getOrderByUserId);
router.post("/edit", orderController.editOrderByOrderId);
router.get("/all-orders", orderController.getAllOrders);
router.get("/payment", orderController.getAllOrders);
router.post("/tracking-updater", orderController.trackingUpdater);

module.exports = router;
