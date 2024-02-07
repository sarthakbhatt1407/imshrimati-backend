const express = require("express");
const router = express();
const shipRocketController = require("../controller/shipRocketController");

router.post("/check-delivery", shipRocketController.deliveryChecker);
router.post("/create-new-order", shipRocketController.createNewOrder);
router.post("/cancel-order", shipRocketController.orderCanceller);

module.exports = router;
