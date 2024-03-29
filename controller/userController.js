const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

let emailsOtp = [];
let forgotPassOtp = [];

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
    user: process.env.SMPT_EMAIL,
    pass: process.env.SMPT_PASS,
  },
});

const userRegistration = async (req, res, next) => {
  const { name, email, password, contactNum, isAdmin } = req.body;

  //
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();
  if (password.length < 6) {
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
      isAdmin: isAdmin ? true : false,
    });
    if (!validateEmail(email)) {
      return res.status(404).json({ message: "Invalid Email" });
    }
    try {
      await createdUser.save();
    } catch (err) {
      console.log(err);
      return res
        .status(403)
        .json({ message: "Unable to register user.", success: false });
    }
    res.status(200).json({
      message: "Sign up successful..",
      success: true,
    });
  }
};

const sendEmailForOtp = async (req, res) => {
  const date = new Date();

  const { email } = req.body;
  let user;
  try {
    user = await User.findOne({ email: email });

    if (user) {
      return res.status(400).json({ message: "Email already exists." });
    }
  } catch (error) {
    return res.json({ info, message: "Something went wrong" });
  }
  if (!email) {
    return res.status(400).json({ message: "email is invalid" });
  }
  const otp = Math.floor(100000 + Math.random() * 900000);
  const obj = {
    email,
    otp,
    verified: false,
    validity: date.setTime(date.getTime() + 1000 * 60),
  };
  const alreadyFound = emailsOtp.find((usr) => {
    return usr.email === email;
  });
  if (alreadyFound && alreadyFound.verified === true && user) {
    return res.json({ message: "Email already verfied" });
  }
  const alreadyFoundIndex = emailsOtp.findIndex((usr) => {
    return usr.email === email;
  });
  if (alreadyFound) {
    emailsOtp[alreadyFoundIndex] = obj;
  }

  if (!alreadyFound) {
    emailsOtp.push(obj);
  }

  // send mail with defined transport object
  let info;
  try {
    info = await transporter.sendMail({
      from: '"imshrimatiji" work.fusionavinya@gmail.com', // sender address
      to: `${email}`, // list of receivers
      subject: "Verification", // Subject line
      text: "Hello world?", // plain text body
      html: `<b>your otp is ${otp} </b>`, // html body
    });
  } catch (error) {
    return res.json({ info, message: "Unable to send", sent: false });
  }

  // console.log("Message sent: %s", info);
  return res.json({ info, message: "Otp sent to email", sent: true });
};
const verifyOtp = async (req, res) => {
  const { otpInp, email } = req.body;
  const date = new Date();
  const time = date.getTime();
  const alreadyFound = emailsOtp.find((usr) => {
    return usr.email === email;
  });
  if (alreadyFound) {
    const alreadyFoundIndex = emailsOtp.findIndex((usr) => {
      return usr.email === email;
    });
    if (alreadyFound.otp === otpInp && time <= alreadyFound.validity) {
      const obj = {
        ...alreadyFound,
        verified: true,
      };
      emailsOtp[alreadyFoundIndex] = obj;
      return res.status(400).json({ message: "Otp is Valid", valid: true });
    } else {
      return res
        .status(200)
        .json({ message: "Otp is invalid or expired", valid: false });
    }
  }
  if (!alreadyFound) {
    return res.status(200).json({ message: "Email not found" });
  }
};

const userLogin = async (req, res, next) => {
  const { email, password, contactNum } = req.body;
  let user;
  let passIsValid = false;
  if (contactNum && contactNum.length === 10) {
    try {
      user = await User.findOne({ contactNum: contactNum });
      if (!user) {
        throw new Error();
      }
    } catch (err) {
      return res.status(404).json({
        message: "Mobile number not found, Please Signup first",
        success: false,
      });
    }
    passIsValid = await bcrypt.compare(password, user.password);
    if (passIsValid) {
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
        success: true,
      });
    } else {
      return res
        .status(404)
        .json({ message: "Invalid Credentials", success: false });
    }
  }
  if (!validateEmail(email)) {
    return res.status(404).json({ message: "Invalid Email" });
  }
  try {
    user = await User.findOne({ email: email });
    if (!user) {
      throw new Error();
    }
  } catch (err) {
    return res.status(404).json({
      message: "Email not found, Please Signup first",
      success: false,
    });
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
      success: true,
    });
  } else {
    return res
      .status(404)
      .json({ message: "Invalid Credentials", success: false });
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
const adminLogin = async (req, res, next) => {
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
    return res.status(404).json({
      message: "Email not found, Please Signup first",
      success: false,
    });
  }
  if (!user.isAdmin) {
    return res
      .status(404)
      .json({ message: "User is not admin", success: false });
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
      success: true,
    });
  } else {
    return res
      .status(404)
      .json({ message: "Invalid Credentials", success: false });
  }
};

const forgotPassOtpSender = async (req, res) => {
  const date = new Date();

  const { email } = req.body;
  let user;
  try {
    user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Email not found. Please sign up first" });
    }
  } catch (error) {
    return res.json({ info, message: "Something went wrong" });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "email is invalid" });
  }
  const otp = Math.floor(100000 + Math.random() * 900000);
  const obj = {
    email,
    otp,
    verified: false,
    validity: date.setTime(date.getTime() + 1000 * 60),
  };
  const alreadyFound = forgotPassOtp.find((usr) => {
    return usr.email === email;
  });

  const alreadyFoundIndex = forgotPassOtp.findIndex((usr) => {
    return usr.email === email;
  });
  if (alreadyFound) {
    forgotPassOtp[alreadyFoundIndex] = obj;
  }

  if (!alreadyFound) {
    forgotPassOtp.push(obj);
  }

  // send mail with defined transport object
  let info;
  try {
    info = await transporter.sendMail({
      from: '"imshrimatiji" work.fusionavinya@gmail.com', // sender address
      to: `${email}`, // list of receivers
      subject: "Password reset", // Subject line
      text: "Hello world?", // plain text body
      html: `<b>your otp for resetting password is ${otp}. Otp is valid for only 15 minutes.</b>`, // html body
    });
  } catch (error) {
    return res.json({ info, message: "Unable to send", sent: false });
  }

  // console.log("Message sent: %s", info);
  return res.json({ info, message: "Otp sent to email", sent: true });
};

const verifyForgotPassOtp = async (req, res) => {
  const { otpInp, email } = req.body;
  const date = new Date();
  const time = date.getTime();
  const alreadyFound = forgotPassOtp.find((usr) => {
    return usr.email === email;
  });
  if (alreadyFound) {
    if (alreadyFound.otp === otpInp && time <= alreadyFound.validity) {
      const arr = forgotPassOtp.filter((item) => {
        return item.email != email;
      });
      forgotPassOtp = arr;
      return res.status(400).json({ message: "Otp is Valid", valid: true });
    } else {
      return res
        .status(200)
        .json({ message: "Otp is invalid or expired", valid: false });
    }
  }
  if (!alreadyFound) {
    return res.status(200).json({ message: "Email not found. Please Retry." });
  }
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
exports.sendEmailForOtp = sendEmailForOtp;
exports.forgotPassOtpSender = forgotPassOtpSender;
exports.verifyForgotPassOtp = verifyForgotPassOtp;
exports.adminLogin = adminLogin;
