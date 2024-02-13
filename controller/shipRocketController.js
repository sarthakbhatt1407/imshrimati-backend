let token = "";
const tokenFetcher = async () => {
  try {
    const tokenRes = await fetch(
      `https://apiv2.shiprocket.in/v1/external/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "sarthakbhattsb1407@gmail.com",
          password: "123456@Sb38",
        }),
      }
    );
    if (!tokenRes.ok) {
      throw new Error();
    }
    const tokenData = await tokenRes.json();
    token = tokenData.token;
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong..", error });
  }
};
tokenFetcher();
const deliveryChecker = async (req, res) => {
  const { pinCode } = req.body;

  try {
    const reslt = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?delivery_postcode=${pinCode}&pickup_postcode=248001&cod=1&weight=0.5`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const resData = await reslt.json();

    if (!reslt.ok) {
      return res
        .status(400)
        .json({ message: "Delivery not available", available: false });
    }
    if (reslt.ok) {
      return res.status(400).json({
        message: "Delivery available",
        available: true,
        city: resData.data.available_courier_companies[0].city,
        data: resData.data.available_courier_companies,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "Something went wrong..", error, available: false });
  }
};

const createNewOrder = async (req, res) => {
  const obj = req.body;
  let resData;
  try {
    const reslt = await fetch(
      `https://apiv2.shiprocket.in/v1/external/orders/create/adhoc`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...obj, pickup_location: "Primary" }),
      }
    );

    resData = await reslt.json();
    if (reslt.ok) {
      return res.status(400).json({ resData, message: "Order Created" });
    }
    if (!reslt.ok) {
      return res
        .status(400)
        .json({ resData, message: "Something went wrong.." });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong..", error });
  }
};

const orderCanceller = async (req, res) => {
  const { ids } = req.body;
  try {
    const reslt = await fetch(
      `https://apiv2.shiprocket.in/v1/external/orders/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids }),
      }
    );
    const resData = await reslt.json();
    if (reslt.ok) {
      return res.status(400).json({ resData, message: "Order Cancelled" });
    }
    if (!reslt.ok) {
      return res
        .status(400)
        .json({ resData, message: "Something went wrong.." });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong..", error });
  }
};

exports.deliveryChecker = deliveryChecker;
exports.createNewOrder = createNewOrder;
exports.orderCanceller = orderCanceller;

// const reslt = await fetch(
//     `https://apiv2.shiprocket.in/v1/external/orders/cancel`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(obj),
//     }
//   );
//   const resData = await reslt.json();
//  return res.status(400).json({ message: "Something went wrong..", error });
