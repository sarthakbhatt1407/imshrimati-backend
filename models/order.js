const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  userId: { type: String, required: true },
  address: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  productId: { type: String, required: true },
  time: { type: String, required: true },
  day: { type: String, required: true },
  month: { type: String, required: true },
  year: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  shippingCharges: { type: Number, required: true },
  gatewayCharges: { type: Number },
  replacementStatus: { type: Boolean },
  replacement: { type: Object },
  tracking: { type: String },
  status: { type: String, required: true },
});

module.exports = mongoose.model("Order", orderSchema);
