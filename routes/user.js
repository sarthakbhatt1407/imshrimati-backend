const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

router.post("/signup", userController.userRegistration);
router.post("/login", userController.userLogin);
router.post("/admin-login", userController.adminLogin);
router.post("/add-address", userController.addressAdder);
router.post("/get-address", userController.getUserAddressByUserId);
router.post("/get-user", userController.getUserDetailsByUserId);
router.post("/verify-otp", userController.verifyOtp);
router.post("/forgot-verify-otp", userController.verifyForgotPassOtp);
router.post("/send-email", userController.sendEmailForOtp);
router.post("/forgot-send-email", userController.forgotPassOtpSender);
router.get("/all-users", userController.getAllUsers);
router.post("/reset-password", userController.passwordReseter);

module.exports = router;
