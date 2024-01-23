const express = require("express");
const payment_route = express();
const paymentController = require("../controller/paymentController");

payment_route.post("/create-order", paymentController.createOrder);

module.exports = payment_route;
