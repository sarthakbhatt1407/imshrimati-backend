const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  image: { type: String, required: true },
  content: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
