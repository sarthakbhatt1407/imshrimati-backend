const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");

router.post("/new-order", orderController.createNewOrder);
router.get("/:userId", orderController.getOrderByUserId);
router.get("/get-order/:orderId", orderController.getOrderByOrderId);
router.post("/edit", orderController.editOrderByOrderId);
router.get("/all-orders", orderController.getAllOrders);
router.post("/payment", orderController.getTotalMonthlyPayment);
router.post("/tracking-updater", orderController.trackingUpdater);
router.post("/payment-updater", orderController.orderPaymentUpdater);
router.post("/order-counter", orderController.orderCounter);

module.exports = router;
