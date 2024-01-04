const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  contactNum: { type: Number, required: true },
  userSince: { type: String },
  orders: { type: Array, required: true },
});

module.exports = mongoose.model("User", userSchema);
