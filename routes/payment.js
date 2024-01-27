const express = require("express");
const payment_route = express();
const paymentController = require("../controller/paymentController");

payment_route.post("/create-order", paymentController.createOrder);
payment_route.post("/payment-verifier", paymentController.paymentVerifier);

module.exports = payment_route;
