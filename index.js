// modules
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 5000;
//  CORS
app.use("/images", express.static("images"));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

// Routes
const userRoute = require("./routes/user");
const itemRoute = require("./routes/item");
const orderRoute = require("./routes/order");
const categoryRoute = require("./routes/category");
const paymentRoute = require("./routes/payment");
// const auth = require("./middleware/auth");

// Routes Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/user", userRoute);
app.use("/order", orderRoute);
// app.use(auth)
app.use("/product", itemRoute);
app.use("/category", categoryRoute);
app.use("/payment", paymentRoute);

// Database

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log("Connection successful");
    });
  })
  .catch((err) => {
    console.log("Connection Failed!");
  });
