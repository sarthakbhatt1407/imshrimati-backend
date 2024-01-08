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
  });
  //   return res.json(createdOrder);
  try {
    await createdOrder.save();
  } catch (error) {
    return res.status(200).json({ message: "Unable to order" });
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

exports.createNewOrder = createNewOrder;
exports.getOrderByUserId = getOrderByUserId;
