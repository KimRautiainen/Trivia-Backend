"use strict";
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { login, logout } = require("../controllers/authController");
const { postUser } = require("../controllers/userController");
const handleUserUpload = require("../middleware/uploadMiddleware");


router.post(
  "/login",
  [
    body("username", "Username is required").not().isEmpty(),
    body("password", "Password must be at least 5 characters long").isLength({
      min: 5,
      max: 30,
    }),
  ],
  login
);

router.get("/logout", logout);

router.post("/register", handleUserUpload, postUser);

module.exports = router;
