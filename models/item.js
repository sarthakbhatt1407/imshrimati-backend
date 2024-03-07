const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  fabric: { type: String, required: true },
  stock: { type: Array, required: true },
  images: { type: String, required: true },
  discount: { type: Number },
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
