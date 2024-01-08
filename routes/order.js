const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");

router.post("/new-order", orderController.createNewOrder);
router.post("/order-by-userid", orderController.getOrderByUserId);

module.exports = router;
