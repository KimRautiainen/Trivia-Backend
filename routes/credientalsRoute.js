"use strict";
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
// Check if username is taken
router.get("/username", userController.checkUsername);
router.get("/email", userController.checkEmail);

module.exports = router;