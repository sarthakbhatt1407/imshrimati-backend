const Order = require("../models/order");
const { v4: uuidv4 } = require("uuid");

const dateFetcher = () => {
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
    address,
    quantity,
    price,
    productId,
    paymentMethod,
    paymentStatus,
    shippingCharges,
    gatewayCharges,
  } = req.body;
  const dateAndTime = dateFetcher();
  const createdOrder = new Order({
    userId,
    address,
    quantity,
    price,
    productId,
    paymentMethod,
    paymentStatus,
    shippingCharges,
    gatewayCharges,
    time: dateAndTime.time,
    day: dateAndTime.date[2],
    month: dateAndTime.date[1],
    year: dateAndTime.date[0],
    replacementStatus: false,
    replacement: { size: "", color: "", reason: "" },
    tracking: "",
    status: "Pending",
  });
  //   return res.json(createdOrder);
  try {
    await createdOrder.save();
  } catch (error) {
    return res.status(200).json({ message: "Unable to order", error });
  }
  return res
    .status(200)
    .json({ message: "Ordered Successfully", createdOrder });
};

const getOrderByUserId = async (req, res) => {
  const { userId } = req.body;
  let orders;
  try {
    orders = await Order.find({ userId: userId });

    if (orders.length == 0) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "No orders found" });
  }
  return res.status(200).json({
    orders: orders.map((order) => {
      return order.toObject({ getters: true });
    }),
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
    return res.status(404).json({ message: "No order found" });
  }
  const obj = {
    size,
    color,
    reason,
  };
  order.replacementStatus = true;
  order.replacement = obj;
  order.status = "Pending";
  try {
    await order.save();
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong" });
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
    return res.status(404).json({ message: "No orders found" });
  }
  return res.status(200).json({
    orders: orders.map((order) => {
      return order.toObject({ getters: true });
    }),
  });
};

const getTotalMonthlyPayment = async (req, res) => {
  const { month, action, day, year } = req.body;
  let totalSales = 0;
  let orders;
  if (action === "monthly") {
    try {
      orders = await Order.find({ month: month });

      if (orders.length == 0) {
        throw new Error();
      }
    } catch (error) {
      return res.status(404).json({ message: "No orders found" });
    }
  }
  if (action === "daily") {
    try {
      orders = await Order.find({ day: day });

      if (orders.length == 0) {
        throw new Error();
      }
    } catch (error) {
      return res.status(404).json({ message: "No orders found" });
    }
  }
  if (action === "yearly") {
    try {
      orders = await Order.find({ year: year });

      if (orders.length == 0) {
        throw new Error();
      }
    } catch (error) {
      return res.status(404).json({ message: "No orders found" });
    }
  }
  return res.status(200).json({
    orders: orders.map((order) => {
      totalSales += order.price * order.quantity;
      return order.toObject({ getters: true });
    }),
    totalSales,
  });
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
    return res.status(404).json({ message: "No order found" });
  }
  if (action === "replace") {
    order.replacementStatus = false;
  }
  order.tracking = tracking;
  order.status = "Completed";
  try {
    await order.save();
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong" });
  }
  return res.status(201).json({ message: "order updated succesfully", order });
};

exports.createNewOrder = createNewOrder;
exports.getOrderByUserId = getOrderByUserId;
exports.editOrderByOrderId = editOrderByOrderId;
exports.getAllOrders = getAllOrders;
exports.getTotalMonthlyPayment = getTotalMonthlyPayment;
exports.trackingUpdater = trackingUpdater;
