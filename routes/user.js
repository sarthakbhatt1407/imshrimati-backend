const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

router.post("/signup", userController.userRegistration);
router.post("/login", userController.userLogin);
router.post("/add-address", userController.addressAdder);
router.post("/get-address", userController.getUserAddressByUserId);

module.exports = router;
