const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
const userRegistration = async (req, res, next) => {
  const { name, email, password, contactNum } = req.body;
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
    res.json({
      user: {
        name: user.name,
        email: user.email,
        id: user.id,
      },
      message: "Logged In",
      isloggedIn: true,
      token: token,
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

exports.userRegistration = userRegistration;
exports.userLogin = userLogin;
exports.emailVerifier = emailVerifier;
exports.passwordReseter = passwordReseter;
exports.getAllUsers = getAllUsers;
