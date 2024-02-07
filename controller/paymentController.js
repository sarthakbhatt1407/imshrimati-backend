const Razorpay = require("razorpay");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

const paymentVerifier = async (req, res) => {
  const id = req.params.id;
  try {
    const pay = await razorpayInstance.payments.all({ count: 100 });
    const orderPaymentInfo = pay.items.find((item) => {
      return item.order_id === id;
    });
    if (orderPaymentInfo) {
      return res.status(200).json(orderPaymentInfo);
    } else {
      return res.status(200).json({ captured: false, id });
    }
  } catch (error) {
    // return res.status(400).json({ message: "No payment found", error });
  }
};
const createOrder = async (req, res) => {
  try {
    const amount = req.body.amount * 100;
    const options = {
      amount: amount,
      currency: "INR",
      receipt: "razorUser@gmail.com",
    };

    razorpayInstance.orders.create(options, (err, order) => {
      if (!err) {
        res.status(200).send({
          success: true,
          msg: "Order Created",
          order_id: order.id,
          amount: amount,
          contact: req.body.userContact,
          name: req.body.userName,
          email: req.body.userEmail,
        });
      } else {
        res.status(400).send({ success: false, msg: "Something went wrong!" });
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  createOrder,
  paymentVerifier,
};
