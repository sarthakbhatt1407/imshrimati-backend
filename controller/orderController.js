const Order = require("../models/order");
const Product = require("../models/item");
const { v4: uuidv4 } = require("uuid");
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dateFetcher = () => {
  const currentTime = new Date();

  const currentOffset = currentTime.getTimezoneOffset();

  const ISTOffset = 330; // IST offset UTC +5:30

  const date = new Date(
    currentTime.getTime() + (ISTOffset + currentOffset) * 60000
  );

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hrs = date.getHours();
  let min = date.getMinutes();
  let sec = date.getSeconds();

  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }
  if (hrs < 10) {
    hrs = "0" + hrs;
  }

  if (hrs < 10) {
    hrs = "0" + hrs;
  }
  if (min < 10) {
    min = "0" + min;
  }
  if (sec < 10) {
    sec = "0" + sec;
  }
  const fullDate = year + "-" + month + "-" + day;

  const time = hrs + ":" + min + ":" + sec;

  return { date: [year, months[month - 1], day], time: time };
};

const createNewOrder = async (req, res) => {
  const {
    userId,
    quantity,
    price,
    productId,
    shippingCharges,
    secretKey,
    paymentOrderId,
    orderPrice,
    image,
    size,
    expectedDelivery,
    orderTitle,
    category,
    slug,
    addressLine1,
    addressLine2,
    city,
    addressState,
    addressCountry,
    color,
    cityPincode,
    contactNum,
    fullName,
  } = req.body;

  const dateAndTime = dateFetcher();
  if (secretKey !== process.env.ORDER_CREATOR_SECRET_KEY) {
    return res.status(400).json({ message: "Request not allowed" });
  }
  const createdOrder = new Order({
    userId,
    quantity,
    price,
    orderPrice,
    productId,
    orderTitle,
    paymentStatus: "pending",
    shippingCharges,
    time: dateAndTime.time,
    day: dateAndTime.date[2],
    month: dateAndTime.date[1],
    year: dateAndTime.date[0],
    replacementStatus: false,
    replacement: { size: "", color: "", reason: "" },
    tracking: "",
    status: "pending",
    paymentOrderId,
    image,
    size,
    expectedDelivery,
    paymentMethod: "",
    deleted: false,
    category,
    slug,
    addressLine1,
    addressLine2,
    city,
    addressState,
    addressCountry,
    color,
    cityPincode,
    contactNum,
    fullName,
    fullAddress: [
      {
        fullName,
        addressLine1,
        addressLine2,
        city,
        addressState,
        addressCountry,
        contactNum,
      },
    ],
  });

  try {
    await createdOrder.save();
  } catch (error) {
    return res.status(200).json({ message: "Unable to order", error });
  }
  return res.status(200).json({
    message: "Ordered Successfully",
    createdOrder: createdOrder.toObject({ getters: true }),
  });
};

const orderPaymentUpdater = async (req, res) => {
  const { orderId, orderPaymentStatus, paymentMethod, productId, size } =
    req.body;
  let order;
  let product;
  try {
    product = await Product.findById(productId);
    if (!product) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "Product not found" });
  }
  try {
    order = await Order.findById(orderId);
    if (!order) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "No order found", error });
  }
  const stock = product.stock;
  if (
    paymentMethod === "Waiting for confirmation." &&
    orderPaymentStatus === true
  ) {
    order.paymentStatus = "Waiting for confirmation.";
    order.paymentMethod = paymentMethod;
    order.deleted = false;
  }

  if (
    orderPaymentStatus === true &&
    !(paymentMethod === "Waiting for confirmation.")
  ) {
    order.paymentStatus = "completed";
    order.paymentMethod = paymentMethod;
    order.deleted = false;
    const updatedStock = stock.map((obj) => {
      for (const key in obj) {
        if (key === size) {
          if (Number(obj[key]) > 0) {
            return { [key]: Number(obj[key]) - 1 };
          }
        }
      }
      return obj;
    });
    product.stock = updatedStock;
    console.log(updatedStock);
  }
  if (orderPaymentStatus === false) {
    order.paymentStatus = "failed";
    order.deleted = true;
  }
  try {
    order.markModified("paymentStatus");
    product.markModified("stock");
    order.markModified("deleted");
    order.markModified("paymentMethod");
    await product.save();
    await order.save();
  } catch (error) {
    return res.status(404).json({ message: "Unable to update", error });
  }
  return res
    .status(404)
    .json({ message: "order updated", status: order.paymentStatus });
};

const getOrderByUserId = async (req, res) => {
  const { userId } = req.params;

  let orders;
  try {
    orders = await Order.find({ userId: userId });
  } catch (error) {
    return res.status(404).json({ message: "No orders found", error });
  }
  return res.status(200).json({
    orders: orders.map((order) => {
      return order.toObject({ getters: true });
    }),
  });
};
const getOrderByOrderId = async (req, res) => {
  const { orderId } = req.params;

  let order;
  try {
    order = await Order.findById(orderId);
  } catch (error) {
    return res.status(404).json({ message: "No order found", error });
  }
  return res.status(200).json({
    order: order.toObject({ getters: true }),
  });
};

const editOrderByOrderId = async (req, res) => {
  const { orderId, size, color, reason } = req.body;
  let order;
  try {
    order = await Order.findById(orderId);
    if (!order) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "No order found", error });
  }
  const obj = {
    size,
    color,
    reason,
  };
  order.replacementStatus = true;
  order.replacement = obj;
  order.status = "pending";
  try {
    await order.save();
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong", error });
  }

  return res.status(200).json({ message: "Order updated succesfully", order });
};

const getAllOrders = async (req, res) => {
  let orders;
  try {
    orders = await Order.find({});

    if (orders.length == 0) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "No orders found", error });
  }
  return res.status(200).json({
    orders: orders.map((order) => {
      return order.toObject({ getters: true });
    }),
  });
};

const getTotalMonthlyPayment = async (req, res) => {
  const { month, action, day, year } = req.body;

  const allObj = {};
  if (action === "allDays") {
    for (let i = 31; i > 0; i--) {
      if (i < 10) {
        i = "0" + i;
      }
      allObj[i] = 0;
    }

    try {
      const obj = await Order.find({
        paymentStatus: "completed",
        month: month,
      });
      if (obj.length > 0) {
        for (const ord of obj) {
          let tmp = allObj[ord.day];
          allObj[ord.day] = Number(tmp) + Number(ord.orderPrice);
        }
      }
    } catch (error) {}

    return res.json(allObj);
  }
  if (action === "allMonths") {
    for (let i = 0; i < months.length; i++) {
      allObj[months[i]] = 0;
    }
    try {
      const obj = await Order.find({
        paymentStatus: "completed",
        year: year,
      });

      if (obj.length > 0) {
        for (const ord of obj) {
          let tmp = allObj[ord.month];

          allObj[ord.month] = Number(tmp) + Number(ord.orderPrice);
        }
      }
    } catch (error) {}
    return res.json(allObj);
  }
};

const trackingUpdater = async (req, res) => {
  const { orderId, action, tracking } = req.body;
  let order;
  try {
    order = await Order.findById(orderId);
    if (!order) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "No order found", error });
  }
  if (action === "replace") {
    order.replacementStatus = false;
  }
  order.tracking = tracking;
  order.status = "Completed";
  try {
    await order.save();
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong", error });
  }
  return res.status(201).json({ message: "order updated succesfully", order });
};

const orderCounter = async (req, res) => {
  const { day, month, year } = req.body;
  let todayOrders, thisMonthOrders, thisYearOrders, totalOrders;
  try {
    todayOrders = await Order.find({ paymentStatus: "completed", day });
    thisMonthOrders = await Order.find({ paymentStatus: "completed", month });
    thisYearOrders = await Order.find({ paymentStatus: "completed", year });
    totalOrders = await Order.find({ paymentStatus: "completed" });

    if (!todayOrders && !thisMonthOrders && !thisYearOrders) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong" });
  }
  return res.status(200).json({
    todayOrders: todayOrders,
    thisMonthOrders: thisMonthOrders,
    thisYearOrders: thisYearOrders,
    totalOrders: totalOrders,
  });
};

exports.createNewOrder = createNewOrder;
exports.getOrderByUserId = getOrderByUserId;
exports.editOrderByOrderId = editOrderByOrderId;
exports.getAllOrders = getAllOrders;
exports.getTotalMonthlyPayment = getTotalMonthlyPayment;
exports.trackingUpdater = trackingUpdater;
exports.orderPaymentUpdater = orderPaymentUpdater;
exports.getOrderByOrderId = getOrderByOrderId;
exports.orderCounter = orderCounter;
