const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: String, required: true },
  fabric: { type: String, required: true },
  size: { type: String, required: true },
  reviews: { type: Array, required: true },
  stock: { type: String, required: true },
  images: { type: String },
  discount: { type: String },
  slug: { type: String },
  metaTitle: { type: String },
  metaDesc: { type: String },
  metaKeywords: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: Boolean, required: true },
  color: { type: String, required: true },
});

module.exports = mongoose.model("Product", productSchema);
