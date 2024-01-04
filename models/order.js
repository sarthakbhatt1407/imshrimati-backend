const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  userId: { type: String, required: true },
  address: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  itemId: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
