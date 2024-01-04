const mongoose = require("mongoose");

const itemSchema = mongoose.Schema({
  sku: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  fabric: { type: String, required: true },
  size: { type: String, required: true },
  details: { type: String, required: true },
  reviews: { type: Array, required: true },
  stock: { type: Number, required: true },
  images: { type: String },
  discount: { type: Number },
});

module.exports = mongoose.model("Item", itemSchema);
