const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  userId: { type: String, required: true },
  orderTitle: { type: String, required: true },
  address: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  productId: { type: String, required: true },
  time: { type: String, required: true },
  day: { type: String, required: true },
  month: { type: String, required: true },
  year: { type: String, required: true },
  paymentMethod: { type: String },
  paymentStatus: { type: String, required: true },
  paymentOrderId: { type: String, required: true },
  shippingCharges: { type: Number, required: true },
  replacementStatus: { type: Boolean },
  replacement: { type: Object },
  tracking: { type: String },
  status: { type: String, required: true },
  orderPrice: { type: Number, required: true },
  image: { type: String, required: true },
  size: { type: String, required: true },
  expectedDelivery: { type: String, required: true },
});

module.exports = mongoose.model("Order", orderSchema);
