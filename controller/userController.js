const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

let emailsOtp = [];

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
const nodemailer = require("nodemailer");
const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMSMPT_EMAIL,
    pass: process.env.SMPT_PASS,
  },
});

const userRegistration = async (req, res, next) => {
  const { name, email, password, contactNum } = req.body;

  //
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();
  if (password.length < 8) {
    return res.status(400).json({ message: "Password length is too short.." });
  }
  if (contactNum.length < 10) {
    return res.status(400).json({ message: "Invalid Contact Number.." });
  }
  const hashedPass = await bcrypt.hash(password, 12);
  let user = await User.findOne({ email: email });
  if (user && user.email === email) {
    return res.status(400).json({ message: "Email already exists." });
  } else {
    const createdUser = new User({
      name,
      email,
      password: hashedPass,
      contactNum,
      userSince: months[month] + " " + year,
      address: [],
      wishlist: [],
      status: true,
    });
    if (!validateEmail(email)) {
      return res.status(404).json({ message: "Invalid Email" });
    }
    try {
      await createdUser.save();
    } catch (err) {
      console.log(err);
      return res.status(403).json({ message: "Unable to register user." });
    }
    res.status(201).json({
      message: "Sign up successful..",
    });
  }
};

const sendEmail = async (req, res) => {
  const date = new Date();

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "email is invalid" });
  }
  const otp = Math.floor(100000 + Math.random() * 900000);
  const obj = {
    email,
    otp,
    verfied: false,
    validity: date.setTime(date.getTime() + 1000 * 60),
  };
  const alreadyFound = emailsOtp.find((usr) => {
    return usr.email === email;
  });
  if (alreadyFound) {
    const updaatedEmailOtp = emailsOtp.map((usr) => {
      if (alreadyFound.email === usr.email) {
        usr.otp = otp;
        usr.validity = date.setTime(date.getTime() + 1000 * 60);
        return usr;
      }
      return usr;
    });
    emailsOtp = updaatedEmailOtp;
  }
  if (!alreadyFound) {
    emailsOtp.push(obj);
  }

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"imshrimatiji" work.fusionavinya@gmail.com', // sender address
    to: `${email}`, // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: `<b>your otp is ${otp} </b>`, // html body
  });

  // console.log("Message sent: %s", info);
  return res.json({ otp, info, message: "send" });
};
const verifyOtp = async (req, res) => {
  const { otpInp } = req.body;
  if (otp !== otpInp) {
    return res.status(400).json({ message: "Otp is invalid" });
  }
  return res.status(200).json({ message: "Otp is valid" });
};

const userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  let passIsValid = false;
  if (!validateEmail(email)) {
    return res.status(404).json({ message: "Invalid Email" });
  }
  try {
    user = await User.findOne({ email: email });
    if (!user) {
      throw new Error();
    }
  } catch (err) {
    return res
      .status(404)
      .json({ message: "Email not found, Please Signup first" });
  }

  passIsValid = await bcrypt.compare(password, user.password);
  if (user && email === user.email && passIsValid) {
    token = jwt.sign({ userId: user.id, userEmail: email }, "secret_key");

    user.password = "Keep Guessing";
    return res.status(201).json({
      user: {
        name: user.name,
        email: user.email,
        id: user.id,
        contact: user.contactNum,
        address: user.address,
        userSince: user.userSince,
      },
      message: "Logged In",
      isloggedIn: true,
      token: user.isAdmin === true ? token : "",
    });
  } else {
    res.status(404).json({ message: "Invalid Credentials" });
  }
};

const emailVerifier = async (req, res, next) => {
  const { email } = req.body;
  let user;
  try {
    user = await User.findOne({ email: email });
    if (!user) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({ message: "User Not Found" });
  }
  if (user && user.email === email) {
    return res.status(200).json({ emailVerified: true });
  }
};

const passwordReseter = async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  try {
    user = await User.findOne({ email: email });
    if (!user) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({ message: "User Not Found" });
  }
  const hashedPass = await bcrypt.hash(password, 12);
  user.password = hashedPass;
  try {
    await user.save();
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Unable to change password ! Please try again later." });
  }
  res.status(201).json({ message: "Password Changed" });
};

const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
    if (!users) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({ message: "No Users FOund" });
  }
  users = users.map((user) => {
    return user.toObject({ getters: true });
  });
  res.status(200).json(users);
};

const addressAdder = async (req, res) => {
  const {
    userId,
    fullName,
    addressLine1,
    addressLine2,
    city,
    cityPincode,
    addressState,
    addressCountry,
    contactNum,
  } = req.body;
  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      throw new Error();
    }
  } catch (err) {
    return res
      .status(404)
      .json({ message: "User not found, Please Signup first" });
  }
  const address = user.address;
  const alreadyFound = address.find((add) => {
    if (
      add.fullName === fullName &&
      add.addressLine1 === addressLine1 &&
      add.addressLine2 === addressLine2 &&
      add.city === city &&
      add.cityPincode === cityPincode &&
      add.addressState === addressState
    ) {
      return add;
    }
  });
  if (alreadyFound) {
    return res.status(404).json({ message: "Address already uploaded!" });
  }
  const obj = {
    addressId: uuidv4(),
    fullName,
    addressLine1,
    addressLine2,
    city,
    cityPincode,
    addressState,
    addressCountry,
    contactNum,
  };

  address.push(obj);
  user.address = address;
  try {
    await user.save();
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong" });
  }
  return res.status(200).json({ message: "Address added" });
};

const getUserAddressByUserId = async (req, res) => {
  const userId = req.body.userId;
  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      throw new Error();
    }
  } catch (err) {
    return res
      .status(404)
      .json({ message: "User not found, Please Signup first" });
  }
  return res.status(200).json({ address: user.address });
};

const getUserDetailsByUserId = async (req, res) => {
  const { userId } = req.body;
  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "No user found" });
  }
  return res.status(200).json({
    name: user.name,
    email: user.email,
    id: user.id,
    contact: user.contactNum,
    address: user.address,
    userSince: user.userSince,
  });
};
exports.userRegistration = userRegistration;
exports.userLogin = userLogin;
exports.emailVerifier = emailVerifier;
exports.passwordReseter = passwordReseter;
exports.getAllUsers = getAllUsers;
exports.addressAdder = addressAdder;
exports.getUserAddressByUserId = getUserAddressByUserId;
exports.getUserDetailsByUserId = getUserDetailsByUserId;
exports.verifyOtp = verifyOtp;
exports.sendEmail = sendEmail;
