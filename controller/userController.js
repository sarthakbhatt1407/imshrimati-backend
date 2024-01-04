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
  //   console.log(req.body);
  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();
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
      oredrs: [],
    });
    // console.log(createdUser);
    if (!validateEmail(email)) {
      return res.status(404).json({ message: "Invalid Email" });
    }
    try {
      await createdUser.save();
    } catch (err) {
      console.log(err);
      return res.status(403).json({ message: "Unable to register user." });
    }
    res.status(201).json({ message: "Sign up successful.." });
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
    return res.status(404).json({ message: "Invalid Credentials" });
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
        image: user.image,
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

const changeUserInfo = async (req, res, next) => {
  const { name, image, userId } = req.body;

  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      throw new Error();
    }
  } catch (error) {
    return res.status(400).json({ message: "Unable to find user" });
  }
  const imgPath = user.image;
  user.name = name;
  user.image = req.file.path;
  try {
    await user.save();
  } catch (error) {
    fs.unlink(req.file.path, (err) => {});
    return res.status(400).json({ message: "Unable to update" });
  }

  fs.unlink(imgPath, (err) => {});
  return res.status(200).json({ message: "Information Updated" });
};

exports.userRegistration = userRegistration;
exports.userLogin = userLogin;
exports.emailVerifier = emailVerifier;
exports.passwordReseter = passwordReseter;
exports.getAllUsers = getAllUsers;
exports.changeUserInfo = changeUserInfo;
